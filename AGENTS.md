# AGENTS.md

> Guía de trabajo para agentes de IA (Claude Code, Codex, Cursor, etc.) sobre el repositorio **BuscaNúmeros**.
> Si vas a tocar algo de este proyecto, **léeme primero** y luego abre `docs/INDEX.md` para enrutar al doc que necesites.

---

## 1. Qué es este proyecto

**BuscaNúmeros** — juego mobile-first donde el jugador memoriza el orden y toca los números del 1 al N en secuencia.

- Frontend: **Next.js 16** (App Router, Turbopack, `output: 'export'`), **React 19**, **TypeScript**, CSS Modules.
- Multijugador en tiempo real: **PartyKit** (Durable Objects de Cloudflare) + `partysocket` en el cliente.
- Hosting: **Cloudflare Pages** (frontend) + PartyKit (servidor de salas).
- Idioma: **español** (toda la UI y mensajes).

## 2. Mapa rápido del repositorio

```
app/                      # Next.js App Router (layout, page, meta files, globals.css)
components/
  ui/                     # primitivas reutilizables (Button, Modal, Segmented, icons.tsx…)
  screens/                # pantallas (home, game, result, records, settings, challenge)
  providers/              # GameStateProvider (single) + RoomProvider (multi)
lib/                      # dominio puro: types, config, format, sound, haptics, storage
  multiplayer/            # protocol.ts (mensajes cliente↔servidor) + identity.ts
hooks/                    # useNow (rAF), useClientValue (random/Date solo-cliente)
party/                    # game-room.ts (servidor de sala, Durable Object)
docs/                     # documentación completa del proyecto — ver INDEX.md
```

Documentación detallada en **`docs/INDEX.md`** (catálogo + criterios de cuándo leer cada doc).

## 3. Ramas y despliegue

Tres ramas largas:

| Rama          | Despliegue                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| `main`        | Cloudflare Pages producción · solo single-player                                                            |
| `develop`     | rama de integración; PRs `develop → main` cuando hay tanda lista                                            |
| `multiplayer` | añade el flujo `Retar` + PartyKit (servidor + cliente); despliegue separado en Pages preview/proyecto aparte |

Cuando hay cambios compartidos (todo lo que no es exclusivo del flujo Retar / PartyKit), van a **`develop`** y luego se hace `git merge develop` en `multiplayer`. Detalles en `docs/deployment.md`.

## 4. Cómo se trabaja en este repo

### 4.1 Setup local

```bash
pnpm install          # usar pnpm (packageManager fijado)
pnpm dev              # frontend en localhost:3000
pnpm party:dev        # (solo multiplayer) servidor PartyKit en localhost:1999
pnpm build            # build de producción (genera out/ con output: 'export')
pnpm lint             # ESLint
```

### 4.2 Convenciones de commits

- **PROHIBIDO el trailer** (`Co-Authored-By: …` u otros). El usuario lo dejó explícito en la conversación inicial; no añadir nunca.
- Mensaje en español, **scope + descripción**: `ui(home): ...`, `fix(safari-ios): ...`, `feat(seo): ...`, `multiplayer: ...`.
- Hitos numerados cuando se construye algo grande: `Hito 7: …`, `MP3: …`. Refleja la unidad lógica de trabajo, no commits ruidosos.
- **Cuerpo descriptivo de >1 párrafo** cuando el cambio merece explicación (causa raíz, alternativas descartadas, impactos). Si el diff es trivial, una línea basta.

### 4.3 Antes de commitear

Siempre, en orden:

1. `pnpm lint` debe pasar limpio.
2. `pnpm build` debe pasar limpio.
3. **Verificación visual** con la preview cuando es un cambio observable (Home, modales, OG image, etc.). Para CSS/iconos/UI es obligatorio.
4. Para multijugador, si tocas el servidor, considera correr `node /tmp/mp-test.mjs` (o equivalente) con dos clientes — el servidor es autoritativo y tiene cobertura por scripts ad-hoc.

### 4.4 PRs y merges

- PR de `develop → main` cuando hay una tanda coherente lista.
- Título del PR breve y técnico; cuerpo con **Resumen**, **Cambios**, **Detalles técnicos**, **Verificación**.
- El merge a `main` lo hace el usuario en GitHub (botón Merge). El agente solo abre la PR.
- Tras pushear y abrir PR: **resumir al usuario** qué se hizo y **qué pasos manuales** le quedan (mergear, redeploy, verificar en iPhone, etc.).

## 5. Metodología que se ha usado aquí

Esta sección documenta cómo se ha venido trabajando en este repo para que próximas sesiones repliquen el patrón.

