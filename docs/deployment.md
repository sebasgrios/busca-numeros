---
title: Despliegue
summary: Cloudflare Pages para el frontend, PartyKit/Cloudflare para el servidor de salas, variables de entorno, custom domains, validación post-deploy. Despliegue unificado (single-player + multijugador).
tags: [deployment, cloudflare, pages, partykit, environment, env, custom-domain, build]
---

# Despliegue

## Resumen rápido

La app es **un solo proyecto** (single-player + multijugador) con dos piezas de despliegue:

| Componente          | Despliegue                                                  | URL ejemplo                                |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| Frontend            | Cloudflare Pages — proyecto producción (rama `main`)        | `https://busca-numeros.pages.dev`          |
| Servidor de salas   | PartyKit Cloudflare Worker (multijugador)                   | `https://buscanumeros.<user>.partykit.dev` |

## Frontend en Cloudflare Pages

### Configuración

| Campo                   | Valor                            |
| ----------------------- | -------------------------------- |
| Framework preset        | **None** (no Next.js preset)     |
| Build command           | `pnpm install && pnpm build`     |
| Build output directory  | **`out`**                        |
| Root directory          | (vacío)                          |
| Node version            | `NODE_VERSION = 22` (o 24)       |

> ⚠️ El directorio es `out`, no `.next`. Con `output: 'export'`, Next genera HTML estático en `out/` y `.next/` es solo intermedio. Si pones `.next`, Pages servirá assets sin `index.html` y verás 404. Histórico en PR #2.

### Environment variables

| Variable                       | Dónde       | Production                                  | Preview                                                  |
| ------------------------------ | ----------- | ------------------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | build-time  | `https://busca-numeros.pages.dev`           | URL de preview de la rama (o equiv.)                     |
| `NEXT_PUBLIC_PARTYKIT_HOST`    | build-time  | `buscanumeros.<user>.partykit.dev`          | `buscanumeros.<user>.partykit.dev`                       |
| `NODE_VERSION`                 | build-time  | `22` o `24`                                 | `22` o `24`                                              |

> `NEXT_PUBLIC_PARTYKIT_HOST` es necesaria también en Production: el botón "Retar" la usa para conectar al servidor de salas. Si falta, el multijugador apuntaría a `localhost:1999`.

Cuando cambias estas vars, **fuerza un redeploy** (Deployments → Retry deployment del último) porque están baked-in en el build estático.

### Branch deployments

Cada push a `main` redespliega Production. Cada push a una rama no-productiva (p. ej. una `feature/*` desde `develop`) genera un **Preview deployment** con URL automática `<branch>.<project>.pages.dev`. Para que los previews funcionen completos:

- Tener habilitadas las preview deployments en el proyecto.
- Definir `NEXT_PUBLIC_PARTYKIT_HOST` también bajo **Preview** environment variables (si vas a probar multijugador desde el preview).

### Custom domain

Cloudflare Pages → tu proyecto → **Custom domains** → Add → ingresa el dominio. Si está en Cloudflare DNS, el CNAME se configura solo. Si está en otro registrar, Cloudflare da las instrucciones.

Tras añadir custom domain, **actualiza `NEXT_PUBLIC_SITE_URL`** a esa URL para que canonical/og:url/sitemap/JSON-LD usen el dominio bueno.

## Servidor de salas (PartyKit)

### Primera vez

Desde local, en `main`/`develop` (el código del servidor vive en `party/`):

```bash
pnpm install
pnpm party:deploy
```

- Te pedirá login en Cloudflare/PartyKit (abre navegador).
- Devuelve el host: `https://buscanumeros.<tu-usuario-partykit>.partykit.dev`.
- Anótalo — lo necesitas en `NEXT_PUBLIC_PARTYKIT_HOST`.

### Releases posteriores

```bash
pnpm party:deploy
```

Mismo host. Cada deploy publica el código actual de `party/game-room.ts` + `partykit.json`.

