import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { APP_VERSION } from "@/lib/version";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://busca-numeros.pages.dev";
const SITE_NAME = "BuscaNúmeros";
const DESCRIPTION =
  "Juego mobile-first donde memorizas el orden y tocas los números del 1 al 100 en secuencia. Tres modos (Cuenta atrás, Clásico, Relax), grids 5×5/7×7/10×10 y récords por configuración.";
const SHORT_DESCRIPTION =
  "Memoriza el orden. Toca los números en secuencia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Juego mobile de memoria y velocidad`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "BuscaNúmeros",
    "juego mobile",
    "memoria",
    "velocidad",
    "cuenta atrás",
    "secuencia de números",
    "multijugador",
    "PartyKit",
    "Next.js",
    "PWA",
  ],
  authors: [{ name: "Sebas" }],
  creator: "Sebas",
  publisher: SITE_NAME,
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
    // imagen generada por app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Juego mobile de memoria y velocidad`,
    description: SHORT_DESCRIPTION,
    // se reutiliza la imagen de Open Graph
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Un único theme-color (sin media-query) que el provider sincroniza
  // dinámicamente con el modo claro/oscuro de la app. Evita que iOS
  // Safari aplique un color "del sistema" cuando el modo del sistema y
  // el de la app no coinciden, lo que dejaba franjas blancas en la
  // barra de estado y junto al home indicator.
  themeColor: "#FFF3DE",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body>
        <div id="phone">{children}</div>
      </body>
    </html>
  );
}
