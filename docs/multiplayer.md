---
title: Multijugador
summary: Arquitectura realtime con PartyKit/Durable Objects, protocolo cliente↔servidor, lifecycle de sala, podio vs duelo, revancha, traspaso de liderazgo. Cómo añadir o modificar el flujo Retar.
tags: [multiplayer, partykit, websockets, durable-objects, protocol, room, server, peer, rematch, duel, podium, host]
---

# Multijugador

> Este documento aplica solo a la rama **`multiplayer`**. En `main`/`develop` el flujo de Retar está oculto (`comingSoon`) y no se importa nada de `lib/multiplayer` ni de `party/` en runtime.

## Arquitectura

```
Browser (PartySocket WebSocket)
    │
    │  wss://buscanumeros.<user>.partykit.dev/parties/main/<CODE>
    ▼
Cloudflare Durable Object (1 instancia por sala/CODE)
    │
    ├── persistencia en this.room.storage (SQLite)
    └── broadcast a todas las conexiones de la sala
```

- Frontend: `partysocket` cliente conectado a un host PartyKit.
- Backend: `party/game-room.ts` ejecutado como **Durable Object** (1 instancia por sala). El servidor mantiene el estado autoritativo (jugadores, podio, semilla del tablero, etc.) y hace broadcast a todos los clientes en cada cambio.
- Identidad: cada conexión tiene un `connection.id` único. El jugador "es" su connection; al reconectar se le asigna nuevo id (se trata como nuevo jugador). Esto es deliberado para mantener el servidor simple.

## Protocolo (`lib/multiplayer/protocol.ts`)

Tipos compartidos cliente↔servidor (single source of truth).

### Constantes

```ts
const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;
const PLAYER_COLORS = ["rojo", "cian", "amarillo", "lima"];
const COLOR_HEX = { rojo: "#FF5C72", cian: "#39C5D4", amarillo: "#FFC93C", lima: "#9BE15D" };
```

### Tipos

```ts
type BoardMode = "shared" | "independent";
type RoomStatus = "lobby" | "playing" | "finished";
type PlayerRoundStatus = "idle" | "playing" | "finished" | "eliminated";
type LoseReason = "mistake" | "timeout";

interface RoomConfig {
  cols: number;        // 5 | 7 | 10
  mode: GameMode;      // "countdown" | "classic" | "relax"
  duration: number;    // segundos
  capacity: number;    // siempre 4 (ya no se expone en UI)
  board: BoardMode;
}

interface PlayerView {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  progress: number;             // celdas completadas en la ronda actual
  status: PlayerRoundStatus;
  rematchReady: boolean;
}

interface PodiumEntry {
  id: string;
  name: string;
  color: PlayerColor;
  place: number;
  progress: number;
  time: number | null;          // ms si completó la tabla
  reason: LoseReason | null;
}

interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string | null;
  config: RoomConfig;
  players: PlayerView[];        // orden de unión
  seed: number | null;          // semilla compartida si board === "shared"
  round: number;
  startedAt: number | null;
  total: number;                // cols * cols
  podium: PodiumEntry[] | null;
}
```

### Mensajes

```ts
// Cliente → Servidor
type ClientMessage =
  | { type: "create"; name: string; config: RoomConfig }
  | { type: "peek" }
  | { type: "join"; name: string }
  | { type: "config"; config: Partial<RoomConfig> }    // solo host, solo lobby
  | { type: "start" }                                   // solo host
  | { type: "progress"; progress: number }
  | { type: "finished"; time: number }
  | { type: "eliminated"; progress: number; reason: LoseReason }
  | { type: "rematch" }                                 // toggle ready
  | { type: "leave" }
  | { type: "close" };                                  // solo host: destruye sala

// Servidor → Cliente
type ServerMessage =
  | { type: "snapshot"; room: RoomSnapshot; you: string }
  | { type: "peek"; availability: JoinAvailability; code: string }
  | { type: "error"; code: ErrorCode; message: string }
  | { type: "closed" };

type JoinAvailability = "joinable" | "not_found" | "full" | "in_progress";
type ErrorCode = "room_full" | "not_found" | "already_started" | "name_required" | "already_initialized";
```

Codificación: `JSON.stringify`/`JSON.parse` envuelto en `encode()`/`decode()`.

### Generación de código

