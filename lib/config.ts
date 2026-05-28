import type { GameConfig, GameMode } from "./types";

/** Paleta de acentos (variables CSS) usada para celdas y logo. */
export const COLORS = [
  "var(--mint)",
  "var(--sky)",
  "var(--coral)",
  "var(--sun)",
  "var(--lavender)",
  "var(--pink)",
] as const;

export interface GridOption {
  cols: number;
  label: string;
  sub: string;
}

export interface ModeOption {
  id: GameMode;
  label: string;
  sub: string;
}

export interface CountdownOption {
  value: number;
  label: string;
}

export const GRID_OPTIONS: GridOption[] = [
  { cols: 5, label: "5 × 5", sub: "25 nº" },
  { cols: 7, label: "7 × 7", sub: "49 nº" },
  { cols: 10, label: "10 × 10", sub: "100 nº" },
];

export const MODE_OPTIONS: ModeOption[] = [
  { id: "countdown", label: "Cuenta atrás", sub: "tiempo limitado" },
  { id: "classic", label: "Clásico", sub: "1 error y pierdes" },
  { id: "relax", label: "Relax", sub: "sin penalización" },
];

export const COUNTDOWN_OPTIONS: CountdownOption[] = [
  { value: 60, label: "1 min" },
  { value: 150, label: "2:30" },
  { value: 300, label: "5 min" },
  { value: 600, label: "10 min" },
  { value: 900, label: "15 min" },
];

/** Penalización en ms por cada error en modo cuenta atrás. */
export const COUNTDOWN_PENALTY_MS = 3000;

/** Mezcla un array (Fisher–Yates) sin mutar el original. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type ConfigLike = Pick<GameConfig, "cols" | "mode"> & { duration?: number };

/** Serializa una configuración a una clave estable para agrupar récords. */
export function configKey(cfg: ConfigLike): string {
  if (cfg.mode === "countdown") {
    return `${cfg.cols}x${cfg.cols}-countdown-${cfg.duration ?? 300}`;
  }
  return `${cfg.cols}x${cfg.cols}-${cfg.mode}`;
}

/** Etiqueta legible de una configuración para chips y listas. */
export function configLabel(cfg: ConfigLike): string {
  const mode = MODE_OPTIONS.find((m) => m.id === cfg.mode);
  const modeLabel = mode ? mode.label : cfg.mode;
  if (cfg.mode === "countdown") {
    const d = COUNTDOWN_OPTIONS.find((o) => o.value === (cfg.duration ?? 300));
    return `${cfg.cols} × ${cfg.cols} · ${modeLabel} ${d ? d.label : ""}`.trim();
  }
  return `${cfg.cols} × ${cfg.cols} · ${modeLabel}`;
}

/** Inverso de configKey. Devuelve null si la clave no es válida. */
export function parseConfigKey(
  key: string,
): { cols: number; mode: GameMode; duration?: number } | null {
  const parts = key.split("-");
  if (parts.length < 2) return null;
  const colsMatch = parts[0].match(/^(\d+)x\d+$/);
  if (!colsMatch) return null;
  const cols = parseInt(colsMatch[1], 10);
  const mode = parts[1] as GameMode;
  if (mode === "countdown") {
    const duration = parts[2] ? parseInt(parts[2], 10) : 300;
    return { cols, mode, duration };
  }
  return { cols, mode };
}
