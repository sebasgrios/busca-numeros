"use client";

import { useRef, useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { getSfx } from "@/lib/sound";
import {
  IconPlay,
  IconStar,
  IconStopwatch,
  IconSwords,
} from "./icons";
import styles from "./how-to-modal.module.css";

interface Slide {
  icon: React.ReactNode;
  title: string;
  text: string;
  color: string;
}

const SLIDES: Slide[] = [
  {
    color: "var(--coral)",
    icon: <IconPlay size={40} />,
    title: "Toca en orden",
    text: "Pulsa los números del 1 al último de la cuadrícula, uno tras otro en secuencia.",
  },
  {
    color: "var(--lavender)",
    icon: <IconStar size={40} />,
    title: "De memoria",
    text: "No se marca cuál es el siguiente: tienes que recordar dónde está cada número.",
  },
  {
    color: "var(--sun)",
    icon: <IconStopwatch size={40} />,
    title: "Contrarreloj",
    text: "Elige Cuenta atrás, Clásico o Relax y bate tu mejor tiempo en los récords.",
  },
  {
    color: "var(--sky)",
    icon: <IconSwords size={40} />,
    title: "Reta a tus amigos",
    text: "Crea o únete a una sala con un código y competid en la misma tabla.",
  },
];

/** Tutorial en carrusel: explica brevemente cómo se juega. */
export function HowToModal({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  const next = () => {
    getSfx().click();
    if (last) onClose();
    else setI((v) => v + 1);
  };
  const prev = () => {
    getSfx().click();
    setI((v) => Math.max(0, v - 1));
  };

  return (
    <Modal>
      <div
        className={styles.slide}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current == null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (dx < -40 && !last) next();
          else if (dx > 40 && i > 0) prev();
        }}
      >
        <span
          className={styles.chip}
          style={{ background: slide.color }}
          aria-hidden="true"
        >
          {slide.icon}
        </span>
        <h2 className={styles.title}>{slide.title}</h2>
        <p className={styles.text}>{slide.text}</p>
      </div>

      <div className={styles.dots} aria-hidden="true">
        {SLIDES.map((_, d) => (
          <span
            key={d}
            className={`${styles.dot} ${d === i ? styles.dotOn : ""}`}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <Button variant="ghost" onClick={i === 0 ? onClose : prev}>
          {i === 0 ? "Saltar" : "Atrás"}
        </Button>
        <Button variant="primary" onClick={next}>
          {last ? "¡Entendido!" : "Siguiente"}
        </Button>
      </div>
    </Modal>
  );
}
