"use client";

import { useState } from "react";
import { getSfx } from "@/lib/sound";
import { useRoom } from "@/components/providers/room-provider";
import { generateRoomCode, type RoomConfig } from "@/lib/multiplayer/protocol";
import { Screen } from "@/components/ui/screen";
import { Backdrop } from "@/components/ui/backdrop";
import { BottomInfo } from "@/components/ui/bottom-info";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ChoiceScreen } from "./choice-screen";
import { CreateConfigScreen } from "./create-config-screen";
import { JoinCodeScreen } from "./join-code-screen";
import { NameModal } from "./name-modal";
import { WaitingRoom } from "./waiting-room";

type Phase = "choice" | "create" | "join";

interface ChallengeFlowProps {
  onExit: () => void;
  initialJoinCode?: string;
}

export function ChallengeFlow({ onExit, initialJoinCode }: ChallengeFlowProps) {
  const room = useRoom();
  const [phase, setPhase] = useState<Phase>(
    initialJoinCode ? "join" : "choice",
  );
  const [pendingConfig, setPendingConfig] = useState<RoomConfig | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const go = (next: Phase) => {
    getSfx().click();
    setPhase(next);
  };

  const leaveToChoice = () => {
    room.disconnect();
    setPhase("choice");
    setPendingConfig(null);
    setJoinCode(null);
    setClosing(false);
  };

  // ===== Ya dentro de una sala =====
  if (room.you && room.snapshot) {
    const status = room.snapshot.status;

    if (status === "lobby") {
      return (
        <>
          <Screen label="09 Room">
            <Backdrop />
            <BottomInfo>BuscaNúmeros · multijugador</BottomInfo>
          </Screen>
          {closing ? (
            <ConfirmModal
              title="¿Cerrar la partida?"
              subtitle="Se expulsará a todos los jugadores de la sala."
              confirmLabel="Cerrar partida"
              cancelLabel="Seguir esperando"
              onConfirm={() => {
                getSfx().click();
                room.close();
                leaveToChoice();
              }}
              onCancel={() => setClosing(false)}
            />
          ) : (
            <WaitingRoom
              onRequestClose={() => {
                getSfx().click();
                if (room.isHost) setClosing(true);
                else {
                  room.leave();
                  leaveToChoice();
                }
              }}
            />
          )}
        </>
      );
    }

    // status "playing" / "finished": implementado en MP6 / MP7.
    return (
      <Screen label="09 Room">
        <Backdrop />
        <BottomInfo>Partida en curso…</BottomInfo>
      </Screen>
    );
  }

  // ===== Crear =====
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

  // ===== Unirse =====
  if (phase === "join") {
    return (
      <>
        <JoinCodeScreen
          initialCode={initialJoinCode}
          onBack={() => {
            room.disconnect();
            go("choice");
          }}
          checkCode={(code) => room.peekRoom(code)}
          onValidated={(code) => setJoinCode(code)}
        />
        {joinCode && (
          <NameModal
            confirmLabel="Entrar"
            onCancel={() => {
              setJoinCode(null);
              room.disconnect();
            }}
            onConfirm={(name) => {
              room.join(name);
              setJoinCode(null);
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
