---
title: SEO y meta
summary: Configuración de metadata (title template, description, keywords), Open Graph y Twitter Card, imagen OG generada con next/og + Fredoka, JSON-LD VideoGame, sitemap, robots.txt, favicon SVG, theme-color y color-scheme.
tags: [seo, meta, opengraph, twitter, jsonld, sitemap, robots, favicon, theme-color, color-scheme]
---

# SEO y meta

## Centralizado en `app/layout.tsx`

Todo el meta (excepto los archivos estáticos) sale de `metadata` y `viewport` del root layout. Los valores dependen de:

```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://busca-numeros.pages.dev";
const SITE_NAME = "BuscaNúmeros";
const DESCRIPTION = "Juego mobile-first donde memorizas el orden y tocas los números del 1 al 100 en secuencia. Tres modos (Cuenta atrás, Clásico, Relax), grids 5×5/7×7/10×10 y récords por configuración.";
const SHORT_DESCRIPTION = "Memoriza el orden. Toca los números en secuencia.";
```

`NEXT_PUBLIC_SITE_URL` se configura por entorno en Cloudflare Pages (Production / Preview). Si no está, cae a la URL por defecto del proyecto principal.

## Metadata

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Juego mobile de memoria y velocidad`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...],
  authors: [{ name: "Sebas" }],
  category: "game",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Juego mobile de memoria y velocidad`,
    description: SHORT_DESCRIPTION,
    // images: la genera automáticamente app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Juego mobile de memoria y velocidad`,
    description: SHORT_DESCRIPTION,
    // images: reutiliza la del Open Graph automáticamente
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
};
```

**Importante**: NO se especifica `images` manualmente en `openGraph` ni en `twitter`. Next detecta `app/opengraph-image.tsx` y genera automáticamente `<meta property="og:image" content="/opengraph-image?<hash>"/>` con hash de cache busting + las metas auxiliares (`og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`). Si se especifica `images` manualmente, se rompe el auto-binding y la URL queda sin hash → cache stale.

## Viewport

```ts
export const viewport: Viewport = {
  themeColor: "#FFF3DE",         // un único valor, no array
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};
```

### Por qué `themeColor` es un string y no un array con media queries

iOS Safari aplicaba las metas con `media="(prefers-color-scheme: ...)"` según el modo del **sistema**, no según el toggle de la app. Si los dos no coincidían (o el iOS no aplicaba el media-query), Safari caía al chrome por defecto (blanco) → franja visible alrededor del status bar y home indicator.

**Solución**: un único `theme-color` controlado dinámicamente por el `GameStateProvider`:

```ts
useEffect(() => {
  const dark = state.settings.dark;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#1A1430" : "#FFF3DE";
}, [state.settings.dark]);
```

Más detalles en [`gotchas.md`](./gotchas.md).

## JSON-LD (structured data)

Inserto en `<head>` desde el root layout:

```ts
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: SITE_NAME,
  description: DESCRIPTION,
  url: SITE_URL,
  inLanguage: "es-ES",
  applicationCategory: "Game",
  operatingSystem: "Web (iOS / Android / Desktop)",
  softwareVersion: APP_VERSION,
  genre: ["Memoria", "Velocidad", "Puzzle"],
  playMode: ["SinglePlayer", "MultiPlayer"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  author: { "@type": "Person", name: "Sebas" },
  image: `${SITE_URL}/opengraph-image`,
};

