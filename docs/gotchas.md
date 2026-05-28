---
title: Gotchas y aprendizajes
summary: Quirks de iOS Safari (chrome blur, theme-color con media queries, dvh/lvh, Backdrops tintando bordes), reglas estrictas de React 19, pnpm 11 allowBuilds, PartyKit y otros aprendizajes acumulados en el proyecto.
tags: [gotchas, ios, safari, hydration, react, lint, pnpm, partykit, dvh, lvh, viewport, theme-color, debugging, lessons-learned]
---

# Gotchas y aprendizajes

Esta página es la "memoria operacional" del proyecto. Cada entrada documenta un quirk con su síntoma, causa raíz y la solución que aplicamos. Lectura recomendada antes de tocar:

- Layout / viewport / fondos en mobile.
- Hooks que tocan `Math.random` / `Date.now` / `localStorage`.
- Build de pnpm con paquetes nativos.
- Servidor PartyKit / imports `@/`.

---

## iOS Safari

### Franjas blancas alrededor del status bar y home indicator

**Síntoma**: en iPhone Safari, las zonas del status bar (arriba) y el área del home indicator (abajo, entre el URL bar y el borde del dispositivo) aparecen blancas, distintas del fondo cremoso del juego.

**Causas y soluciones (en este orden)**:

