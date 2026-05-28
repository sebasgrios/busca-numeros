---
title: Pantallas y flujos
summary: Cada pantalla del juego (Home, Game, Result, Records, Settings, Challenge) y los flujos completos de single-player y multijugador (crear/unirse, sala, partida, podio/duelo, revancha).
tags: [screens, flows, navigation, ui, sp, mp, home, game, records, settings, challenge, waiting-room, podium, duel]
---

# Pantallas y flujos

## Shell de navegación

`components/app-shell.tsx` es el router. Maneja el `screen` (union de `lib/types.ts → Screen`) y el estado transitorio entre pantallas (`gameId`, `winInfo`, `loseInfo`, `toast`).

```ts
type Screen =
  | "home" | "game" | "win" | "lose" | "records" | "settings"
  | "challenge"; // solo rama multiplayer
```

Cambios de pantalla → suena `getSfx().click()` y se llama `setScreen(next)`. Los teléfonos no tienen URL, no hay routing por path (la app está siempre en `/`).

**Deep link**: `/?join=CODE` (4 chars) abre directamente el flujo de unirse a sala (solo rama multiplayer). El `AppShell` lo detecta con `useClientValue(() => new URLSearchParams(location.search).get("join"))`.

## Single-player

### 01 Home (`components/screens/home/home-screen.tsx`)

- **Topbar**: solo el cog Ajustes (en variante `accent` coral). El toggle de tema está comentado, se controla desde Settings.
- **Hero**: mosaico 3×3 de tiles con números aleatorios bobbing + marca "Busca**Números**" + tagline ("Memoriza el orden. Toca del 1 al N.").
- **Stats**: 2 StatCards (Mejor tiempo · grid actual / Victorias).
- **Acciones**: 3 botones — Jugar (primary coral), Récords (ghost), Retar (secondary sky; `comingSoon` en develop, activo en multiplayer).
- **BottomInfo**: `configLabel(cfg)` ej. "5 × 5 · Cuenta atrás 5 min".
- **Fondo**: `radial-gradient`s sobre `.home` (no `<Backdrop />`, ver [`design-system.md`](./design-system.md)).

### 02 Game (`components/screens/game/game-screen.tsx`)

- **Topbar**: back (← `IconArrowLeft`), timer central (TimerPill), badge errores (solo si `relax`/`countdown` y `wrongCount > 0`).
- **ProgressBar**: barra con ticks cada 10%. En MP recibe `markers` con la posición fantasma de los rivales.
- **GameBoard**: cuadrícula `cols × cols` con números desordenados (memoizada `Cell`). Adaptativa via container queries.
- **BottomInfo**: texto del modo activo.
- **Overlay StartCountdown**: cuenta atrás 3-2-1-¡YA! al inicio. Bloquea taps hasta acabar. Ver [`gameplay.md`](./gameplay.md).
- **ConfirmModal (SP)**: al pulsar back, modal "¿Salir de la partida?". Mientras está abierto el timer se **pausa** (al cancelar se descuenta la pausa). En MP el modal se abre desde el padre (`ChallengeFlow`), no pausa.

### 03 Victory (`components/screens/result/victory-screen.tsx`)

Confeti + trofeo dorado (IconTrophy sobre círculo sun) + "¡Lo lograste!" + tiempo grande + chip de configuración + badge "★ NUEVO RÉCORD" si aplica + rank ("Top N") + botones (Jugar de nuevo · Inicio).

### 04 Lose (`components/screens/result/lose-screen.tsx`)

Emoji circle rojo (IconStopwatch si timeout, IconX si mistake) + título según motivo + razón ("Tocaste el X cuando buscabas el Y" o "Te faltaron N números"). StatCards (Llegaste a / Tiempo) + botones (Intentar otra vez · Inicio).

### 05 Records (`components/screens/records/records-screen.tsx`)

Scroll vertical. Filtros (3 segmented compact): Grid, Modo, Duración (solo si modo cuenta atrás). Resumen (4 StatCards `dense`: Victorias / Mejor / Promedio / Total partidas) + top 10 ordenado por tiempo. Cada row: rank (1º=sun, 2º=lavender, 3º=mint, resto=sky) + tiempo + chip config + fecha. Botón borrar (icon trash) abre `window.confirm` y limpia el array, toast de feedback.

