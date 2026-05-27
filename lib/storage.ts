import type { AppState, GameConfig } from "./types";

export const STORAGE_KEY = "buscanumeros:v1";

export const DEFAULT_GAME: GameConfig = {
  cols: 10,
  mode: "countdown",
  duration: 300,
};

function freshState(): AppState {
  return {
    records: [],
    played: 0,
    settings: {
      sound: true,
      haptic: true,
      dark: false,
      game: { ...DEFAULT_GAME },
    },
  };
}

/** Lee el estado persistido, fusionando con los valores por defecto. */
export function loadState(): AppState {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      records: parsed.records ?? [],
      played: parsed.played ?? 0,
      settings: {
        sound: true,
        haptic: true,
        dark: false,
        ...(parsed.settings ?? {}),
        game: { ...DEFAULT_GAME, ...(parsed.settings?.game ?? {}) },
      },
    };
  } catch {
    return freshState();
  }
}

/** Persiste el estado en localStorage (silencioso ante errores). */
export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}
