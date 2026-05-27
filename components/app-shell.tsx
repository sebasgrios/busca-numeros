"use client";

import { useCallback, useState } from "react";
import type { Screen } from "@/lib/types";
import { getSfx } from "@/lib/sound";
import { HomeScreen } from "@/components/screens/home/home-screen";

export function AppShell() {
  const [screen, setScreen] = useState<Screen>("home");

  const go = useCallback((next: Screen) => {
    getSfx().click();
    setScreen(next);
  }, []);

  switch (screen) {
    case "home":
      return (
        <HomeScreen
          onPlay={() => go("game")}
          onRecords={() => go("records")}
          onSettings={() => go("settings")}
        />
      );
    default:
      return (
        <HomeScreen
          onPlay={() => go("game")}
          onRecords={() => go("records")}
          onSettings={() => go("settings")}
        />
      );
  }
}
