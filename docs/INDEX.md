---
title: Índice de documentación
summary: Catálogo de toda la documentación de BuscaNúmeros. Router para agentes — decide qué doc cargar según la tarea.
tags: [index, catalog, rag, navigation]
---

# Índice de documentación

Este es el **punto de entrada único** para la documentación del proyecto. Cada archivo es autocontenido (con frontmatter `title/summary/tags`) y está pensado para que un agente cargue **solo el que necesita** sin tener que leer todo el corpus.

## Cómo usar este índice (RAG)

1. Identifica el dominio de la tarea (UI, multijugador, despliegue, SEO…).
2. Mira la tabla **Topic → Archivo** abajo y carga ese doc.
3. Si no estás seguro, lee este INDEX + `../AGENTS.md` y enruta desde ahí.
4. Cada doc lleva enlaces relativos a los demás cuando hace falta contexto cruzado.

> **Convención de frontmatter**: todos los docs llevan YAML con `title`, `summary` (1-2 frases) y `tags` (keywords). Un indexer RAG puede embebir el `summary + tags` por archivo como metadato sin cargar el cuerpo.

---

## Catálogo

| #  | Archivo                                          | Cuándo leerlo                                                                                            |
| -- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| 01 | [`overview.md`](./overview.md)                   | Necesitas entender qué es BuscaNúmeros, qué hace, a quién va dirigido. Empieza aquí si no sabes nada.    |
| 02 | [`architecture.md`](./architecture.md)           | Necesitas saber el stack, la estructura de carpetas, las dependencias o las convenciones de imports.    |
| 03 | [`design-system.md`](./design-system.md)         | Tocas estilos: tokens de color, tipografías, iconos SVG, primitivas (Button, Modal, Segmented).         |
| 04 | [`screens-and-flows.md`](./screens-and-flows.md) | Implementas o cambias una pantalla: Home, Game, Result, Records, Settings o cualquier paso de Retar.    |
| 05 | [`state.md`](./state.md)                         | Tocas el estado global, la persistencia en localStorage o el store de tiempo real.                      |
| 06 | [`gameplay.md`](./gameplay.md)                   | Cambias mecánicas: modos (Cuenta atrás/Clásico/Relax), timer, cuenta atrás 3-2-1, pausa, victoria.       |
| 07 | [`multiplayer.md`](./multiplayer.md)             | Tocas el multijugador (flujo Retar): protocolo, servidor PartyKit, sala, podio vs duelo, revancha.      |
| 08 | [`seo-meta.md`](./seo-meta.md)                   | Meta tags, Open Graph, Twitter Card, JSON-LD, sitemap, robots, favicon, theme-color.                    |
| 09 | [`deployment.md`](./deployment.md)               | Despliegue en Cloudflare Pages, despliegue de PartyKit, env vars, branch deploys, custom domains.       |
| 10 | [`gotchas.md`](./gotchas.md)                     | Quirks de iOS Safari (chrome blur, dvh/lvh/100%, theme-color con media-query, Backdrops…) y aprendizajes. |

---

## Topic → Archivo

Mapa de keywords frecuentes para enrutar rápido.

### Producto

- "qué es / para quién / mecánica básica" → [`overview.md`](./overview.md)
- "modo cuenta atrás / clásico / relax" → [`gameplay.md`](./gameplay.md)
- "grids / 5x5 / 7x7 / 10x10" → [`gameplay.md`](./gameplay.md)
- "récords / leaderboard / estadísticas" → [`screens-and-flows.md`](./screens-and-flows.md) + [`state.md`](./state.md)

### UI / Diseño

- "color / paleta / tema oscuro / tokens" → [`design-system.md`](./design-system.md)
- "Fredoka / Nunito / tipografía" → [`design-system.md`](./design-system.md)
- "icono / SVG / Sun / Moon / Cog…" → [`design-system.md#iconos`](./design-system.md)
- "modal / confirm / podio / duel" → [`screens-and-flows.md`](./screens-and-flows.md)
- "Backdrop / blobs / gradientes" → [`design-system.md`](./design-system.md) + [`gotchas.md`](./gotchas.md)
- "favicon / logo / OG image" → [`seo-meta.md`](./seo-meta.md)

