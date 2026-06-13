"use client";

import { useEffect, useRef, useState } from "react";
import { LandingInfo } from "./landing-info";
import styles from "./landing-shell.module.css";

/** Ancho mínimo del panel de juego: el teléfono se ve completo con aire. */
const GAME_MIN = 480;
/** Si la columna de información baja de este ancho, se cierra del todo. */
const INFO_SNAP = 300;
/** % de juego a partir del cual la información está oculta. */
const COLLAPSED = 99.5;
/** Breakpoint para pasar de "solo juego" a "split con información". */
const DESKTOP_MIN = 860;
/** Reparto por defecto: el juego ocupa el 42% del ancho. */
const DEFAULT_PCT = 42;
const SPLIT_STORE = "bn-landing-split";

/** Icono de pantalla completa: esquinas hacia fuera (expandir) o dentro. */
function FsIcon({ full }: { full: boolean }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {full ? (
        <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
      ) : (
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      )}
    </svg>
  );
}

interface LandingShellProps {
  children: React.ReactNode;
}

/**
 * Envuelve el juego en una landing dividida en dos columnas (información a
 * la izquierda, juego a la derecha). El reparto se redimensiona arrastrando
 * el seam o con el botón de la esquina, y se persiste en localStorage. Por
 * debajo de 860px solo se muestra el juego, sin tocar nada de su lógica.
 */
export function LandingShell({ children }: LandingShellProps) {
  // El ancho de ventana y el reparto guardado se leen tras montar para no
  // romper la hidratación SSR (en el servidor no existe `window`).
  const [winW, setWinW] = useState(0);
  const [pct, setPct] = useState(DEFAULT_PCT);
  const [dragging, setDragging] = useState(false);
  const prevPct = useRef(DEFAULT_PCT);
  const hydrated = useRef(false);

  useEffect(() => {
    // Init única en cliente: el ancho de ventana y el reparto guardado se
    // leen tras montar para no romper la hidratación SSR. Es un caso
    // legítimo de setState en efecto (igual que `useClientValue`).
    const stored = Number.parseFloat(
      window.localStorage.getItem(SPLIT_STORE) ?? "",
    );
    if (Number.isFinite(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPct(stored);
      prevPct.current = stored;
    }
    hydrated.current = true;
    setWinW(window.innerWidth);

    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // No persistir el valor por defecto del primer render (pre-hidratación).
    if (hydrated.current) window.localStorage.setItem(SPLIT_STORE, String(pct));
  }, [pct]);

  // Arrastrar el seam recalcula el reparto; puede ocultar la información.
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const gamePx = w - e.clientX; // ancho del juego = lo que queda a la derecha
      const infoPx = e.clientX; // ancho restante de la información
      const minPct = Math.min(99, (GAME_MIN / w) * 100);
      let p = (gamePx / w) * 100;
      if (infoPx < INFO_SNAP) p = 100; // se cierra del todo si queda muy estrecho
      setPct(Math.min(Math.max(p, minPct), 100));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging]);

  const desktop = winW >= DESKTOP_MIN;
  const minPct = winW > 0 ? Math.min(99, (GAME_MIN / winW) * 100) : 0;
  const clampedPct = Math.min(Math.max(pct, minPct), 100);
  const collapsed = clampedPct >= COLLAPSED;

  // El botón hace lo mismo que el seam: ocultar / restaurar la información.
  const toggle = () => {
    if (collapsed) {
      const back =
        prevPct.current && prevPct.current < COLLAPSED
          ? prevPct.current
          : DEFAULT_PCT;
      setPct(back);
    } else {
      prevPct.current = clampedPct;
      setPct(100);
    }
  };

  const shellStyle = desktop
    ? ({ "--info-w": `${100 - clampedPct}vw` } as React.CSSProperties)
    : undefined;

  const shellClasses = [
    styles.shell,
    dragging ? styles.dragging : "",
    collapsed ? styles.collapsed : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClasses} style={shellStyle}>
      <LandingInfo />

      {desktop && (
        <div
          className={styles.seam}
          onPointerDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          role="separator"
          aria-orientation="vertical"
          aria-label="Arrastra para redimensionar u ocultar la información"
        />
      )}

      <div className={styles.gamePane}>{children}</div>

      {desktop && (
        <button
          type="button"
          className={styles.fsBtn}
          onClick={toggle}
          title={collapsed ? "Mostrar la información" : "Ocultar la información"}
          aria-label={
            collapsed ? "Mostrar la información" : "Ocultar la información"
          }
          aria-pressed={collapsed}
        >
          <FsIcon full={collapsed} />
        </button>
      )}
    </div>
  );
}
