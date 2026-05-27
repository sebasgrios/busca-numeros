"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { AppState } from "@/lib/types";
import {
  clearRecords,
  getServerSnapshot,
  getSnapshot,
  registerLoss,
  registerWin,
  subscribe,
  toggleDark,
  updateGame,
  updateSettings,
} from "@/lib/game-store";
import { getSfx } from "@/lib/sound";

function useStoreState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Devuelve el estado del juego y las acciones para mutarlo. */
export function useGameState() {
  const state = useStoreState();
  return {
    state,
    updateSettings,
    updateGame,
    toggleDark,
    registerWin,
    registerLoss,
    clearRecords,
  };
}

/** Sincroniza tema y sonido con el estado; aloja efectos globales. */
export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const state = useStoreState();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      state.settings.dark ? "dark" : "light",
    );
  }, [state.settings.dark]);

  useEffect(() => {
    getSfx().enabled = state.settings.sound;
  }, [state.settings.sound]);

  return <>{children}</>;
}
