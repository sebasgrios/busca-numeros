---
title: Estado y persistencia
summary: GameStateProvider (single-player), store externo con useSyncExternalStore, RoomProvider (multijugador con PartySocket), persistencia en localStorage e hidratación sin mismatch.
tags: [state, store, useSyncExternalStore, localStorage, persistence, hydration, ssr, provider, room]
---

# Estado y persistencia

## Single-player: store externo

El estado SP usa **`useSyncExternalStore`** sobre un store vanilla (`lib/game-store.ts`), no Context React. Esto es deliberado por dos razones:

1. **Evitar mismatch de hidratación SSR ↔ cliente**: con `useSyncExternalStore` + `getServerSnapshot` se renderiza un snapshot estable en SSR y, tras hidratar, React re-renderiza con el snapshot real cargado desde `localStorage`. No genera warning de mismatch.
2. **Centralizar mutaciones**: cualquier acción (toggleDark, registerWin, etc.) muta el store y notifica a todos los subscribers de una vez.

### `lib/game-store.ts`

Estado:

```ts
interface AppState {
  records: GameRecord[];
  played: number;
  settings: {
    sound: boolean;
    haptic: boolean;
    dark: boolean;
    game: GameConfig;     // cols, mode, duration
  };
}
```

Operaciones internas:

```ts
let state: AppState = defaultState();
let hydrated = false;
const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  if (!hydrated) {
    hydrated = true;
    const loaded = loadState();      // localStorage
    if (loaded !== state) state = loaded;
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): AppState { return state; }
function getServerSnapshot(): AppState { return SERVER_STATE; }  // ref estable
```

Acciones (mutate + persist + emit):

- `updateSettings(patch)`
- `updateGame(patch)`
- `toggleDark()`
- `registerWin({time, wrong, config, remaining})` → calcula rank, isRecord, mantiene top 20 por config, retorna `WinInfo`.
- `registerLoss()` → solo incrementa `played`.
- `clearRecords()`

### `components/providers/game-state-provider.tsx`

Provider muy delgado. Su único trabajo es:

1. Suscribirse al store y exponer `state` + acciones via hook `useGameState()`.
2. Aplicar **side effects globales** que dependen del estado:
   - `<html data-theme="dark|light">` según `settings.dark`.
   - `<meta name="theme-color" content="#FFF3DE|#1A1430">` dinámico.
   - `getSfx().enabled = settings.sound`.

Estos side effects son **legítimos sync con sistemas externos** (DOM/Web Audio), no setState — no triggerean `react-hooks/set-state-in-effect`.

```tsx
const { state, updateSettings, updateGame, toggleDark, registerWin, ... } = useGameState();
```

### Persistencia

`lib/storage.ts`:

```ts
const STORAGE_KEY = "buscanumeros:v1";
const DEFAULT_GAME = { cols: 10, mode: "countdown", duration: 300 };

loadState(): AppState                  // lee localStorage, hace defensive merge
saveState(state: AppState): void       // try/catch silencioso
```

El store llama `saveState(state)` en cada mutación (`set()` interno). En SSR `loadState` devuelve `freshState()` (window undefined).

## Identidad (multijugador)

`lib/multiplayer/identity.ts` persiste el nombre del jugador en `localStorage`:

```ts
const NAME_KEY = "buscanumeros:name";

getStoredName(): string                 // "" si no hay
setStoredName(name: string): void
PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999"
```

`NameModal` lo lee al montar y lo guarda al confirmar.

## Multijugador: RoomProvider + PartySocket

`components/providers/room-provider.tsx` envuelve toda la conexión WebSocket con el servidor de salas. A diferencia del SP, **sí usa Context** (no `useSyncExternalStore`) porque el estado de sala es local al ciclo de vida del componente — no se persiste entre sesiones, no se hidrata desde SSR.

### Estructura