### Lógica de juego

- "timer / temporizador / dvh / requestAnimationFrame" → [`gameplay.md`](./gameplay.md)
- "cuenta atrás 3-2-1 / StartCountdown" → [`gameplay.md`](./gameplay.md)
- "pausa / confirmar salida" → [`gameplay.md`](./gameplay.md)
- "penalización / +3s / -3s / resta tiempo" → [`gameplay.md`](./gameplay.md)
- "victoria / derrota / récord" → [`screens-and-flows.md`](./screens-and-flows.md)

### Estado

- "useGameState / GameStateProvider / store externo" → [`state.md`](./state.md)
- "localStorage / persistencia / hidratación" → [`state.md`](./state.md)
- "useSyncExternalStore / mismatch SSR" → [`state.md`](./state.md) + [`gotchas.md`](./gotchas.md)
- "useClientValue / random / Date.now / hidratación" → [`state.md`](./state.md)

### Multijugador

- "PartyKit / Durable Object / servidor de sala" → [`multiplayer.md`](./multiplayer.md)
- "partysocket / WebSocket / RoomProvider" → [`multiplayer.md`](./multiplayer.md)
- "protocolo / mensajes / ClientMessage / ServerMessage" → [`multiplayer.md`](./multiplayer.md)
- "podio / duelo / 2P / DuelResultModal / PodiumModal" → [`multiplayer.md`](./multiplayer.md)
- "revancha / rematch / Iniciar / leader handoff" → [`multiplayer.md`](./multiplayer.md)
- "código de sala / room code / invite / deep link" → [`multiplayer.md`](./multiplayer.md)

### SEO y meta

- "Open Graph / og:image / Twitter Card" → [`seo-meta.md`](./seo-meta.md)
- "sitemap / robots / canonical" → [`seo-meta.md`](./seo-meta.md)
- "JSON-LD / structured data / schema.org" → [`seo-meta.md`](./seo-meta.md)
- "theme-color / color-scheme / Safari chrome" → [`seo-meta.md`](./seo-meta.md) + [`gotchas.md`](./gotchas.md)

### Despliegue

- "Cloudflare Pages / branch deploy / env vars" → [`deployment.md`](./deployment.md)
- "PartyKit deploy / Durable Object / Cloudflare Worker" → [`deployment.md`](./deployment.md)
- "output: export / build / out/" → [`deployment.md`](./deployment.md) + [`architecture.md`](./architecture.md)

### Bugs / quirks

- "iOS Safari / status bar / home indicator / franja blanca" → [`gotchas.md`](./gotchas.md)
- "scroll en mobile / 100lvh / 100dvh" → [`gotchas.md`](./gotchas.md)
- "lint: setState in effect / react-hooks/refs / purity" → [`gotchas.md`](./gotchas.md)
- "pnpm allowBuilds / sharp / unrs-resolver" → [`gotchas.md`](./gotchas.md)

---

## Glosario rápido

- **SP** = Single Player (juego individual).
- **MP** = Multiplayer (flujo Retar de la app).
- **Podio** = modal de resultado de ≥3 jugadores (1º/2º/3º).
- **Duelo** = modal de resultado de 2 jugadores (ganador único + perdedor).
- **Sala** = room en PartyKit; un Durable Object por sala.
- **Líder** / **anfitrión** = host de la sala (el que la creó). Se traspasa al siguiente jugador si se va.

## Mantenimiento

Si añades un doc nuevo:

1. Crea el archivo en `docs/` con frontmatter YAML (`title`, `summary`, `tags`).
2. Añádelo a la tabla **Catálogo** con una columna "Cuándo leerlo".
3. Si introduce nuevo vocabulario, súmalo a **Topic → Archivo**.
4. Enlaza desde otros docs cuando haya overlap.
