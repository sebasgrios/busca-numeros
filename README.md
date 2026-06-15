<div align="center">

# 🔢 BuscaNúmeros

<img src="docs/assets/og.png" alt="BuscaNúmeros — Memoriza el orden" width="640">

**Memoriza el orden. Toca los números en secuencia. Bate tu récord.**

Juego *mobile-first* de memoria y velocidad, construido con Next.js 16, React 19 y TypeScript.

<br>

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PartyKit](https://img.shields.io/badge/PartyKit-realtime-FF3E00)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## ✨ Características

| | |
|---|---|
| 🎮 **Tres modos** | Cuenta atrás (penaliza el error), Clásico (un fallo y pierdes) y Relax (sin presión). |
| 🔲 **Grids adaptativos** | Tableros 5×5, 7×7 y 10×10 que se ajustan vía *container queries*. |
| 🗡️ **Multijugador** | Salas con código, hasta 4 jugadores, tablero compartido opcional, progreso fantasma de rivales en la barra y podio al primer ganador. |
| 🏆 **Récords** | Marcas guardadas por configuración, con filtros por grid, modo y duración. |
| 🔊 **Feedback** | Sonido sintetizado con Web Audio, vibración háptica y modo oscuro. |
| 💾 **Persistencia** | Ajustes y récords se conservan en `localStorage`. |

## 🚀 Empezar

```bash
pnpm install
pnpm dev
```

Abre **[localhost:3000](http://localhost:3000)** y a jugar.

```bash
pnpm build   # build de producción
pnpm lint    # análisis estático
```

## 🗡️ Multijugador (PartyKit + Cloudflare)

El servidor de sala es **autoritativo** y vive en un Durable Object por sala
(vía [PartyKit](https://www.partykit.io/), parte de Cloudflare). El frontend se
conecta por WebSocket con `partysocket`.

```bash
pnpm party:dev    # servidor de salas en http://localhost:1999
pnpm dev          # frontend en http://localhost:3000

pnpm party:deploy # despliegue (requiere autenticación en Cloudflare)
```

Define `NEXT_PUBLIC_PARTYKIT_HOST` apuntando al host de PartyKit desplegado en
producción (por defecto `localhost:1999`).

## 🗂️ Estructura

```
app/                 layout, estilos globales (tokens y animaciones) y página
components/
  ui/                primitivas reutilizables (Button, Segmented, TextField…)
  screens/           pantallas (home, game, result, records, settings, challenge)
  providers/         GameStateProvider (individual) y RoomProvider (sala PartyKit)
lib/                 dominio: tipos, config, store, audio, háptica y formato
  multiplayer/       protocolo cliente-servidor e identidad
party/               servidor de sala (Durable Object) ejecutado por PartyKit
hooks/               hooks compartidos (useNow, useClientValue)
```

> [!TIP]
> ¿Vas a trabajar en el proyecto? Empieza por [`AGENTS.md`](AGENTS.md) y la documentación detallada en [`docs/INDEX.md`](docs/INDEX.md).

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta [`LICENSE`](LICENSE) para los detalles.