### 06 Settings (`components/screens/settings/settings-screen.tsx`)

Scroll. 3 grupos:

1. **Tablero** — Tamaño del grid (5×5 / 7×7 / 10×10).
2. **Reglas** — Modo de juego (Cuenta atrás / Clásico / Relax) stack + Duración (compactWrap, solo si countdown).
3. **Preferencias** — Sonido, Vibración, Modo oscuro (3 toggles).

BottomInfo: `BuscaNúmeros · v{APP_VERSION}` (dinámico, lee `package.json`).

## Flujo SP completo

```
Home
  ├── click "Jugar" → Game (con StartCountdown overlay → board activo)
  │     ├── completa → Victory → "Jugar de nuevo" reinicia con nueva semilla
  │     │                       → "Inicio" vuelve a Home
  │     ├── pierde   → Lose    → idem
  │     └── back     → ConfirmModal "¿Salir?" (timer pausado)
  │                              → "Salir"           → Home
  │                              → "Seguir jugando"  → reanuda
  ├── click "Récords" → Records
  ├── click "Ajustes" → Settings
  └── click "Retar"   → Challenge (solo multiplayer)
```

---

## Multijugador (rama `multiplayer`)

Toda la lógica de salas vive en `components/screens/challenge/` orquestada por `ChallengeFlow`.

### 07 Challenge: Choice (`choice-screen.tsx`)

Pantalla con dos botones grandes:

- **Crear partida** (IconPlus, primary coral)
- **Unirse a partida** (IconKey, secondary sky)

Topbar con back. Fondo con Backdrop (b1, b2).

### 08 Create (`create-config-screen.tsx`)

Settings-like screen para configurar la sala:

- **Tablero / Tamaño del grid** — 5/7/10
- **Tablero / ¿Mismo tablero?** — `shared` (carrera justa) / `independent`
- **Reglas / Modo de juego** — countdown/classic/relax + **Duración** si countdown

> ❗ Ya no existe selector "Jugadores". La capacidad de la sala es **siempre 4**. El modal de resultado se elige por `podium.length` (ver [`multiplayer.md`](./multiplayer.md)).

Botón "Crear sala" abre **NameModal**.

### 09 NameModal (`name-modal.tsx`)

Modal con input para el nombre (max 14 chars), persistido en `localStorage` (`buscanumeros:name`). Botón "Crear sala" / "Entrar" (depende del flujo). Cancelar (X) cierra.

Al confirmar:

- **Crear** → genera código de 4 chars (`generateRoomCode()`), conecta PartyKit, envía `create{name, config}`.
- **Unirse** → envía `join{name}` sobre conexión ya validada por `peek`.

### 10 Join (`join-code-screen.tsx`)

Input central tipo "código" (uppercase, letter-spacing amplio) + botón "Continuar". Al pulsar:

1. `peekRoom(code)` → conecta + envía `peek` → espera respuesta del servidor.
2. Si `joinable` → abre NameModal con confirmLabel "Entrar".
3. Si `not_found`/`full`/`in_progress` → muestra mensaje de error.

Soporta `initialCode` prefilled (deep link `/?join=CODE`).

### 11 WaitingRoom (`waiting-room.tsx`)

Modal **sin overlay normal de Modal**, lo monta `ChallengeFlow`:

- **Topbar X** — cerrar (si anfitrión = ConfirmModal de "¿Cerrar la partida?"; si no, ConfirmModal de "¿Salir?").
- **Grid de slots** — un slot por capacity (hasta 4): los unidos llevan avatar IconSmile en color asignado y badge ANFITRIÓN/Tú/Listo; los vacíos llevan IconPerson dimmed con color libre + "Esperando…".
- **Código copiable** — el código de sala en grande con icono Copy. Click → `navigator.clipboard.writeText` + estado "¡Copiado!" 1.5s. Toast no, feedback inline.
- **Invitar** — `navigator.share` con URL `${origin}/?join=CODE` o fallback a copiar al portapapeles.
- **Iniciar** — solo el anfitrión, deshabilitado hasta 2+ jugadores en la sala.

