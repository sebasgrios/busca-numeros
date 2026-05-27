"use client";

import { useCallback, useState } from "react";
import type { LoseInfo, Screen, WinInfo } from "@/lib/types";
import { getSfx } from "@/lib/sound";
import { useClientValue } from "@/hooks/use-client-value";
import { useGameState } from "@/components/providers/game-state-provider";
import { Toast } from "@/components/ui/toast";
import { HomeScreen } from "@/components/screens/home/home-screen";
import { GameScreen } from "@/components/screens/game/game-screen";
import { VictoryScreen } from "@/components/screens/result/victory-screen";
import { LoseScreen } from "@/components/screens/result/lose-screen";
import { RecordsScreen } from "@/components/screens/records/records-screen";
import { SettingsScreen } from "@/components/screens/settings/settings-screen";
import { RoomProvider } from "@/components/providers/room-provider";
import { ChallengeFlow } from "@/components/screens/challenge/challenge-flow";

export function AppShell() {
  const { state, registerWin, registerLoss, clearRecords } = useGameState();
  const [screen, setScreen] = useState<Screen>("home");
  const [gameId, setGameId] = useState(0);
  const [winInfo, setWinInfo] = useState<WinInfo | null>(null);
  const [loseInfo, setLoseInfo] = useState<LoseInfo | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [joinDismissed, setJoinDismissed] = useState(false);

  // Deep link de invitación: /?join=CODE (solo en cliente, evita mismatch).
  const deepJoin = useClientValue(() => {
    const c = new URLSearchParams(window.location.search).get("join");
    return c ? c.toUpperCase().slice(0, 4) : null;
  });
  const inDeepJoin = !!deepJoin && !joinDismissed;

  const go = useCallback((next: Screen) => {
    getSfx().click();
    setScreen(next);
  }, []);

  const exitChallenge = useCallback(() => {
    getSfx().click();
    setJoinDismissed(true);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    setScreen("home");
  }, []);

  const startGame = useCallback(() => {
    getSfx().click();
    setGameId((id) => id + 1);
    setScreen("game");
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  }, []);

  const handleClearRecords = useCallback(() => {
    if (state.records.length === 0) return;
    if (!window.confirm("¿Borrar todos los récords?")) return;
    clearRecords();
    showToast("Récords borrados");
  }, [state.records.length, clearRecords, showToast]);

  const withToast = (node: React.ReactNode) => (
    <>
      {node}
      {toast && <Toast message={toast} />}
    </>
  );

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

  if (screen === "records") {
    return withToast(
      <RecordsScreen onHome={() => go("home")} onClear={handleClearRecords} />,
    );
  }

  if (screen === "settings") {
    return withToast(<SettingsScreen onHome={() => go("home")} />);
  }

  if (screen === "challenge" || inDeepJoin) {
    return (
      <RoomProvider>
        <ChallengeFlow
          onExit={exitChallenge}
          initialJoinCode={inDeepJoin ? deepJoin : undefined}
        />
      </RoomProvider>
    );
  }

  return withToast(
    <HomeScreen
      onPlay={startGame}
      onRecords={() => go("records")}
      onSettings={() => go("settings")}
      onChallenge={() => go("challenge")}
    />,
  );
}
