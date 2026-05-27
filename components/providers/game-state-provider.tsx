"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  AppState,
  GameConfig,
  Settings,
  WinInfo,
} from "@/lib/types";
import { DEFAULT_GAME, loadState, saveState } from "@/lib/storage";
import { getSfx } from "@/lib/sound";

const FALLBACK_CONFIG = "10x10-classic";

function initialState(): AppState {
  return {
    records: [],
    played: 0,
    settings: { sound: true, haptic: true, dark: false, game: { ...DEFAULT_GAME } },
  };
}

interface RegisterWinInput {
  time: number;
  wrong: number;
  config: string;
  remaining: number | null;
}

interface GameStateContextValue {
  state: AppState;
  hydrated: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  updateGame: (patch: Partial<GameConfig>) => void;
  toggleDark: () => void;
  registerWin: (input: RegisterWinInput) => WinInfo;
  registerLoss: () => void;
  clearRecords: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Mantener una referencia fresca para lecturas síncronas en callbacks.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Hidratar desde localStorage tras el montaje (evita mismatch de SSR).
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persistir cuando cambie el estado (solo tras hidratar).
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // Aplicar el tema al documento.
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      state.settings.dark ? "dark" : "light",
    );
  }, [state.settings.dark]);

  // Sincronizar el flag de sonido con el sintetizador.
  useEffect(() => {
    getSfx().enabled = state.settings.sound;
  }, [state.settings.sound]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const updateGame = useCallback((patch: Partial<GameConfig>) => {
    setState((d) => ({
      ...d,
      settings: { ...d.settings, game: { ...d.settings.game, ...patch } },
    }));
  }, []);

  const toggleDark = useCallback(() => {
    setState((d) => ({
      ...d,
      settings: { ...d.settings, dark: !d.settings.dark },
    }));
  }, []);

  const registerWin = useCallback((input: RegisterWinInput): WinInfo => {
    const { time, wrong, config, remaining } = input;
    const d = stateRef.current;
    const newRecord = {
      id: "r" + Date.now(),
      time,
      at: Date.now(),
      config,
      wrong,
    };
    const forCfg = [
      ...d.records.filter((r) => (r.config || FALLBACK_CONFIG) === config),
      newRecord,
    ].sort((a, b) => a.time - b.time);
    const rank = forCfg.findIndex((r) => r.id === newRecord.id) + 1;
    const isRecord = rank === 1;
    const others = d.records.filter(
      (r) => (r.config || FALLBACK_CONFIG) !== config,
    );
    // Conserva el top 20 por configuración.
    const records = [...others, ...forCfg.slice(0, 20)];
    setState({ ...d, played: d.played + 1, records });
    return { time, isRecord, rank, config, remaining };
  }, []);

  const registerLoss = useCallback(() => {
    setState((d) => ({ ...d, played: d.played + 1 }));
  }, []);

  const clearRecords = useCallback(() => {
    setState((d) => ({ ...d, records: [] }));
  }, []);

  const value: GameStateContextValue = {
    state,
    hydrated,
    updateSettings,
    updateGame,
    toggleDark,
    registerWin,
    registerLoss,
    clearRecords,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGameState debe usarse dentro de GameStateProvider");
  }
  return ctx;
}
