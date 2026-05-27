"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve `Date.now()` actualizado en cada frame mientras `active` sea true.
 * Pensado para temporizadores de alta resolución.
 */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return now;
}
