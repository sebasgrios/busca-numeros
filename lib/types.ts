export type GameMode = "countdown" | "classic" | "relax";

export interface GameConfig {
  cols: number;
  mode: GameMode;
  duration: number; // segundos (usado en modo cuenta atrás)
}

export interface Settings {
  sound: boolean;
  haptic: boolean;
  dark: boolean;
  game: GameConfig;
}

export interface GameRecord {
  id: string;
  time: number; // ms
  at: number; // timestamp epoch
  config: string; // clave de configuración (ver configKey)
  wrong: number; // nº de errores cometidos
}

export interface AppState {
  records: GameRecord[];
  played: number;
  /** Si el usuario ya vio el tutorial de "cómo se juega" (1ª visita). */
  seenHowTo: boolean;
  settings: Settings;
}

export type Screen =
  | "home"
  | "game"
  | "win"
  | "lose"
  | "records"
  | "settings"
  | "challenge";

export interface WinInfo {
  time: number;
  isRecord: boolean;
  rank: number;
  config: string;
  remaining: number | null;
}

export type LoseReason = "timeout" | "mistake";

export interface LoseInfo {
  reason: LoseReason;
  reachedTo: number;
  timeAt: number;
  total: number;
  config: string;
  tapped?: number;
  expected?: number;
}
