/** Formatea ms a mm:ss.cc (con centisegundos). */
export function formatTime(ms: number | null | undefined): string {
  if (ms == null) return "--:--";
  const total = Math.floor(ms / 10);
  const cs = total % 100;
  const totalSec = Math.floor(total / 100);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

/** Formatea ms a m:ss (sin centisegundos). */
export function formatTimeShort(ms: number | null | undefined): string {
  if (ms == null) return "—";
  const totalSec = Math.floor(ms / 1000);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