### Configuración (`partykit.json`)

```json
{
  "$schema": "https://www.partykit.io/schema.json",
  "name": "buscanumeros",
  "main": "party/game-room.ts",
  "compatibilityDate": "2025-05-01"
}
```

El `name` se convierte en el subdomain prefix. Cámbialo si quieres otro host.

### Coste

- **Cloudflare Pages**: free tier (500 builds/mes, ancho de banda ilimitado para uso normal).
- **PartyKit**: free tier sobre Durable Objects con SQLite (gratis) y WebSocket Hibernation API (coste ~0 en reposo).

Para ≤4 jugadores por sala y tráfico casual, todo cabe en gratis.

## Flujo típico de release

1. Trabajar en una rama `feature/*` o `fix/*` creada desde `develop`. Commit, push, PR a `develop`.
2. PR `develop → main` cuando hay una tanda lista. Mergear en GitHub.
3. Cloudflare Pages auto-redespliega Production en cuanto detecta push a `main`.
4. (Solo si cambió `party/`) `pnpm party:deploy` para republicar el servidor de salas.

## Validación post-deploy

Tras el redeploy, verificar en producción:

### Frontend

- Abrir `https://${SITE_URL}` en el navegador. La Home debe cargar con marca, mosaico, botones.
- Inspeccionar HTML: `view-source:https://${SITE_URL}` y buscar:
  - `<meta name="theme-color" content="#FFF3DE"/>`
  - `<meta property="og:image" content=".../opengraph-image?..."/>`
  - `<script type="application/ld+json">...</script>`
- iPhone: verificar que las zonas del status bar y home indicator pinten cremoso (no blanco). Ver [`gotchas.md`](./gotchas.md).
- Compartir el link en un chat de WhatsApp/Telegram: debe aparecer la imagen OG (rejilla 3×3 de tiles + marca y tagline).

### Servidor de salas

- `wss://buscanumeros.<user>.partykit.dev/parties/main/TEST` (con un cliente PartySocket) debe aceptar conexión y responder al `peek`.
- Probar end-to-end: dos navegadores, uno crea sala (anota código), otro pega `/?join=CODE` → debe entrar y arrancar partida.

### Validators de RRSS

- **Facebook**: [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/) → pegar URL → "Scrape Again".
- **Twitter/X**: [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator).
- **LinkedIn**: [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/).

## Hotfix flow

Si algo está roto en producción y hay que arreglarlo rápido:

1. Branch desde `main`: `git checkout main && git pull && git checkout -b hotfix/foo`.
2. Fix + commit + push de la rama hotfix.
3. PR `hotfix/foo → main`. Merge.
4. Re-pulear los cambios a `develop`: `git checkout develop && git merge main`.

Históricamente el repo ha funcionado sin hotfix branches — los fixes han ido siempre por `develop → main` (PRs #2 y #5 son ejemplos). Solo recurrir a hotfix si una PR de `develop` está bloqueada por otros cambios sin desplegar.

## Histórico de PRs

| PR  | Cambio principal                                                |
| --- | --------------------------------------------------------------- |
| #1  | BuscaNúmeros v1: juego mobile-first completo                    |
| #2  | fix: export estático para Cloudflare Pages (out vs .next)       |
| #3  | iconos SVG custom, favicon, fondo móvil, modal salida           |
| #4  | SEO completo, OG image, IconSwords v2                           |
| #5  | fix Safari iOS: franjas blancas status bar y home indicator     |
| #6  | versión dinámica, copy cuenta atrás, padding desktop            |
| #7  | quita Backdrop de Home, revierte body lvh                       |
| #8  | restaura fondo Home con gradientes radiales (sin tintar bordes) |
| #9  | cuenta atrás 3-2-1-¡YA!, pausa SP, OG mejorado, copy            |

Patrón: cada PR tiene Resumen / Cambios / Detalles técnicos / Verificación. El usuario mergea en GitHub.
