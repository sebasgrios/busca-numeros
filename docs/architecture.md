---
title: Arquitectura
summary: Stack técnico, estructura de carpetas, convenciones de imports, configuración de Next/PartyKit/pnpm. Cómo se organiza el código.
tags: [architecture, stack, structure, nextjs, partykit, pnpm, typescript, conventions]
---

# Arquitectura

## Stack

| Capa            | Tecnología                                                          |
| --------------- | ------------------------------------------------------------------- |
| Framework       | **Next.js 16** (App Router, Turbopack, `output: 'export'`)          |
| UI              | **React 19**, **TypeScript** estricto                               |
| Estilos         | **CSS Modules** + tokens en `:root` / `[data-theme="dark"]`         |
| Fuentes         | **Fredoka** (display) + **Nunito** (body) vía `next/font/google`    |
| Animaciones     | CSS keyframes en `globals.css` (compartidas) + por módulo cuando es local |
| Estado SP       | Store externo + `useSyncExternalStore` (`lib/game-store.ts`)        |
| Estado MP       | Contexto React (`RoomProvider`) + `partysocket`                     |
| Persistencia    | `localStorage` (records, settings, played count)                    |
| Audio           | Web Audio API (sintetizado, sin assets)                             |
| Háptica         | `navigator.vibrate()`                                               |
| Multijugador    | **PartyKit** sobre Cloudflare Durable Objects                       |
| Build           | Turbopack (production y dev)                                        |
| Despliegue      | Cloudflare Pages (frontend) + PartyKit (servidor de salas)          |
| Package manager | **pnpm 11** (pinned via `packageManager`)                           |

## Versiones clave

- `next` 16.2.6 (Turbopack por defecto, App Router)
- `react` 19.2.x
- `partykit` 0.0.115 + `partysocket` 1.1.x

## Estructura de carpetas

```
app/
  layout.tsx              # root layout (fonts, metadata, viewport, structured data)
  page.tsx                # entry — monta GameStateProvider + AppShell
  globals.css             # tokens, reset, marco de teléfono, keyframes globales
  icon.svg                # favicon (tile "12" coral, ver seo-meta.md)
  opengraph-image.tsx     # OG image dinámica (next/og + Fredoka)
  sitemap.ts              # sitemap estático
  robots.ts               # robots.txt estático

components/
  app-shell.tsx           # router de pantallas (home/game/win/lose/records/settings/challenge)
  providers/
    game-state-provider.tsx   # estado SP (theme, sound, settings, records)
    room-provider.tsx         # estado MP (PartySocket, acciones de sala)
  ui/                     # primitivas reutilizables (ver design-system.md)
    button.tsx, modal.tsx, segmented.tsx, switch.tsx, toast.tsx,
    icon-button.tsx, top-bar.tsx, stat-card.tsx, bottom-info.tsx,
    backdrop.tsx, confetti.tsx, text-field.tsx, section-title.tsx,
    setting-group.tsx, confirm-modal.tsx, icons.tsx
  screens/                # pantallas (una carpeta por pantalla)
    home/
    game/                 # game-screen + start-countdown + game-board + timer-pill + progress-bar
    result/               # victory-screen, lose-screen (+ end-screen.module.css compartido)
    records/
    settings/
    challenge/            # (solo multiplayer) choice, create-config, join-code,
                          # waiting-room, name-modal, multiplayer-game,
                          # podium-modal, duel-result-modal, abandoned-modal,
                          # result-actions, challenge-flow, eliminated-overlay

hooks/
  use-now.ts              # Date.now() en bucle rAF (activable/desactivable)
  use-client-value.ts     # init valor solo-cliente (evita mismatch SSR para Math.random/Date.now)

lib/
  types.ts                # GameMode, GameConfig, Settings, Record, WinInfo, LoseInfo, Screen
  config.ts               # COLORS, GRID_OPTIONS, MODE_OPTIONS, COUNTDOWN_OPTIONS, shuffle, seededShuffle, configKey, configLabel
  format.ts               # formatTime (mm:ss.cc), formatTimeShort (m:ss)
  storage.ts              # loadState/saveState localStorage
  game-store.ts           # store externo + acciones (updateSettings, updateGame, registerWin, etc.)
  sound.ts                # SoundFx (Web Audio)
  haptics.ts              # vibrate()
  version.ts              # APP_VERSION leído de package.json
  multiplayer/
    protocol.ts           # tipos de mensajes cliente↔servidor + DEFAULT_ROOM_CONFIG + COLOR_HEX
    identity.ts           # nombre persistido + PARTYKIT_HOST

party/
  game-room.ts            # servidor de sala (Durable Object) — autoritativo

docs/                     # documentación (estás aquí)
```

