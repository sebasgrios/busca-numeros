# BuscaNúmeros

Juego mobile-first donde memorizas el orden y tocas los números del 1 al
N contra el reloj. Construido con Next.js 16 (App Router), React 19 y
TypeScript.

## Características

- **Tres modos de juego**: Cuenta atrás (con penalización por error),
  Clásico (un error y pierdes) y Relax (sin penalización).
- **Grids 5×5, 7×7 y 10×10** con tablero adaptativo por container queries.
- **Récords por configuración** con filtros por grid, modo y duración.
- **Sonido** sintetizado vía Web Audio, **vibración háptica** y **modo
  oscuro**, todo persistido en `localStorage`.
- **Multijugador en tiempo real** (rama `multiplayer`): salas con código,
  hasta 4 jugadores, tablero compartido opcional, progreso fantasma de
  rivales en la barra y podio al primer ganador.

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
pnpm build   # build de producción
pnpm lint    # análisis estático
```

### Multijugador (PartyKit + Cloudflare)

El servidor de sala es autoritativo y vive en un Durable Object por sala
(via [PartyKit](https://www.partykit.io/), parte de Cloudflare). El
frontend se conecta por WebSocket con `partysocket`.

```bash
pnpm party:dev    # servidor de salas en http://localhost:1999
pnpm dev          # frontend en http://localhost:3000

# Despliegue (requiere autenticación en Cloudflare):
pnpm party:deploy
```

Configura `NEXT_PUBLIC_PARTYKIT_HOST` apuntando al host desplegado de
PartyKit en producción (por defecto `localhost:1999`).

## Estructura

- `app/` — layout, estilos globales (tokens y animaciones) y la página.
- `components/ui/` — primitivas reutilizables (Button, Segmented, Switch,
  Modal, ConfirmModal, SectionTitle, SettingGroup, TextField…).
- `components/screens/` — pantallas (home, game, result, records,
  settings, challenge).
- `components/providers/` — `GameStateProvider` (estado individual) y
  `RoomProvider` (conexión PartyKit y acciones de sala).
- `lib/` — dominio: tipos, configuración, store, audio, háptica, formato,
  y el subdirectorio `multiplayer/` con el protocolo cliente-servidor.
- `party/` — servidor de sala (Durable Object) ejecutado por PartyKit.
- `hooks/` — hooks compartidos (`useNow`, `useClientValue`).