```ts
interface RoomContextValue {
  code: string | null;
  snapshot: RoomSnapshot | null;  // estado autoritativo del servidor
  youId: string | null;            // id de tu conexión (devuelto por el server)
  you: PlayerView | null;          // tu jugador dentro de snapshot.players
  isHost: boolean;
  connStatus: "idle" | "connecting" | "connected" | "closed";
  error: { code: ErrorCode; message: string } | null;
  peekResult: JoinAvailability | null;

  // control
  connect: (code: string) => void;
  peekRoom: (code: string) => Promise<JoinAvailability>;
  disconnect: () => void;
  clearError: () => void;

  // acciones (envían mensajes al servidor)
  create: (name, config) => void;
  peek: () => void;
  join: (name) => void;
  setConfig: (config) => void;
  start: () => void;
  sendProgress: (progress) => void;
  sendFinished: (time) => void;
  sendEliminated: (progress, reason) => void;
  toggleRematch: () => void;
  leave: () => void;
  close: () => void;
}
```

### Conexión con `partysocket`

```ts
const socket = new PartySocket({ host: PARTYKIT_HOST, room: code });
socket.addEventListener("message", (e) => {
  const msg = decode<ServerMessage>(e.data as string);
  switch (msg.type) {
    case "snapshot": setSnapshot(msg.room); setYouId(msg.you); break;
    case "peek":     setPeekResult(msg.availability); ... break;
    case "error":    setError({...}); break;
    case "closed":   setSnapshot(null); setConnStatus("closed"); break;
  }
});
```

`partysocket` envuelve `WebSocket` con reconexión y **buffer de mensajes pre-`open`**: las acciones llamadas inmediatamente tras `connect()` no se pierden, se encolan hasta que la conexión esté abierta.

### `peekRoom` (validación previa)

Para validar un código antes de pedir el nombre (flujo de unirse) sin abrir un join completo:

```ts
peekRoom(code) returns Promise<JoinAvailability>
```

Internamente conecta + envía `peek` y resuelve la promesa cuando llega la respuesta. Timeout de 5s → `not_found`. Esto evita coordinación por efectos (que tendrían que usar `setState` en `useEffect` y violarían la regla `react-hooks/set-state-in-effect`).

## Hooks compartidos

### `hooks/use-now.ts`

```ts
useNow(active: boolean): number
```

Tickea `Date.now()` cada frame vía `requestAnimationFrame` mientras `active === true`. Cuando `active` cambia a `false`, deja de actualizar. Se usa en `GameScreen` para el timer:

```ts
const active = started && pausedAt === 0;
const now = useNow(active);
const elapsed = started ? now - startTime : 0;
```

### `hooks/use-client-value.ts`

```ts
useClientValue<T>(factory: () => T): T | null
```

Devuelve `null` en el primer render (servidor y montaje) y el resultado de `factory()` después. Útil para valores no-deterministas (Math.random, Date.now, window.location) que provocarían mismatch SSR si se calcularan durante el render.

Casos en el repo:

- `home-screen.tsx` — `sample = useClientValue(() => shuffle(LOGO_SEED).slice(0, 9))`.
- `confetti.tsx` — array de partículas con posiciones aleatorias.
- `app-shell.tsx` — leer `?join=CODE` del URL.

Internamente hace `setValue(factory())` en `useEffect([])` con dos `eslint-disable-next-line` justificados (set-state-in-effect + exhaustive-deps). Es la excepción documentada.

## Reglas estrictas de React 19 que ha tocado este proyecto

| Regla                                | Cómo se ha respetado                                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-hooks/set-state-in-effect`    | Para hidratar localStorage se usa `useSyncExternalStore` (no setState en effect). Para `useClientValue` se aplica disable con comentario justificando init única.    |
| `react-hooks/refs`                   | No leer `ref.current` en render. Sustituido `useRef(Date.now())` por `useState(0)` + setter en `GameScreen` (`startTime` debe poder cambiarse al fin del countdown). |
| `react-hooks/purity`                 | `Math.random`/`Date.now` directos en `useMemo` están prohibidos. Se mueven a `useClientValue` (factory en effect).                                                  |
| `react-hooks/exhaustive-deps`        | Se respetan todas las deps; cuando hay rebase manual de un effect, se disable con comentario y razón.                                                                |

Más detalles en [`gotchas.md`](./gotchas.md).
