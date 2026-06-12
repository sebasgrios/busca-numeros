import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "BuscaNúmeros — Memoriza el orden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Carga una fuente de Google Fonts en tiempo de build para que el card use la
// tipografía de la marca (Fredoka para el display, Nunito para el cuerpo).
async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer | null> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());
  const url = css.match(
    /src:\s*url\((https:[^)]+)\)\s*format\('truetype'\)/,
  )?.[1];
  return url ? fetch(url).then((r) => r.arrayBuffer()) : null;
}

// Marca de marca: paleta de la app (ver app/globals.css).
const C = {
  ink: "#2A1B3D",
  inkSoft: "#6E5E80",
  coral: "#FF7B5A",
  sun: "#FFC93C",
  mint: "#4FD1A5",
  sky: "#6BB6FF",
  lavender: "#B98BFB",
  pink: "#FF8FB8",
};

const TILE = 116;
const GAP = 22;

type Cell = { color: string; value?: string; check?: boolean };

// Rejilla 3×3 que reproduce la referencia: tiles ya resueltos (check) y números.
const GRID: Cell[][] = [
  [
    { color: C.mint, check: true },
    { color: C.sky, check: true },
    { color: C.coral, value: "7" },
  ],
  [
    { color: C.sun, value: "3" },
    { color: C.lavender, check: true },
    { color: C.pink, value: "9" },
  ],
  [
    { color: C.sky, value: "5" },
    { color: C.coral, value: "8" },
    { color: C.mint, value: "6" },
  ],
];

// Rotaciones sutiles por tile para dar el aire "hecho a mano".
const ROT = [
  [-3, 2, -2],
  [3, -2, 2],
  [-2, 3, -3],
];

function Check() {
  return (
    <svg width={58} height={58} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="#fff"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function OpenGraphImage() {
  const [fredoka, nunito] = await Promise.all([
    loadGoogleFont("Fredoka", 700),
    loadGoogleFont("Nunito", 800),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          fontFamily: "Fredoka, sans-serif",
          background:
            "radial-gradient(circle at 86% 6%, #FFE08A 0%, rgba(255,224,138,0) 44%)," +
            "radial-gradient(circle at 4% 96%, rgba(255,150,120,0.30) 0%, rgba(255,150,120,0) 40%)," +
            "#FBEFD7",
        }}
      >
        {/* Rejilla 3×3 de tiles */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: GAP,
            flexShrink: 0,
          }}
        >
          {GRID.map((row, r) => (
            <div key={r} style={{ display: "flex", gap: GAP }}>
              {row.map((cell, c) => (
                <div
                  key={c}
                  style={{
                    width: TILE,
                    height: TILE,
                    borderRadius: 28,
                    background: cell.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 60,
                    fontWeight: 700,
                    transform: `rotate(${ROT[r][c]}deg)`,
                    boxShadow: "0 16px 24px -10px rgba(150,110,80,0.45)",
                  }}
                >
                  {cell.check ? (
                    <Check />
                  ) : (
                    <span style={{ paddingTop: 6 }}>{cell.value}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bloque de texto */}
        <div
          style={{
            marginLeft: 88,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -2,
            }}
          >
            <span style={{ color: C.ink }}>Busca</span>
            <span style={{ color: C.coral }}>Números</span>
          </div>

          <div
            style={{
              marginTop: 28,
              fontFamily: "Nunito, sans-serif",
              fontSize: 35,
              fontWeight: 800,
              color: C.inkSoft,
              lineHeight: 1.3,
              maxWidth: 470,
            }}
          >
            Memoriza el orden. Toca del 1 al 100 contrarreloj.
          </div>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              alignItems: "center",
              gap: 14,
              alignSelf: "flex-start",
              padding: "16px 32px",
              borderRadius: 999,
              background: "#fff",
              boxShadow: "0 14px 28px -12px rgba(120,90,70,0.5)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: C.mint,
              }}
            />
            <span
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: 27,
                fontWeight: 800,
                color: C.ink,
              }}
            >
              Juego de memoria y rapidez
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(fredoka
          ? [
              {
                name: "Fredoka",
                data: fredoka,
                weight: 700 as const,
                style: "normal" as const,
              },
            ]
          : []),
        ...(nunito
          ? [
              {
                name: "Nunito",
                data: nunito,
                weight: 800 as const,
                style: "normal" as const,
              },
            ]
          : []),
      ],
    },
  );
}
