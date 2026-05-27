"use client";

import { useEffect, useState } from "react";

/**
 * Calcula un valor solo en el cliente, una vez tras el montaje. Útil para
 * datos no deterministas (Math.random, Date.now) que provocarían un
 * desajuste de hidratación si se generasen durante el render en servidor.
 *
 * Devuelve `null` en el primer render (servidor y montaje) y el valor real
 * después. `factory` se evalúa una sola vez con su closure de montaje.
 */
export function useClientValue<T>(factory: () => T): T | null {
  const [value, setValue] = useState<T | null>(null);

  useEffect(
    () => {
      // Init única en cliente, deliberadamente fuera del render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(factory());
    },
    // Se evalúa solo al montar; ignoramos el cambio de `factory`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return value;
}
