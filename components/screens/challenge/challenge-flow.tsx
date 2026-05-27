"use client";

import { useState } from "react";
import { getSfx } from "@/lib/sound";
import { ChoiceScreen } from "./choice-screen";

type Phase = "choice" | "create" | "join";

interface ChallengeFlowProps {
  onExit: () => void;
}

export function ChallengeFlow({ onExit }: ChallengeFlowProps) {
  const [phase, setPhase] = useState<Phase>("choice");

  const go = (next: Phase) => {
    getSfx().click();
    setPhase(next);
  };

  if (phase === "create" || phase === "join") {
    // Pasos implementados en hitos posteriores (MP4/MP5).
    return <ChoiceScreen onBack={onExit} onCreate={() => go("create")} onJoin={() => go("join")} />;
  }

  return (
    <ChoiceScreen
      onBack={onExit}
      onCreate={() => go("create")}
      onJoin={() => go("join")}
    />
  );
}
