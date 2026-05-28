---
title: Sistema de diseño
summary: Tokens (color, radio, sombra), tipografías, paleta de blobs, iconos SVG custom, primitivas UI y patrones visuales del juego.
tags: [design, tokens, colors, typography, icons, ui, components, css-modules]
---

# Sistema de diseño

## Estilo general

"Candy" / playful / kids-game. Trazos gruesos redondeados, sombras "candy" sólidas con offset (no soft blur), colores saturados, tipografía display redondeada. Inspiración: emojis de niños y juguetes de plástico brillantes.

## Tokens (`app/globals.css`)

### Light theme (`:root`)

```css
--bg:          #FFF3DE;  /* crema claro */
--bg-accent:   #FFE8C7;  /* crema más cálido (chips, tracks) */
--surface:     #FFFFFF;  /* tarjetas */
--surface-2:   #FFF8EC;  /* tablero */
--ink:         #2A1B3D;  /* texto principal (púrpura oscuro) */
--ink-soft:    #6E5E80;  /* texto secundario */
--line:        #F0DDB8;  /* borders */
```

### Accent palette (compartida)

```css
--coral:    #FF7B5A;
--sun:      #FFC93C;
--mint:     #4FD1A5;
--sky:      #6BB6FF;
--lavender: #B98BFB;
--pink:     #FF8FB8;

--good: var(--mint);
--bad:  #FF5C72;
```

Los accents se usan para celdas del board, blobs del fondo, badge "NUEVO RÉCORD", botones secundarios, etc. **No se redefinen en dark** — se mantienen vivos en ambos modos.

### Dark theme (`[data-theme="dark"]`)

```css
--bg:         #1A1430;
--bg-accent:  #241B45;
--surface:    #2B2050;
--surface-2:  #322560;
--ink:        #FFF8EC;
--ink-soft:   #B5A8D4;
--line:       #3C2E6F;
```

### Sombras

```css
--shadow-soft:  0 6px 0 rgba(42, 27, 61, 0.10);   /* sombra candy ofsetada */
--shadow-card:  0 12px 28px -16px rgba(42, 27, 61, 0.35);
--shadow-press: 0 2px 0 rgba(42, 27, 61, 0.12);
```

La sombra característica son los botones con `box-shadow: 0 6px 0 #c44a2e, var(--shadow-card)` — un offset duro detrás (color oscurecido del botón) que da la sensación 3D, y un soft glow por debajo. Al pulsar, `translateY(4px)` + sombra reducida.

### Radii

```css
--r-sm: 10px;
--r-md: 16px;
--r-lg: 22px;
--r-xl: 28px;
```

### Fuentes (vars CSS)

```css
--display: var(--font-display), system-ui, sans-serif;   /* Fredoka */
--body:    var(--font-body), system-ui, sans-serif;      /* Nunito */
```

`var(--font-display)` y `var(--font-body)` los inyecta `next/font` desde `app/layout.tsx`. Fredoka pesos 500/600/700, Nunito 500/700/800.

## Paleta multijugador (`COLOR_HEX` en `lib/multiplayer/protocol.ts`)

Solo cuatro colores asignables a jugadores en sala:

```ts
rojo:     #FF5C72
cian:     #39C5D4
amarillo: #FFC93C
lima:     #9BE15D
```

Asignación aleatoria por el servidor según orden de unión. No se reutilizan colores en una misma sala (capacity ≤ 4 = al menos uno disponible).

## Tipografía

- **Display (Fredoka)**: títulos, marca, botones primarios, tiempos grandes, números del podio. Pesos 600/700. `letter-spacing` ligeramente negativo en displays grandes para apretar.
- **Body (Nunito)**: descripciones, labels uppercase, ayuda. Pesos 700/800.

Los números siempre usan `font-variant-numeric: tabular-nums` para evitar saltos al cambiar de cifra (timer, récords).

## Animaciones globales (`globals.css`)

Definidas en root porque se referencian por nombre desde CSS Modules:

| Keyframe         | Uso                                                  |
| ---------------- | ---------------------------------------------------- |
| `screen-in`      | Entrada de cada pantalla (.screen)                   |
| `bob`            | Tiles del logo Home rebotando suave                  |
| `timerBump`      | Pulso del timer al acertar                           |
| `timerLow`       | Pulso rojo cuando quedan <10s en cuenta atrás        |
| `timerPenalty`   | Shake del timer al sumar penalización                |
| `checkin`        | Aparición del ✓ blanco en celda acertada             |
| `shake`          | Vibración horizontal al fallar                       |
| `fall`           | Confeti cayendo                                      |
| `pop`            | Aparición de modales / emoji circles                 |
| `wiggle`         | Badge "★ NUEVO RÉCORD" oscilando                     |
| `toastin`        | Entrada del toast                                    |

Si añades una animación que se usa desde un CSS Module, **defínela en `globals.css`** (los keyframes en módulos quedan scoped y no son accesibles desde otros).

## Marco de teléfono (`#phone`)

En `<480px` el viewport es full-bleed (sin marco). En `>=480px` se renderiza un teléfono falso de 420×860 con `border-radius: 38px` y un border simulado con `box-shadow: 0 0 0 8px #15102a, 0 0 0 9px #2A1B3D`. Sobre fondo púrpura `radial-gradient`.

> ⚠️ El radio de 38px en el `#phone` puede recortar contenido pegado a los bordes. Por eso el `.screen` lleva `padding-top: 26px; padding-right/left: 22px` en `>=480px` (ver `screen.module.css`). Si añades algo en la esquina superior, comprueba que no quede pegado a la curva.

## Iconos (`components/ui/icons.tsx`)

