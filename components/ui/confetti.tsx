"use client";

import { useClientValue } from "@/hooks/use-client-value";
import styles from "./confetti.module.css";

const PALETTE = ["#FF7B5A", "#FFC93C", "#4FD1A5", "#6BB6FF", "#B98BFB", "#FF8FB8"];

interface Piece {
  left: number;
  bg: string;
  dur: number;
  delay: number;
  rot: number;
}

function buildPieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    bg: PALETTE[i % PALETTE.length],
    dur: 2.4 + Math.random() * 2,
    delay: Math.random() * 0.6,
    rot: Math.random() * 360,
  }));
}

/** Lluvia de confeti decorativa para la pantalla de victoria. */
export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useClientValue(() => buildPieces(count)) ?? [];

  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.bg,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