```ts
function generateRoomCode(): string {  // 4 chars sin ambigüedades
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";  // no I, O, 0, 1
  return [0,0,0,0].map(() => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}
```

## Servidor de sala (`party/game-room.ts`)

`GameRoom` es una clase con métodos del PartyKit `Party.Server`. Una instancia por sala (room id = código).

### Estado interno

```ts
interface RoomState {
  initialized: boolean;
  hostId: string | null;
  status: RoomStatus;
  config: RoomConfig;
  players: PlayerView[];        // orden de llegada
  seed: number | null;
  round: number;
  startedAt: number | null;
  podium: PodiumEntry[] | null;
}
```

Se persiste en `this.room.storage.put("state", state)` tras cada cambio. `onStart()` lo carga.

### Lifecycle de mensajes

| Mensaje                | Quién  | Cuándo                            | Efecto                                                                                                  |
| ---------------------- | ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `create`               | host   | sala no inicializada              | `initialized=true`, set hostId, set config, añade host como primer jugador con color asignado.          |
| `peek`                 | guest  | antes de join                     | responde `joinable` / `not_found` / `full` / `in_progress`.                                             |
| `join`                 | guest  | sala lobby o finished, no llena   | añade jugador con color libre.                                                                          |
| `config`               | host   | lobby                             | merge parcial del config; capacity se clampa a [MIN, MAX], cols a [5,7,10], mode válido.                |
| `start`                | host   | lobby o finished, ≥ MIN_PLAYERS   | inicia ronda: status=playing, round++, seed (si shared), startedAt=Date.now, reset players (progress=0). |
| `progress`             | any    | playing                           | actualiza `players[i].progress`.                                                                        |
| `finished`             | any    | playing                           | marca player como `finished` con time, **termina la ronda al primer ganador** → endRound.               |
| `eliminated`           | any    | playing                           | marca player como `eliminated`. Si no queda nadie jugando → endRound con winner=null.                   |
| `rematch`              | any    | finished                          | toggle de `rematchReady`.                                                                               |
| `leave` / `onClose`    | any    | en cualquier momento              | removePlayer: borra, **leader handoff**, si quedan 0 jugadores → reset state.                           |
| `close`                | host   | en cualquier momento              | broadcast `closed`, reset state.                                                                        |

Tras cada mutación: `broadcastSnapshot()` → todos los clientes reciben `snapshot` con su `you` (su connection id) — útil para que el cliente sepa quién es dentro de `players`.

### Asignación de color

```ts
private pickColor(): PlayerColor {
  const used = new Set(state.players.map(p => p.color));
  const free = PLAYER_COLORS.filter(c => !used.has(c));
  const pool = free.length ? free : PLAYER_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}
```

Aleatorio sin repetir mientras haya colores libres. Con capacity ≤ 4 nunca falta uno.

### endRound (cuando alguien gana o todos quedan eliminados)

```ts
private endRound(winnerId: string | null, winnerTime: number | null) {
  state.status = "finished";
  const finishers = state.players.filter(p => p.id === winnerId);
  const rest = state.players
    .filter(p => p.id !== winnerId)
    .sort((a, b) => b.progress - a.progress);
  const ordered = [...finishers, ...rest];

  state.podium = ordered.map((p, i) => ({
    id: p.id, name: p.name, color: p.color,
    place: i + 1,
    progress: p.progress,
    time: p.id === winnerId ? winnerTime : null,
    reason: null,
  }));

  // Quien estuviera "playing" pasa a "eliminated" (corte de ronda).
  for (const p of state.players) {
    if (p.status === "playing") p.status = "eliminated";
  }
}
```

### Traspaso de liderazgo

`removePlayer(id)`:

```ts
const wasHost = state.hostId === id;
state.players.splice(idx, 1);
if (state.players.length === 0) { resetState(); return; }
if (wasHost) state.hostId = state.players[0].id;   // siguiente por orden de llegada
```

Si el ex-host se va durante `playing` y queda algún jugador, la ronda continúa con el nuevo host. Si la salida deja la ronda sin jugadores activos → `endRound`.

## Cliente: ChallengeFlow (orquestador)

`components/screens/challenge/challenge-flow.tsx` decide qué pantalla/modal mostrar basándose en:

