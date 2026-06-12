---
title: Overview del producto
summary: Qué es BuscaNúmeros, mecánica básica, modos de juego, audiencia y estado del proyecto.
tags: [overview, product, gameplay-summary, intro]
---

# Overview del producto

## Qué es

**BuscaNúmeros** es un juego mobile-first de memoria y velocidad. El jugador ve una cuadrícula con números desordenados (del 1 al `cols × cols`) y debe tocarlos en orden empezando por el 1. La gracia: tiene que **memorizar el orden** sin pistas — no hay indicador del "siguiente número objetivo" en pantalla, solo la barra de progreso.

## Audiencia y tono

- **Audiencia**: público amplio, juego casual. Diseño "candy" / playful (Fredoka + paleta crema-coral-menta-lavanda).
- **Idioma**: español. UI, mensajes, errores, descripciones — todo en español.
- **Mobile-first**: el diseño está pensado para iPhone/Android en vertical. En escritorio se renderiza un marco de teléfono (max-width 420px) sobre fondo púrpura.

## Modos de juego

| Modo                  | Comportamiento                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **Cuenta atrás** (def.) | Timer regresivo. Cada error **resta tiempo** (penalización configurable, hoy 3s). Se pierde al llegar a 0. |
| **Clásico**            | Cronómetro ascendente. **Un solo error y pierdes** (game over inmediato).                       |
| **Relax**              | Cronómetro ascendente. Sin penalización por error (solo cuenta el contador de errores).        |

En Cuenta atrás, la duración es configurable: 1 min, 2:30, 5 min (default), 10 min, 15 min.

## Tamaños de grid

- **5×5** (25 números)
- **7×7** (49 números)
- **10×10** (100 números) — default

El tablero es adaptativo mediante **container queries** (cell size = `100cqw / cols * X`), así que escala perfecto en cualquier ancho de pantalla.

## Inicio de partida — cuenta atrás 3-2-1-¡YA!

Cada partida (single o multi) muestra una **cuenta atrás de inicio** (`3 → 2 → 1 → ¡YA!`) antes de que el tablero acepte toques. El timer del juego no arranca hasta que el countdown termina.

Ver [`gameplay.md`](./gameplay.md) para la implementación.

## Récords

Cada combinación `(grid × modo × duración)` guarda su propio top 20 en `localStorage`. La pantalla Récords permite filtrar por grid, modo y duración y muestra resumen (victorias, mejor, promedio, total partidas) + top 10.

## Sonido y vibración

- **Sonido**: sintetizado vía Web Audio (no hay assets). Tonos pentatónicos al acertar, sweep grave al fallar, fanfarria al ganar, click al navegar.
- **Vibración háptica**: `navigator.vibrate()` con patrones distintos para acierto, error y victoria. Configurable.

## Modo oscuro

Toggle manual desde Ajustes (en Home no aparece para no saturar). Cambia `data-theme="dark"` en `<html>` y actualiza dinámicamente `<meta name="theme-color">` para que la barra de Safari case con el tema.

## Multijugador

Una opción más de la app: el flujo **Retar** con dos vías (Crear / Unirse a partida) sobre servidor autoritativo PartyKit. Hasta 4 jugadores por sala con código de 4 caracteres. La cuenta atrás de inicio es la misma que en SP.

- Si la ronda la juegan **2 personas** → modal "duelo" (un único ganador celebrado, perdedor ve "ha ganado X").
- Si la juegan **3+ personas** → modal "podio" (1º/2º/3º con medallas numéricas).

Detalles en [`multiplayer.md`](./multiplayer.md).

## Estado del proyecto

- **Versión actual**: leída de `package.json -> "version"`. Visible en Ajustes al pie.
- **Ramas** (Gitflow):
  - `main` — producción Cloudflare Pages, app completa (SP + multijugador).
  - `develop` — integración, base para PRs a main y para nuevas features.
- **Deploy** (unificado, un solo proyecto):
  - Frontend en Cloudflare Pages (rama main).
  - Servidor de salas en PartyKit (parte de Cloudflare).

Ver [`deployment.md`](./deployment.md) para los pasos.

## ¿Y ahora qué?

- Si vas a tocar UI/estilos → [`design-system.md`](./design-system.md) + [`screens-and-flows.md`](./screens-and-flows.md).
- Si vas a tocar lógica de juego → [`gameplay.md`](./gameplay.md).
- Si vas a tocar multijugador → [`multiplayer.md`](./multiplayer.md).
- Si te preguntas "por qué pasa X en iOS" → [`gotchas.md`](./gotchas.md).