<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
```

`softwareVersion` se actualiza solo al cambiar `package.json -> version` (vía `APP_VERSION` de `lib/version.ts`).

## Open Graph image (`app/opengraph-image.tsx`)

Imagen 1200×630 generada con `next/og` (Satori). Fuente Fredoka cargada en build time desde Google Fonts:

```tsx
export const dynamic = "force-static";   // necesario con output: 'export'
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  // Fetch Fredoka 700 TTF en build time
  const fredokaCSS = await fetch(
    "https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then(r => r.text());
  const fontUrlMatch = fredokaCSS.match(/src:\s*url\((https:[^)]+)\)\s*format\('truetype'\)/);
  const fontData = fontUrlMatch ? await fetch(fontUrlMatch[1]).then(r => r.arrayBuffer()) : null;

  return new ImageResponse(
    (<div style={{ /* layout flex */ }}>
       <div style={{ /* tile 460x460 inclinado -6deg con sombra coral oscura */ }}>
         <div style={{ /* "12" 220px blanco */ }}>12</div>
       </div>
       <div style={{ /* marca "Busca" + "Números" coral, tagline */ }}>...</div>
     </div>),
    { ...size, fonts: fontData ? [{ name: "Fredoka", data: fontData, weight: 700, style: "normal" }] : undefined },
  );
}
```

Composición actual:

- Background crema (`#FFF3DE`).
- Tile **460×460** con `transform: rotate(-6deg)`, fondo coral (`#FF7B5A`) con sombra coral oscura (`#C44A2E`) ofsetada `translateY(24px)` para el look candy.
- "12" en blanco a **220px** Fredoka 700 dentro del tile (más padding interno).
- Marca a la derecha con `marginLeft: 90px` — `Busca` ink + `Números` coral, font 84.
- Tagline en `--ink-soft`, 30px, "Memoriza el orden. Toca los números en secuencia."

> Cualquier cambio en este archivo regenera la PNG en el siguiente `pnpm build`. La URL queda `https://${site}/opengraph-image?<hash>` con hash de cache busting.

## Favicon (`app/icon.svg`)

SVG estático con el tile "12" inclinado coral. Sirve como favicon en pestañas y como app icon en pantalla de inicio iOS (cuando se añade).

```svg
<svg viewBox="0 0 128 128">
  <g transform="rotate(-6 64 64)">
    <rect x="14" y="22" width="100" height="100" rx="22" fill="#C44A2E"/>  <!-- sombra -->
    <rect x="14" y="14" width="100" height="100" rx="22" fill="#FF7B5A"/>  <!-- tile -->
    <text x="64" y="92" text-anchor="middle"
          font-family="system-ui, -apple-system, ..." font-weight="900"
          font-size="64" fill="#ffffff">12</text>
  </g>
</svg>
```

Sirve en `/icon.svg`. Next detecta `app/icon.svg` y emite `<link rel="icon" href="/icon.svg" type="image/svg+xml">` automáticamente.

## Sitemap (`app/sitemap.ts`)

Estático, una sola URL (homepage):

```ts
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  }];
}
```

Sirve en `/sitemap.xml`.

## Robots (`app/robots.ts`)

Estático, allow-all:

```ts
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

Sirve en `/robots.txt`.

## Verificación rápida del HTML generado

```bash
pnpm build
grep -oE '<meta[^>]*(theme-color|color-scheme|og:|twitter:)[^>]*>' out/index.html
grep -oE 'application/ld\+json' out/index.html
ls out/ | grep -iE 'opengraph|robots|sitemap|icon'
```

Output esperado:

```
<meta name="theme-color" content="#FFF3DE"/>
<meta name="color-scheme" content="light dark"/>
<meta property="og:title" content="..."/>
<meta property="og:description" content="..."/>
<meta property="og:image" content=".../opengraph-image?<hash>"/>
<meta property="og:image:type" content="image/png"/>
... (twitter:card, twitter:title, twitter:description, twitter:image)
... application/ld+json (1 ocurrencia, el VideoGame JSON-LD)
icon.svg
opengraph-image
robots.txt
sitemap.xml
```

## Validar OG en producción

Tras desplegar, usa los validators de cada red:

- Facebook: [developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/)
- Twitter/X: [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
- LinkedIn: [linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/)
- WhatsApp: comparte el link en un chat y observa el preview.

Si cambias la imagen, Facebook/LinkedIn pueden tener cache — el validator de Facebook tiene un botón "Scrape Again" para forzar el refresh.

## Modificar metadata

Cualquier cambio en `app/layout.tsx`:

- `DESCRIPTION` y `SHORT_DESCRIPTION` se reflejan en og/twitter/description.
- `SITE_URL` (vía env var) cambia metadataBase, canonical, og:url, sitemap, JSON-LD.
- Tras editar, `pnpm build` regenera HTML estático y la PNG OG si tocaste `opengraph-image.tsx`.
