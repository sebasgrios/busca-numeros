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

## Estructura

- `app/` — layout, estilos globales (tokens y animaciones) y la página.
- `components/ui/` — primitivas reutilizables (Button, Segmented, Switch…).
- `components/screens/` — pantallas (home, game, result, records, settings).
- `lib/` — dominio: tipos, configuración, store, audio, háptica y formato.
- `hooks/` — hooks compartidos (`useNow`, `useClientValue`).