### 5.1 Claridad antes de construir

Cuando una petición tiene ambigüedad de producto o de diseño, **se pregunta antes de tocar código**. Para preguntas estructuradas se usa `AskUserQuestion` con 2–4 opciones (recomendada marcada). Para algo abierto, se hace una propuesta en texto y se confirma.

Ejemplos del histórico:

- Antes del multijugador: 4 preguntas (backend, tablero, fin de ronda, modos con derrota).
- Antes de los iconos SVG custom: 3 preguntas (estilo, logo Home, color del tile).
- Antes del modal duelo 2P: 2 preguntas (composición OG, personalización del modal).

Si el alcance es trivial o el usuario ya dio una pauta clara, se procede sin preguntar.

### 5.2 Hitos + commits incrementales

Cuando algo es grande (recreación del juego, multijugador entero, set de iconos…) se divide en **hitos numerados** con un commit por hito en la rama correspondiente. Cada hito deja la app en estado funcional (lint+build OK) y se entrega a través de la lista de tareas (`TaskCreate`, `TaskUpdate`).

### 5.3 Verificación visual obligatoria

Para cambios de UI, antes de commitear se arranca el preview (`mcp__Claude_Preview__preview_start`), se hace resize a `mobile` (375×812) y se hace screenshot. Para flujos con varios pasos se usa `preview_eval` con JS que automatiza la navegación. Para el multijugador se levantan procesos Node de apoyo (scripts en `/tmp`) que sostienen estados de sala que el navegador no puede simular por sí solo.

### 5.4 Iteración por feedback de producción

Cuando algo se ve mal en el iPhone real (no en preview), el patrón es:

1. Diagnosticar: ¿es theme-color? ¿safe-area? ¿chrome de Safari? Inspeccionar HTML generado (`out/index.html` con `grep`).
2. Proponer al usuario el fix con la causa raíz.
3. Aplicar, verificar local (lo que se pueda), push, PR, summary con pasos manuales.
4. Si el usuario reporta que sigue mal, **revisar hipótesis** — quizá la causa raíz era otra (p.ej. los Backdrops tintando los bordes, no el theme-color).

### 5.5 Best practices que han aplicado en este proyecto

- **Componetización** de UI: una primitiva por concepto (Button, Modal, Segmented, IconButton…) reutilizada en todas las pantallas.
- **CSS Modules** + tokens en `:root` y `[data-theme="dark"]`. Animaciones globales en `globals.css` (porque se referencian por nombre desde módulos).
- **Estado externo** con `useSyncExternalStore` (game-store.ts) para evitar mismatch de hidratación SSR↔cliente con `localStorage`.
- **Random/Date solo-cliente** vía `useClientValue` para iconos/confeti/logo (evita mismatch SSR).
- **Servidor de sala autoritativo** (PartyKit Durable Object); el cliente no decide victoria, eliminación, leader handoff, etc. — solo informa eventos.
- **Tipos compartidos** cliente↔servidor en `lib/multiplayer/protocol.ts` (un único source of truth para los mensajes).
- **`output: 'export'`** desde el principio: forces todas las rutas a estáticas, simplifica deploy en Pages, evita gotchas con runtime de Node/Edge.

### 5.6 Anti-patrones a evitar

- ❌ Añadir trailer en commits.
- ❌ Tocar `main` directamente. Siempre pasa por PR desde `develop`.
- ❌ Importar `'@/lib/...'` desde `party/` (PartyKit no resuelve el alias; usa rutas relativas).
- ❌ Asumir que iOS Safari pinta el chrome con el bg de la página. Hay que usar `theme-color` + capa `html::before` fija.
- ❌ Usar `Math.random()` o `Date.now()` en renders SSR sin pasar por `useClientValue`.
- ❌ Tocar el servidor de sala sin probar con dos clientes Node (race conditions silenciosas).

## 6. Variables de entorno

| Variable                   | Dónde   | Default                            | Propósito                                                  |
| -------------------------- | ------- | ---------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | build   | `https://busca-numeros.pages.dev`  | metadataBase, canonical, OG, sitemap, JSON-LD              |
| `NEXT_PUBLIC_PARTYKIT_HOST`| runtime | `localhost:1999`                   | Host del WebSocket PartyKit (solo rama `multiplayer`)      |

Configurar en Cloudflare Pages → Settings → Environment variables (por entorno: Production / Preview).

## 7. Más documentación

- **`docs/INDEX.md`** — catálogo de toda la documentación (cuándo leer cada archivo).
- Si solo lees este AGENTS.md y el INDEX.md, tienes el 80% del contexto sin cargar el resto.
