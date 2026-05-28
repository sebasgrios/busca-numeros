import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "BuscaNúmeros — Memoriza el orden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  // Cargamos Fredoka 700 desde Google Fonts en tiempo de build para que el
  // texto del card mantenga la tipografía de la marca.
  const fredokaRes = await fetch(
    "https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());
  const fontUrlMatch = fredokaRes.match(
    /src:\s*url\((https:[^)]+)\)\s*format\('truetype'\)/,
  );
  const fontData = fontUrlMatch
    ? await fetch(fontUrlMatch[1]).then((r) => r.arrayBuffer())
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#FFF3DE",
          padding: "0 90px",
          fontFamily: "Fredoka, sans-serif",
        }}
      >
        {/* Tile "12" inclinado */}
        <div
          style={{
            position: "relative",
            width: 360,
            height: 360,
            transform: "rotate(-6deg)",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 56,
              background: "#C44A2E",
              transform: "translateY(22px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 56,
              background: "#FF7B5A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 200,
              fontWeight: 700,
              letterSpacing: -4,
            }}
          >
            12
          </div>
        </div>

        {/* Brand + tagline */}
        <div
          style={{
            marginLeft: 80,
            display: "flex",
            flexDirection: "column",
            color: "#2A1B3D",
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            <span>Busca</span>
            <span style={{ color: "#FF7B5A" }}>Números</span>
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 30,
              color: "#6E5E80",
              fontWeight: 700,
              maxWidth: 600,
              lineHeight: 1.25,
            }}
          >
            Memoriza el orden. Toca del 1 al 100 contra el reloj.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Fredoka", data: fontData, weight: 700, style: "normal" }]
        : undefined,
    },
  );
}