1. **Dos metas `theme-color` con media query** (`prefers-color-scheme: light|dark`) → iOS Safari las aplica según el modo del **sistema**, no del toggle de la app. Cuando no coinciden (o iOS no soporta el media query) cae al chrome por defecto (blanco).

   ✅ **Fix** (PR #5): un único `theme-color: "#FFF3DE"` controlado dinámicamente por `GameStateProvider` (cambia el `meta.content` al alternar dark mode):

   ```ts
   useEffect(() => {
     document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
     const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
     if (meta) meta.content = dark ? "#1A1430" : "#FFF3DE";
   }, [state.settings.dark]);
   ```

2. **`body { min-height: 100lvh }`** (large viewport) introducido como "red de seguridad" hacía que el body fuera más alto que el viewport visible cuando Safari mostraba su URL bar → **scroll vertical innecesario** en Home.

   ✅ **Fix** (PR #7): revertir body a `100dvh`. Para garantizar el bg detrás del chrome, usar capa fija:

   ```css
   html::before {
     content: "";
     position: fixed;
     inset: 0;
     background-color: var(--bg);
     z-index: -1;
     pointer-events: none;
   }
   ```

3. **El componente `<Backdrop />`** pintaba blobs grandes (sun upper-right, coral lower-left, mint left-middle) con `filter: blur(34px)`. Esos blobs tintaban los **bordes superior e inferior** de la página. Safari blurea esa zona en su chrome → la tinta coloreada se cuela y se ve diferente al cremoso central → franja.

   ✅ **Fix** (PR #8): no usar `<Backdrop />` en Home. En su lugar, `background-image` con `radial-gradient`s sobre `.home` con picos al **25%–75% vertical** para que los bordes queden en cremoso puro:

   ```css
   .home {
     background-image:
       radial-gradient(230px at 100% 25%, rgba(255,201,60,0.55), transparent 65%),
       radial-gradient(220px at   0% 75%, rgba(255,123,90,0.35), transparent 65%),
       radial-gradient(170px at -40px 50%, rgba(79,209,165,0.22), transparent 70%);
   }
   ```

> **Lección**: para que Safari cumpla el contrato visual, los bordes del viewport (la zona que blureará en su chrome) deben ser de color sólido. Cualquier tinte sutil cerca de los bordes se va a notar.

### Diferencias entre `100vh`, `100dvh`, `100lvh`, `100svh`

| Unidad | Significado                                         | Cuándo usar                                                             |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `100vh`  | Viewport "clásico" — el largo cuando el chrome puede estar visible | Fallback (siempre antes que dvh).                                       |
| `100dvh` | Dynamic viewport — se ajusta según chrome de Safari (más estrecho cuando muestra URL bar) | Para que el contenido encaje en el área visible (no quede scroll).      |
| `100lvh` | Large viewport — siempre el más grande (incluye detrás del chrome) | Si quieres que algo se pinte detrás del chrome. **NO en `body` o causa scroll**. |
| `100svh` | Small viewport — el más pequeño                    | Casi nunca.                                                              |

Patrón actual: `html { min-height: 100lvh }`, `body { min-height: 100vh; min-height: 100dvh }`. Más `html::before` fija para el bg.

### `theme-color` no se aplica a la status bar en algunos iOS

iOS Safari < 15.4 no soporta `theme-color` con media query. Por eso usamos un único valor (sin media). Tambien hay versiones que aplican el theme-color pero con un blur de la página debajo — eso es comportamiento "natural" del chrome, no eliminable sin instalar como PWA.

### Pull-to-refresh y overscroll

`overscroll-behavior: none` en `html, body` desactiva el pull-to-refresh y el bounce blanco al overscrollear. Combinado con `html::before` fija, no hay forma de ver blanco bajo ninguna gesto.

---

## React 19 lint rules

### `react-hooks/set-state-in-effect`

Prohibe `setState(...)` síncrono en el cuerpo de un `useEffect`. Excepciones aceptadas:

- **Hidratación desde localStorage**: usar `useSyncExternalStore` con `getServerSnapshot` (no setState).
- **Inicialización solo-cliente** (random/Date): hook `useClientValue` con disable + comentario.

```ts
useEffect(
  () => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(factory());
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [],
);
```

### `react-hooks/refs`

No leer `ref.current` durante render. Si un valor cambia durante la vida del componente y se usa en render, **es state, no ref**.

Caso: en `GameScreen`, `startTime` originalmente era `useRef(Date.now())` pero ahora puede cambiar (al fin del countdown se setea Date.now, al cancelar pausa se desplaza). Pasó a `useState(0)` + `setStartTime`.

### `react-hooks/purity`

`Math.random()`/`Date.now()` directos en `useMemo` o cuerpo de render se marcan. La regla detecta llamadas estáticas. Si los ocultas en una función externa (`shuffle()`, `buildPieces()`), la regla no se queja — pero entonces tienes mismatch SSR.

**Solución correcta**: usar `useClientValue(() => factory())` que ejecuta el factory en effect post-mount.

### Si reaches todas las reglas y la lógica no encaja

A veces el lint es estricto donde la lógica es legítima. El patrón es:

1. Refactorizar primero para evitar el caso (ej.: store externo en lugar de effect+setState).
2. Si el caso es legítimo (init única, sync con sistema externo no-React), añadir `// eslint-disable-next-line` con un **comentario justificativo** en la línea siguiente.
3. NUNCA desactivar reglas globalmente.

---

## pnpm 11

### `allowBuilds` para paquetes con build scripts nativos

pnpm 11 ignora por defecto los `postinstall`/`install` scripts de paquetes que no estén en una allowlist. Si no se permiten, paquetes como `sharp` o `unrs-resolver` quedan instalados sin compilar → build de Next falla.

`pnpm-workspace.yaml`:

```yaml
allowBuilds:
  sharp: true
  unrs-resolver: true
  esbuild: true     # solo necesario en rama multiplayer (PartyKit)
  workerd: true     # idem
```

Si añades una dependencia con build scripts y `pnpm install` muestra el warning `[ERR_PNPM_IGNORED_BUILDS]`, añádela a la lista.

### `packageManager` pinneado

`package.json -> "packageManager": "pnpm@11.1.3"` — esto fuerza a corepack a usar pnpm 11.1.3 exacto. En este repo `npm` está aliasado a `pnpm` en el zsh del usuario, así que `pnpm install` y `npm install` hacen lo mismo. El pinning evita drift entre máquinas.

---

## PartyKit

### Imports en `party/game-room.ts`

PartyKit bundle el worker con esbuild **sin resolver el alias `@/`**. Usar siempre rutas relativas dentro de `party/`:

```ts
// ✅ correcto
import { ... } from "../lib/multiplayer/protocol";

// ❌ falla en build
import { ... } from "@/lib/multiplayer/protocol";
```

### Storage del Durable Object

`this.room.storage.put("state", state)` persiste. Si la instancia hiberna, al despertar `onStart()` carga el state guardado. Sin esto, al hibernar perdería sala y jugadores.

### El servidor es autoritativo

Nunca aceptar eventos del cliente sin validar:

- `start` debe verificar `sender.id === hostId` y `status === "lobby" | "finished"`.
- `progress` debe ignorar si el player no está en `status === "playing"`.
- `finished` debe llamarse máximo una vez (lock con `endedRef` o status). Si dos clientes envían `finished` casi a la vez, el primero gana, el segundo se ignora.

### Tests sin navegadores

Para iteraciones rápidas sin levantar 4 ventanas:

```bash
node /tmp/mp-test.mjs            # crea sala, dos clientes, ejecuta flujo entero, asserts
node /tmp/mp-keep-room.mjs CODE  # mantiene una sala viva (host + N clientes) para inspección manual
```

Estos scripts conectan vía `WebSocket` nativo (Node 24 ya tiene `WebSocket` global) a `ws://localhost:1999/parties/main/<CODE>`. PartyKit en local en el puerto 1999.

---

## Next.js 16 con `output: 'export'`

### `dynamic = "force-static"` obligatorio en metadata files

`app/sitemap.ts`, `app/robots.ts` y `app/opengraph-image.tsx` necesitan:

```ts
export const dynamic = "force-static";
```

Sin esto, `pnpm build` falla con:

```
Error: export const dynamic = "force-static"/export const revalidate not configured
on route "/sitemap.xml" with "output: export"
```

### `app/icon.svg` se sirve en `/icon.svg`

Convención automática. Next emite `<link rel="icon">` apuntando ahí. No es necesario declararlo en `metadata.icons`.

### Open Graph image rute

`app/opengraph-image.tsx` genera `/opengraph-image` (sin extensión) — una PNG estática con hash de cache busting. NO usar `app/opengraph-image.png` (Next lo trataría como asset estático sin auto-meta).

### Si manualmente especificas `metadata.openGraph.images`, rompes el auto-binding

Mejor dejar que Next detecte `opengraph-image.tsx` y genere todo. Si especificas `images: [{ url: "/opengraph-image.png" }]` manualmente, queda hardcoded sin hash → cache stale + URL no existe (la generada no tiene `.png`).

### `next-env.d.ts` no se versiona

Está en `.gitignore`. Lo regenera Next en cada `build`.

---

## Hidratación SSR ↔ cliente

### Mismatch al usar `Math.random` o `Date.now` en render

El componente client (con `"use client"`) sigue renderizándose en SSR durante el build (`output: 'export'`). Si el factory de un `useMemo`/`useState(initializer)` usa randomness, el HTML servido es distinto del que React genera al hidratar → warning + visual jump.

**Patrones safe**:

- `useClientValue(() => factory())` (devuelve null en server + primer render cliente, factory en effect post-mount).
- Lazy state con valor estable: `useState(0)` y settear después.
- Guardar el valor en `localStorage` y rehidratar con `useSyncExternalStore`.

### Mismatch al leer `localStorage` en render

Misma idea: localStorage no existe en SSR. Si lees durante el initializer, devuelve undefined; en cliente devuelve algo. Use `useSyncExternalStore` o `useClientValue`.

---

## Componentes específicos

### Backdrop blobs no son apropiados para Home

Aunque Choice/Join/Victory/Lose siguen usando `<Backdrop />` (son pantallas efímeras y no se nota), Home debe usar gradientes radiales sobre `.home` con picos al 25%–75% vertical. Ver "Franjas blancas iPhone Safari" más arriba.

### Cell check (✓) y wrong shake en `game-board.module.css`

El check se dibuja con borders rotados + `animation: checkin`. El shake con `animation: shake`. Ambas referencian keyframes globales — definidas en `globals.css`.

### `IconSmile` debe ser stroke-only

Original era `mode="mixed"` con outer circle filled. En slots con `color: #fff` el círculo blanco cubría la cara entera y los rasgos (también blancos) se perdían. El fix fue pasarlo a stroke-only (outline circle + smile path + filled eyes), ver `icons.tsx` actual. PR #5 en multiplayer.

### Cuando el `IconButton` rocea la curva del marco en desktop

El frame tiene `border-radius: 38px`. Con `padding-top: 18px` (lo que era la `.screen` original), el botón queda muy cerca de la curva visualmente. En `>=480px` se sobrescribe a `padding-top: 26px; padding-right/left: 22px`. Si añades un IconButton variant `accent` (con sombra extra), comprueba que no roce.

---

## Commits y PRs

### Sin trailer

El usuario fue explícito en la conversación inicial: **prohibido el trailer en commits** (`Co-Authored-By: …` etc.). Nunca añadir.

### Cuerpo descriptivo

Cuando el cambio merece explicación, el cuerpo del commit explica:

- **Causa raíz** (no solo el síntoma).
- **Alternativas descartadas** y por qué.
- **Impactos** (qué pasa en otras ramas / pantallas).

Ejemplos buenos: commits `3b52663` (fix Safari iOS), `df4a242` (refuerzo fondo móvil), `2f48ff8` (quita Backdrop), `d5e32dd` (gradientes radiales).

### El usuario mergea las PRs

El agente:

1. Hace lint + build + visual.
2. Commit + push.
3. Abre PR (puede hacerla sobre develop o sobre main según pertinencia).
4. Resume al usuario con los pasos manuales (mergear, redeploy, verificar en iPhone).

NUNCA mergea en GitHub. El usuario lo hace.

---

## Debugging en producción

### El usuario reporta un bug en iPhone que no se reproduce en el preview

Patrón:

1. Verificar que el último commit con el fix está mergeado en `main` (puede ser PR pendiente).
2. Inspeccionar HTML servido en producción con `curl -s https://busca-numeros.pages.dev | grep -oE '<meta[^>]*>'` para ver si los meta tags están bien.
3. Validar que las env vars de Pages están configuradas (especialmente `NEXT_PUBLIC_SITE_URL`).
4. Si todo está bien y sigue mal, pedir al usuario un screenshot — los quirks de iOS Safari muchas veces no se reproducen en simulador ni en preview.

### El usuario reporta que un cambio no se ve

Cosas a verificar:

1. ¿PR mergeada en `main`?
2. ¿Cloudflare Pages redesplegó? (Deployments → ver fecha del último).
3. ¿Cache del navegador? Pedir "Empty cache and hard reload".
4. ¿Hash de OG image cambió? `og:image` lleva un hash en la query — si cambió el `opengraph-image.tsx`, el hash cambia y validators sociales tienen que volver a scrapearlo.