### 12 MultiplayerGame (`multiplayer-game.tsx`)

Wrapper alrededor de `GameScreen` (la misma del SP) con:

- `configOverride={snapshot.config}` (cols, mode, duration de la sala).
- `seed={snapshot.seed}` (semilla compartida si `board === "shared"`).
- `markers` — progreso fantasma de rivales (color muted en barra).
- `onProgress={(n) => sendProgress(n)}` — envía cada acierto al servidor.
- `onWin / onLose` — manda `finished{time}` / `eliminated{progress, reason}`.
- `confirmOnExit={false}` — el back llama `onExit` directo; el confirm de salida lo maneja `ChallengeFlow` (modal compartido).

**EliminatedOverlay** — si el jugador queda eliminado pero la ronda sigue, se le muestra un overlay "¡Eliminado! Esperando al resto…". Cuando la ronda termina, se transita al podio/duelo.

### 13 PodiumModal / DuelResultModal

Cuando `snapshot.status === "finished"`:

- Si **podium.length === 2** → `<DuelResultModal />` — modal de duelo:
  - Para el ganador: "¡Has ganado!" con `Confetti` + IconTrophy sobre círculo sun + tiempo grande.
  - Para el perdedor: "Has perdido el duelo" con IconTrophy lavender + avatar del ganador + "Ha ganado X · Lo completó en …".
- Si **podium.length ≥ 3** → `<PodiumModal />` — modal de podio:
  - Tres columnas (2º · 1º · 3º) con avatares + pilares numerados ("1" coral grande, "2" 34px, "3" 28px).
  - Subtítulo: "Ganador: X" (o "Sin ganador").
- Ambos comparten `<ResultActions />` con dos botones: **Volver a jugar (n/N)** + **Salir**. Si eres anfitrión y ya marcaste rematch → el primer botón pasa a **Iniciar (n/N)**, habilitado solo cuando todos están listos (`allReady`).

### 14 AbandonedModal

Si todos los demás jugadores salen y quedas solo, se muestra `<AbandonedModal />`: "Te has quedado solo / Los demás jugadores han salido de la partida, así que se va a cerrar" + botón Entendido (llama `onContinue → leaveToChoice`).

## Flujo MP completo

```
Home ─click Retar→ Challenge Choice
                      ├── Crear → CreateConfig → NameModal → WaitingRoom (host)
                      │                                       ├── X → ConfirmModal "¿Cerrar?" → close() → choice
                      │                                       ├── Iniciar (≥2) → MultiplayerGame
                      │                                       └── invitar / código copiable
                      └── Unirse → JoinCode → NameModal → WaitingRoom (guest)
                                                            ├── X → ConfirmModal "¿Salir?" → leave() → choice
                                                            └── espera Iniciar del host

MultiplayerGame
   ├── StartCountdown 3-2-1-¡YA! (todos los jugadores)
   ├── progreso fantasma de rivales en la barra
   ├── primer "finished" del servidor → DuelResult (2P) o Podium (≥3)
   └── eliminado → EliminatedOverlay → modal cuando termine la ronda

Result (Duel/Podium)
   ├── "Salir" → ConfirmModal "¿Salir?" → leave() → choice
   ├── "Volver a jugar (n/N)" → marca rematchReady en el servidor
   └── (host) "Iniciar (n/N)" cuando todos rematchReady → nueva ronda
```

### Reingreso (rejoin)

Una sala mantiene estado entre rondas. Si quedan plazas (`players.length < capacity`), se puede unir gente nueva en `status === "finished"`. Si la capacidad es 4 y solo quedan 2 jugadores al finalizar, otro (o el mismo que se fue) puede volver a unirse en cuanto pase a `lobby` (al iniciar la siguiente ronda) — el servidor permite `join` también en lobby y finished.

### Traspaso de liderazgo

Si el anfitrión sale, el servidor reasigna `hostId` al **siguiente jugador por orden de unión**. El nuevo anfitrión ve aparecer los botones de Iniciar (en lobby) o Iniciar para revancha (en finished). Detalles en [`multiplayer.md`](./multiplayer.md).
