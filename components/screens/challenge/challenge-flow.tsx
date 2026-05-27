"use client";

import { useState } from "react";
import { getSfx } from "@/lib/sound";
import { useRoom } from "@/components/providers/room-provider";
import { generateRoomCode, type RoomConfig } from "@/lib/multiplayer/protocol";
import { Screen } from "@/components/ui/screen";
import { BottomInfo } from "@/components/ui/bottom-info";
import { ChoiceScreen } from "./choice-screen";
import { CreateConfigScreen } from "./create-config-screen";
import { NameModal } from "./name-modal";

type Phase = "choice" | "create" | "join";

interface ChallengeFlowProps {
  onExit: () => void;
}

export function ChallengeFlow({ onExit }: ChallengeFlowProps) {
  const room = useRoom();
  const [phase, setPhase] = useState<Phase>("choice");
  const [pendingConfig, setPendingConfig] = useState<RoomConfig | null>(null);

  const go = (next: Phase) => {
    getSfx().click();
    setPhase(next);
  };

  // Ya dentro de una sala (creada o unida).
  if (room.you && room.snapshot) {
    return (
      <Screen label="09 Room">
        <BottomInfo>
          Sala {room.snapshot.code} · {room.snapshot.players.length}/
          {room.snapshot.config.capacity} jugadores
        </BottomInfo>
      </Screen>
    );
  }

  if (phase === "create") {
    return (
      <>
        <CreateConfigScreen
          onBack={() => go("choice")}
          onSubmit={(config) => {
            getSfx().click();
            setPendingConfig(config);
          }}
        />
        {pendingConfig && (
          <NameModal
            confirmLabel="Crear sala"
            onCancel={() => setPendingConfig(null)}
            onConfirm={(name) => {
              room.connect(generateRoomCode());
              room.create(name, pendingConfig);
              setPendingConfig(null);
            }}
          />
        )}
      </>
    );
  }

  return (
    <ChoiceScreen
      onBack={onExit}
      onCreate={() => go("create")}
      onJoin={() => go("join")}
    />
  );
}
