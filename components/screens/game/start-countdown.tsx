"use client";

import { useEffect, useState } from "react";
import { getSfx } from "@/lib/sound";
import styles from "./start-countdown.module.css";

interface StartCountdownProps {
  onComplete: () => void;
}

/**
 * Cuenta atrás 3 · 2 · 1 · ¡YA! antes de que arranque la partida. Bloquea
 * la interacción con el tablero subyacente (overlay con pointer-events).
 */
export function StartCountdown({ onComplete }: StartCountdownProps) {
  // 3 → 2 → 1 → 0 (mostramos "¡YA!") → -1 (completado).
  const [step, setStep] = useState(3);

  // Avanza paso a paso con timers; reproduce un tap suave en cada cambio.
  useEffect(() => {
    if (step < 0) return;
    const sfx = getSfx();
    if (step > 0) sfx.click();
    const delay = step === 0 ? 450 : 850;
    const t = setTimeout(() => {
      if (step === 0) {
        onComplete();
        setStep(-1);
      } else {
        setStep(step - 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  if (step < 0) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      {step > 0 ? (
        <span key={step} className={styles.number}>
          {step}
        </span>
      ) : (
        <span key="go" className={`${styles.number} ${styles.go}`}>
          ¡YA!
        </span>
      )}
    </div>
  );
}
