"use client";

import { useCallback, useState } from "react";
import type { Screen } from "@/lib/types";
import { getSfx } from "@/lib/sound";
import { useGameState } from "@/components/providers/game-state-provider";
import { HomeScreen } from "@/components/screens/home/home-screen";
import { GameScreen } from "@/components/screens/game/game-screen";

export function AppShell() {
  const { registerWin, registerLoss } = useGameState();
  const [screen, setScreen] = useState<Screen>("home");
  const [gameId, setGameId] = useState(0);

  const go = useCallback((next: Screen) => {
    getSfx().click();
    setScreen(next);
  }, []);

  const startGame = useCallback(() => {
    getSfx().click();
    setGameId((id) => id + 1);
    setScreen("game");
  }, []);

  if (screen === "game") {
    return (
      <GameScreen
        key={`g-${gameId}`}
        onWin={(payload) => {
          registerWin(payload);
          setScreen("home");
        }}
        onLose={() => {
          registerLoss();
          setScreen("home");
        }}
        onExit={() => go("home")}
      />
    );
  }

  return (
    <HomeScreen
      onPlay={startGame}
      onRecords={() => go("records")}
      onSettings={() => go("settings")}
    />
  );
}