Set custom dibujado a mano, NO librería. Estilo: trazos de 2.4 con caps/joins redondeados; algunos rellenos (Play, Trophy, Star, Person, Moon) para chunkier feel. `viewBox` 24x24, tamaño por prop (default 24), color por `currentColor`.

**Iconos disponibles**:

- `IconSun`, `IconMoon`, `IconCog`, `IconArrowLeft`, `IconX`, `IconTrash`
- `IconPlay`, `IconTrophy`, `IconSwords`, `IconKey`, `IconPlus`, `IconRefresh`
- `IconStopwatch`, `IconSmile`, `IconPerson`, `IconCopy`, `IconCheck`, `IconStar`

Usar `currentColor` para que el icono herede del botón:

```tsx
<Button variant="primary">
  <IconPlay size={20} />
  Jugar
</Button>
```

Para añadir uno: copia un componente existente, sustituye los paths. Si el icono va dentro de un slot avatar (waiting room, podium) usar estilo **outline** (no fill) para que se vea sobre cualquier color de fondo — caso `IconSmile`.

## Primitivas (`components/ui/`)

### `Button`

Variantes: `primary` (coral), `ghost` (surface), `secondary` (sky), + `block` (full-width) y `comingSoon` (estado deshabilitado con badge "PRÓXIMAMENTE" lavanda). Disabled nativo aplica opacidad y sin transform.

### `IconButton`

Cuadrado 42×42 con sombra candy. Variante `accent` (coral con sombra ofsetada) para botones permanentes destacados (el cog de Home, por ejemplo).

### `Modal` y `ConfirmModal`

`Modal` es el wrapper genérico (overlay con blur + card centrada + animación pop). `ConfirmModal` añade dos botones primary/ghost para confirmar/cancelar.

### `Segmented`

Selector tipo iOS pill. Variantes: `default`, `stack` (vertical con sub-text), `compact`, `compactWrap`. Soporta value primitivo o `null` (para opciones "Todos"). Usa `aria-pressed`/`role="radio"` según el prop `radio`.

### `Switch`

Toggle on/off con `aria-pressed`. Color activo: mint.

### `StatCard`

Tarjeta con label uppercase + valor en display. Variante `dense` (valor más pequeño 22px en lugar de 24).

### `TextField`

Input con bg `--bg-accent`, focus ring coral. Variante `code` (uppercase + letter-spacing amplio) para el código de sala.

### `Toast`

Píldora flotante en la parte inferior. Aparece con animación, se auto-cierra a los 1.8s.

### `SectionTitle`, `SettingGroup`, `BottomInfo`, `TopBar`, `Backdrop`, `Confetti`

Bloques estructurales. Backdrop puede recibir `blobs={['b1','b2','b3']}` para seleccionar cuáles renderizar.

## Backdrop y blobs

El componente `<Backdrop />` pinta hasta 3 blobs difuminados absolute-positioned (b1: sun upper-right, b2: coral lower-left, b3: mint left-middle). Cada blob es un `<div>` con `filter: blur(34px)`.

### ⚠️ Home no usa `<Backdrop />`

Por un quirk de iOS Safari: el chrome del navegador (status bar, área del home indicator) tinta su fondo blureando el contenido de la página. Si los blobs tocan los bordes superior/inferior, esa tinta se ve diferente al cremoso central → franja visible. **Solución**: en Home se usa `background-image` con 3 `radial-gradient` posicionados al **25%–75% vertical** sobre `.home`, así los bordes quedan en cremoso puro.

Detalles en [`gotchas.md`](./gotchas.md).

## Patrones visuales

### Botón candy

```css
.btn-primary {
  background: var(--coral);
  color: #fff;
  box-shadow: 0 6px 0 #C44A2E, var(--shadow-card);
}
.btn-primary:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #C44A2E;
}
```

### Card con sombra suave

```css
.stat-card {
  background: var(--surface);
  border-radius: var(--r-md);
  padding: 12px 14px;
  box-shadow: var(--shadow-card);
}
```

### Celda del tablero

Usa container queries para escalar font-size con el ancho del tablero:

```css
.cell {
  font-size: calc(100cqw / var(--cols) * 0.40);
  border-radius: calc(10cqw / var(--cols) * 0.9);
  aspect-ratio: 1 / 1;
}
```

El tablero `<div>` se marca con `container-type: inline-size` y la var `--cols`.

## Modo oscuro

- Toggle de tema vive en **Settings** (no en Home — el toggle se ocultó por accesibilidad/limpieza). En Home solo aparece el cog (variante accent coral).
- Cambia `[data-theme]` en `<html>` desde `GameStateProvider`.
- Actualiza `<meta name="theme-color">` dinámicamente al alternar.

## Capa fija de fondo

`html::before { position: fixed; inset: 0; background: var(--bg); z-index: -1 }` es una red de seguridad para que, ante cualquier overscroll, transición o filtración del chrome de Safari, siempre se vea el color del tema y no el blanco por defecto del navegador. Ver [`gotchas.md`](./gotchas.md).

## Reglas de oro

1. **No mezclar shorthand `background` con `background-color` cuando hay tokens dinámicos** — usar siempre `background-color` para asegurar que el bg pinta como sólido inmediato.
2. **Animaciones globales en `globals.css`**, no en CSS Modules (los keyframes en módulos se hashea y deja de ser accesible por nombre).
3. **`currentColor` por defecto** en iconos para que hereden de su contenedor.
4. **Tamaños relativos** para el tablero (container queries) — no fijar pixels.
5. **No usar emojis en UI** — siempre SVG del set (`components/ui/icons.tsx`). Razón: rendering consistente cross-platform y poder colorearlos con `currentColor`.
