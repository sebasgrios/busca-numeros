"use client";

import { useEffect, useState } from "react";
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
import { MultiplayerGame } from "./multiplayer-game";
import { PodiumModal } from "./podium-modal";
import { DuelResultModal } from "./duel-result-modal";
import { AbandonedModal } from "./abandoned-modal";

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
  const [confirmLeave, setConfirmLeave] = useState(false);
  // Recordamos si alguna vez hubo ≥2 jugadores en la sala para distinguir
  // "acabo de crear la sala y estoy solo" de "los demás se han ido".
  const [hadCompanions, setHadCompanions] = useState(false);

  // Sincroniza hadCompanions desde el snapshot del servidor.
  useEffect(() => {
    if (
      !hadCompanions &&
      room.snapshot &&
      room.snapshot.players.length >= 2
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHadCompanions(true);
    }
  }, [room.snapshot, hadCompanions]);

  const go = (next: Phase) => {
    getSfx().click();
    setPhase(next);
  };

  const resetFlowState = () => {
    setPhase("choice");
    setPendingConfig(null);
    setJoinCode(null);
    setClosing(false);
    setConfirmLeave(false);
    setHadCompanions(false);
  };

  const leaveToChoice = () => {
    room.disconnect();
    resetFlowState();
  };

  // Solo este jugador queda en la sala tras haber tenido compañía.
  const showAbandoned =
    !!room.snapshot &&
    !!room.you &&
    hadCompanions &&
    room.snapshot.players.length === 1 &&
    room.snapshot.players[0].id === room.youId &&
    !confirmLeave;

  const requestLeave = () => {
    getSfx().click();
    setConfirmLeave(true);
  };

  const confirmedLeave = () => {
    getSfx().click();
    room.leave();
    leaveToChoice();
  };

  // ===== Ya dentro de una sala =====
  if (room.you && room.snapshot) {
    const status = room.snapshot.status;

    // El "sala abandonada" tiene prioridad sobre cualquier otro modal.
    const abandonedOverlay = showAbandoned ? (
      <AbandonedModal onContinue={confirmedLeave} />
    ) : null;

    // Confirmación genérica de salida (no se muestra junto al "abandonada").
    const leaveOverlay =
      confirmLeave && !showAbandoned ? (
        <ConfirmModal
          title="¿Salir de la partida?"
          subtitle="Saldrás de la sala y volverás al menú multijugador."
          confirmLabel="Salir"
          cancelLabel="Seguir jugando"
          onConfirm={confirmedLeave}
          onCancel={() => setConfirmLeave(false)}
        />
      ) : null;

    if (status === "lobby") {
      return (
        <>
          <Screen label="09 Room">
            <Backdrop />
            <BottomInfo>BuscaNúmeros · multijugador</BottomInfo>
          </Screen>
          {abandonedOverlay ??
            leaveOverlay ??
            (closing ? (
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
                  else setConfirmLeave(true);
                }}
              />
            ))}
        </>
      );
    }

    if (status === "playing") {
      return (
        <>
          <MultiplayerGame
            key={`r-${room.snapshot.round}`}
            onExit={requestLeave}
          />
          {abandonedOverlay ?? leaveOverlay}
        </>
      );
    }

    // status === "finished"
    const isDuel = room.snapshot.config.capacity === 2;
    return (
      <>
        <Screen label="09 Room">
          <Backdrop />
          <BottomInfo>Sala {room.snapshot.code}</BottomInfo>
        </Screen>
        {abandonedOverlay ??
          leaveOverlay ??
          (isDuel ? (
            <DuelResultModal onExit={requestLeave} />
          ) : (
            <PodiumModal onExit={requestLeave} />
          ))}
      </>
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