1. ¿Estoy ya dentro de una sala? (`room.you && room.snapshot`) → ramificar por `snapshot.status`.
2. Si no, ¿en qué paso del flujo local estoy? (`phase: "choice" | "create" | "join"`).

Ver árbol completo de estados en [`screens-and-flows.md`](./screens-and-flows.md).

### Estados transitorios manejados en el cliente

- `confirmLeave` — modal genérico "¿Salir de la partida?" (no anfitrión, in-game, podio/duelo).
- `closing` — modal "¿Cerrar la partida?" (solo anfitrión en lobby).
- `hadCompanions` — latch para detectar "te has quedado solo" (`AbandonedModal`). Solo se activa al ver ≥ 2 jugadores; se desactiva al volver a choice.

### Detección de "te has quedado solo"

```ts
const showAbandoned =
  !!snapshot && !!you && hadCompanions &&
  snapshot.players.length === 1 &&
  snapshot.players[0].id === youId &&
  !confirmLeave;     // no si tú eres quien está saliendo
```

Tiene prioridad sobre cualquier otro modal.

## Decisión clave: duelo vs podio

```ts
// challenge-flow.tsx, status === "finished":
const isDuel = (snapshot.podium?.length ?? 0) === 2;
return isDuel
  ? <DuelResultModal onExit={requestLeave} />
  : <PodiumModal onExit={requestLeave} />;
```

**Importante**: no se usa `config.capacity === 2` sino `podium.length`. Esto significa que una sala de capacidad 4 jugada por solo 2 personas también muestra el modal de duelo. Y si en una capacidad 4 entran 4 pero 2 se van antes de start, también se decide en el momento del finished con la longitud real del podio.

## Sincronización de la cuenta atrás de inicio

El `StartCountdown` (3-2-1-¡YA!) es **cliente-side, no servidor-side**. Cada cliente lo muestra al montar `MultiplayerGame`. Las pequeñas desincronizaciones (50-200ms por red) son aceptables en juego casual.

Si en algún momento se quisiera sincronizar exactamente, una opción sería:

1. Servidor pone `startedAt = now + 3500` al recibir `start`.
2. Cliente calcula el delay localmente (`startedAt - Date.now()`) para empezar el countdown.
3. Servidor no procesa `progress` antes de `startedAt`.

No está implementado porque ~150ms de desincronización no son perceptibles.

## Reingreso a sala

El servidor permite `join` en:

- `status === "lobby"` (normal).
- `status === "finished"` (sala "abierta" entre rondas).

NO permite join en `status === "playing"` (responde `already_started`).

Esto cumple el requisito de "si una persona se va al finalizar una partida 4P, otra (o la misma) puede volver a unirse a la siguiente ronda".

## Tests ad-hoc

Para validar cambios en el servidor sin levantar 4 navegadores:

```bash
node /tmp/mp-test.mjs   # script con dos WebSocket clients
```

Cubre create, peek, join, asignación de colores, start, semilla compartida, finished, podio, rematch, leader handoff. Si tocas la lógica del servidor, mantén este script actualizado y úsalo como regresión.

Para validar UI de podio/duelo:

```bash
node /tmp/mp-keep-room.mjs CODE   # mantiene una sala finished viva para que el navegador se una
node /tmp/mp-duel-room.mjs CODE   # idem pero 2P (para DuelResultModal)
```

## Despliegue

Ver [`deployment.md`](./deployment.md). En resumen:

```bash
pnpm party:deploy            # despliega game-room.ts a Cloudflare como PartyKit
                             # devuelve un host wss://buscanumeros.<user>.partykit.dev
```

El frontend (rama `multiplayer` en Pages) lleva `NEXT_PUBLIC_PARTYKIT_HOST = buscanumeros.<user>.partykit.dev`.

## Gotchas

- **No usar el alias `@/`** dentro de `party/game-room.ts` — PartyKit no resuelve aliases en su bundling. Usar `../lib/multiplayer/protocol`.
- **El estado en storage no se borra automáticamente** — si una sala queda inicializada pero sin jugadores (todos se van), el código `removePlayer` la resetea (`storage.delete("state")`). Si tocas esa lógica, comprueba que no queden salas zombi consumiendo memoria.
- **Color "lima" y "amarillo"** son fácilmente confundibles a primera vista — está aceptado por diseño (paleta candy lúdica). Si añades más colores, mantén el contraste con los avatares de slot dim.
