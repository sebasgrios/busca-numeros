import type { GameMode } from "../types";

/** Máximo de jugadores por sala. */
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;

/** Longitud máxima de un nombre de jugador. */
export const MAX_NAME_LEN = 20;

/** Cotas de duración de ronda en segundos (límites del servidor). */
export const MIN_DURATION = 10;
export const MAX_DURATION = 3600;

export type PlayerColor = "rojo" | "cian" | "amarillo" | "lima";

/** Pool de colores asignables (en orden de preferencia). */
export const PLAYER_COLORS: PlayerColor[] = ["rojo", "cian", "amarillo", "lima"];

/** Equivalente hex de cada color de jugador. */
export const COLOR_HEX: Record<PlayerColor, string> = {
  rojo: "#FF5C72",
  cian: "#39C5D4",
  amarillo: "#FFC93C",
  lima: "#9BE15D",
};

export type BoardMode = "shared" | "independent";
export type RoomStatus = "lobby" | "playing" | "finished";
export type PlayerRoundStatus = "idle" | "playing" | "finished" | "eliminated";
export type LoseReason = "mistake" | "timeout";

export interface RoomConfig {
  cols: number;
  mode: GameMode;
  duration: number;
  capacity: number; // MIN_PLAYERS..MAX_PLAYERS
  board: BoardMode;
}

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  cols: 5,
  mode: "countdown",
  duration: 300,
  // Capacidad máxima fija a 4. El UI de creación ya no la expone como
  // selector; el modal de duelo se decide por el nº real de jugadores.
  capacity: 4,
  board: "shared",
};

export interface PlayerView {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  progress: number; // celdas completadas en la ronda actual
  status: PlayerRoundStatus;
  rematchReady: boolean;
}

export interface PodiumEntry {
  id: string;
  name: string;
  color: PlayerColor;
  place: number; // 1, 2, 3...
  progress: number;
  time: number | null; // ms si completó, null en otro caso
  reason: LoseReason | null;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string | null;
  config: RoomConfig;
  players: PlayerView[];
  seed: number | null; // semilla compartida (board === "shared")
  round: number;
  startedAt: number | null; // epoch ms del servidor al iniciar
  total: number; // nº total de celdas (cols * cols)
  podium: PodiumEntry[] | null;
}

// ===== Cliente -> Servidor =====
export type ClientMessage =
  | { type: "create"; name: string; config: RoomConfig }
  | { type: "peek" }
  | { type: "join"; name: string }
  | { type: "config"; config: Partial<RoomConfig> }
  | { type: "start" }
  | { type: "progress"; progress: number }
  | { type: "finished"; time: number }
  | { type: "eliminated"; progress: number; reason: LoseReason }
  | { type: "rematch" }
  | { type: "leave" }
  | { type: "close" };

export type ErrorCode =
  | "room_full"
  | "not_found"
  | "already_started"
  | "name_required"
  | "already_initialized";

export type JoinAvailability = "joinable" | "not_found" | "full" | "in_progress";

// ===== Servidor -> Cliente =====
export type ServerMessage =
  | { type: "snapshot"; room: RoomSnapshot; you: string }
  | { type: "peek"; availability: JoinAvailability; code: string }
  | { type: "error"; code: ErrorCode; message: string }
  | { type: "closed" };

export function encode(msg: ClientMessage | ServerMessage): string {
  return JSON.stringify(msg);
}

export function decode<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

/** Igual que decode pero devuelve null si el frame no es JSON válido. */
export function safeDecode<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Normaliza un nombre recibido del cliente: coerciona a string, elimina
 * caracteres de control, recorta espacios y trunca a MAX_NAME_LEN. Devuelve
 * "" si la entrada no es un nombre válido.
 */
export function sanitizeName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let out = "";
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    // Salta controles C0 (0x00-0x1F) y DEL (0x7F).
    if (code < 0x20 || code === 0x7f) continue;
    out += ch;
  }
  return out.trim().slice(0, MAX_NAME_LEN);
}

/** Genera un código de sala de 4 caracteres sin caracteres ambiguos. */
export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
