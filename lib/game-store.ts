import type {
  AppState,
  GameConfig,
  Settings,
  WinInfo,
} from "./types";
import { DEFAULT_GAME, loadState, saveState } from "./storage";

const FALLBACK_CONFIG = "10x10-classic";

function defaultState(): AppState {
  return {
    records: [],
    played: 0,
    seenHowTo: false,
    settings: { sound: true, haptic: true, dark: false, game: { ...DEFAULT_GAME } },
  };
}

// Snapshot estable para SSR/hidratación (referencia constante).
const SERVER_STATE: AppState = defaultState();

let state: AppState = SERVER_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function set(next: AppState): void {
  state = next;
  saveState(state);
  emit();
}

export function subscribe(cb: () => void): () => void {
  // La primera suscripción ocurre en cliente: hidrata desde localStorage.
  if (!hydrated) {
    hydrated = true;
    const loaded = loadState();
    if (loaded !== state) {
      state = loaded;
    }
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getSnapshot(): AppState {
  return state;
}

export function getServerSnapshot(): AppState {
  return SERVER_STATE;
}

// ===== Acciones =====

export function updateSettings(patch: Partial<Settings>): void {
  set({ ...state, settings: { ...state.settings, ...patch } });
}

export function updateGame(patch: Partial<GameConfig>): void {
  set({
    ...state,
    settings: { ...state.settings, game: { ...state.settings.game, ...patch } },
  });
}

export function toggleDark(): void {
  set({ ...state, settings: { ...state.settings, dark: !state.settings.dark } });
}

export function registerLoss(): void {
  set({ ...state, played: state.played + 1 });
}

export function clearRecords(): void {
  set({ ...state, records: [] });
}

/** Marca el tutorial de "cómo se juega" como visto (no se repite). */
export function markHowToSeen(): void {
  if (state.seenHowTo) return;
  set({ ...state, seenHowTo: true });
}

interface RegisterWinInput {
  time: number;
  wrong: number;
  config: string;
  remaining: number | null;
}

export function registerWin(input: RegisterWinInput): WinInfo {
  const { time, wrong, config, remaining } = input;
  const newRecord = { id: "r" + Date.now(), time, at: Date.now(), config, wrong };
  const forCfg = [
    ...state.records.filter((r) => (r.config || FALLBACK_CONFIG) === config),
    newRecord,
  ].sort((a, b) => a.time - b.time);
  const rank = forCfg.findIndex((r) => r.id === newRecord.id) + 1;
  const isRecord = rank === 1;
  const others = state.records.filter(
    (r) => (r.config || FALLBACK_CONFIG) !== config,
  );
  // Conserva el top 20 por configuración.
  const records = [...others, ...forCfg.slice(0, 20)];
  set({ ...state, played: state.played + 1, records });
  return { time, isRecord, rank, config, remaining };
}
