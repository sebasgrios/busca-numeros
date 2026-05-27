/** Dispara vibración háptica si el dispositivo y el navegador lo permiten. */
export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* no soportado: se ignora */
  }
}
