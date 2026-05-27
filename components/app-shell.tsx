"use client";

import { useCallback, useState } from "react";
import type { LoseInfo, Screen, WinInfo } from "@/lib/types";
import { getSfx } from "@/lib/sound";
import { useGameState } from "@/components/providers/game-state-provider";
import { HomeScreen } from "@/components/screens/home/home-screen";
import { GameScreen } from "@/components/screens/game/game-screen";
import { VictoryScreen } from "@/components/screens/result/victory-screen";
import { LoseScreen } from "@/components/screens/result/lose-screen";

export function AppShell() {
  const { registerWin, registerLoss } = useGameState();
  const [screen, setScreen] = useState<Screen>("home");
  const [gameId, setGameId] = useState(0);
  const [winInfo, setWinInfo] = useState<WinInfo | null>(null);
  const [loseInfo, setLoseInfo] = useState<LoseInfo | null>(null);

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
          setWinInfo(registerWin(payload));
          setScreen("win");
        }}
        onLose={(info) => {
          registerLoss();
          setLoseInfo(info);
          setScreen("lose");
        }}
        onExit={() => go("home")}
      />
    );
  }

  if (screen === "win" && winInfo) {
    return (
      <VictoryScreen
        info={winInfo}
        onAgain={startGame}
        onHome={() => go("home")}
      />
    );
  }

  if (screen === "lose" && loseInfo) {
    return (
      <LoseScreen info={loseInfo} onAgain={startGame} onHome={() => go("home")} />
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