## Convenciones de imports

- **Alias `@/`** apunta al root del proyecto (configurado en `tsconfig.json`). Se usa en TODA la app cliente.
- **Excepción**: `party/game-room.ts` importa desde `../lib/multiplayer/protocol` con ruta relativa. PartyKit no resuelve el alias `@/` durante el bundle del worker.
- Orden de imports por bloque: framework/React → next/* → @/components/* → @/lib/* → @/hooks/* → tipos → estilos.

## Configuración relevante

### `package.json`

- `"packageManager": "pnpm@11.1.3"` — fijado para que corepack use pnpm consistentemente (en este entorno `npm` está aliasado a pnpm).
- Scripts:
  - `dev`, `build`, `start`, `lint` (Next/ESLint)
  - `party:dev` (servidor PartyKit local en :1999)
  - `party:deploy` (despliegue a Cloudflare)

### `pnpm-workspace.yaml`

Lleva `allowBuilds:` con `sharp: true`, `unrs-resolver: true`, y en multiplayer también `esbuild` y `workerd`. Sin esto, pnpm 11 ignora los build scripts nativos y el build falla.

### `next.config.ts`

```ts
const nextConfig: NextConfig = {
  output: "export",  // exportación estática para Cloudflare Pages
};
```

Implicaciones:

- Todas las rutas son estáticas (`/`, `/_not-found`, `/icon.svg`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`).
- `app/sitemap.ts`, `app/robots.ts` y `app/opengraph-image.tsx` requieren `export const dynamic = "force-static"` para compatibilidad.
- No hay runtime de servidor; cualquier feature que requiera SSR/edge funcs no funciona.

### `tsconfig.json`

TypeScript estricto. Alias `"@/*": ["./*"]`. Includes default de Next (`**/*.ts`, `**/*.tsx`, `.next/types/**/*.ts`).

### `eslint.config.mjs`

`eslint-config-next` (React 19 hooks rules estrictas):

- `react-hooks/refs` (no leer `ref.current` en render)
- `react-hooks/purity` (no `Math.random`/`Date.now` directos en render)
- `react-hooks/set-state-in-effect` (no `setState` síncrono en cuerpo de efecto)
- `react-hooks/exhaustive-deps`

Para casos legítimos (init solo-cliente, sync con store externo) se usan `// eslint-disable-next-line` con justificación. Ver [`state.md`](./state.md) y [`gotchas.md`](./gotchas.md).

## Renderizado

- `app/page.tsx` es **server component** que renderiza `<GameStateProvider><AppShell /></GameStateProvider>`.
- `AppShell`, todos los providers y todas las pantallas llevan `"use client"`. La app es client-heavy (localStorage, Web Audio, WebSocket).
- Aunque sea client-side, Next sigue **SSR-ándolo durante el build** (output: export) para generar HTML estático. Eso obliga a respetar las reglas anti-mismatch (random/Date solo-cliente).

## Build output

`pnpm build` produce `out/` con:

```
out/
  index.html              # entry
  404.html, _not-found    # not-found
  _next/                  # chunks, fonts, css
  icon.svg                # favicon servido en /icon.svg
  opengraph-image         # PNG 1200×630 generado por next/og
  sitemap.xml
  robots.txt
```

Este `out/` es lo que se sirve desde Cloudflare Pages (Build output directory = `out`).

## Servidor de sala (rama `multiplayer`)

`party/game-room.ts` se compila con `partykit` (esbuild + workerd). Local: `pnpm party:dev`. Despliegue: `pnpm party:deploy` (Cloudflare). Ver [`multiplayer.md`](./multiplayer.md).

## Cosas que conviene saber

- **No hay testing automatizado** en el repo. La validación es: lint + build + verificación visual con preview + scripts ad-hoc Node para multijugador (`/tmp/mp-*.mjs`).
- **No hay Storybook**. Las primitivas se prueban en context real.
- **No hay i18n**. El español está hardcodeado (es una elección de producto).
