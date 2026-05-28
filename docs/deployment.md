---
title: Despliegue
summary: Cloudflare Pages para el frontend (main y multiplayer), PartyKit/Cloudflare para el servidor de salas, variables de entorno, custom domains, validación post-deploy.
tags: [deployment, cloudflare, pages, partykit, environment, env, custom-domain, build]
---

# Despliegue

## Resumen rápido

| Rama          | Despliegue                                                                       | URL ejemplo                                |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| `main`        | Cloudflare Pages — proyecto producción (single-player)                            | `https://busca-numeros.pages.dev`          |
| `multiplayer` | (a) Preview del mismo proyecto                                                    | `https://multiplayer.busca-numeros.pages.dev` |
| `multiplayer` | (b) Proyecto Pages separado (recomendado para dominio estable)                    | `https://busca-numeros-mp.pages.dev`       |
| —             | PartyKit Cloudflare Worker (solo necesario para multiplayer)                      | `https://buscanumeros.<user>.partykit.dev` |

## Frontend en Cloudflare Pages

### Configuración (vale para ambos proyectos: main y multiplayer)

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
| `NEXT_PUBLIC_SITE_URL`         | build-time  | `https://busca-numeros.pages.dev`           | `https://multiplayer.busca-numeros.pages.dev` (o equiv.) |
| `NEXT_PUBLIC_PARTYKIT_HOST`    | build-time  | (no aplica en main)                         | `buscanumeros.<user>.partykit.dev`                       |
| `NODE_VERSION`                 | build-time  | `22` o `24`                                 | `22` o `24`                                              |

Cuando cambias estas vars, **fuerza un redeploy** (Deployments → Retry deployment del último) porque están baked-in en el build estático.

### Branch deployments

Cada push a `main` redespliega Production. Cada push a una rama no-productiva genera un **Preview deployment** con URL automática `<branch>.<project>.pages.dev`. Para que `multiplayer` se despliegue como preview hay que:

- Tener habilitadas las preview deployments en el proyecto.
- Que la rama exista en `origin/multiplayer`.
- Asegurarse de que `NEXT_PUBLIC_PARTYKIT_HOST` esté definido bajo **Preview** environment variables.

### Alternativa: proyecto Pages dedicado para `multiplayer`

Mejor si quieres un dominio estable (no `multiplayer.busca-numeros.pages.dev`):

1. Cloudflare → Workers & Pages → **Create application → Pages → Connect to Git**.
2. Mismo repo, **Production branch = `multiplayer`**, mismos build settings.
3. Project name → `busca-numeros-mp` (genera `busca-numeros-mp.pages.dev`).
4. Env vars Production con `NEXT_PUBLIC_PARTYKIT_HOST` y `NEXT_PUBLIC_SITE_URL` apuntando a su dominio.

### Custom domain

Cloudflare Pages → tu proyecto → **Custom domains** → Add → ingresa el dominio. Si está en Cloudflare DNS, el CNAME se configura solo. Si está en otro registrar, Cloudflare da las instrucciones.

Tras añadir custom domain, **actualiza `NEXT_PUBLIC_SITE_URL`** a esa URL para que canonical/og:url/sitemap/JSON-LD usen el dominio bueno.

## Servidor de salas (PartyKit)

### Primera vez

Desde local, con la rama `multiplayer`:

```bash
git checkout multiplayer
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

1. Trabajar en `develop`. Hacer cambios, commit, push.
2. (Opcional) PR `develop → main` cuando hay una tanda lista. Mergear en GitHub.
3. Cloudflare Pages auto-redespliega Production en cuanto detecta push a `main`.
4. (Opcional) Trabajar features de multijugador en `multiplayer`. Merge `develop` cuando hay cambios compartidos.
5. Pages auto-redespliega Preview/proyecto separado de `multiplayer`.
6. (Opcional, solo si cambió `party/`) `pnpm party:deploy` para republicar el servidor de salas.

## Validación post-deploy

Tras el redeploy, verificar en producción:

### Frontend

- Abrir `https://${SITE_URL}` en el navegador. La Home debe cargar con marca, mosaico, botones.
- Inspeccionar HTML: `view-source:https://${SITE_URL}` y buscar:
  - `<meta name="theme-color" content="#FFF3DE"/>`
  - `<meta property="og:image" content=".../opengraph-image?..."/>`
  - `<script type="application/ld+json">...</script>`
- iPhone: verificar que las zonas del status bar y home indicator pinten cremoso (no blanco). Ver [`gotchas.md`](./gotchas.md).
- Compartir el link en un chat de WhatsApp/Telegram: debe aparecer la imagen OG con el tile "12" + brand.

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
5. Repetir para `multiplayer` si afecta.

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
