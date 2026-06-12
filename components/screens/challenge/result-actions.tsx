"use client";

import { Button } from "@/components/ui/button";
import { useRoom } from "@/components/providers/room-provider";
import { MIN_PLAYERS } from "@/lib/multiplayer/protocol";
import { getSfx } from "@/lib/sound";

interface ResultActionsProps {
  onExit: () => void;
}

/**
 * Acciones compartidas entre el podio (≥3) y el modal de duelo (2P):
 * "Volver a jugar (n/N)" para no anfitriones o anfitrión sin marcarse,
 * "Iniciar (n/N)" si el anfitrión ya marcó revancha (habilitado cuando
 * todos están listos) y "Salir" siempre disponible.
 */
export function ResultActions({ onExit }: ResultActionsProps) {
  const { snapshot, you, isHost, toggleRematch, start } = useRoom();
  if (!snapshot || !you) return null;

  const players = snapshot.players;
  const total = players.length;
  const readyCount = players.filter((p) => p.rematchReady).length;
  const allReady = readyCount === total && total >= MIN_PLAYERS;
  const youReady = you.rematchReady;
  const counter = `(${readyCount}/${total})`;

  const handleRematch = () => {
    getSfx().click();
    toggleRematch();
  };

  const handleStart = () => {
    getSfx().click();
    start();
  };

  const handleExit = () => {
    getSfx().click();
    onExit();
  };

  return (
    <>
      {isHost && youReady ? (
        <Button
          variant="primary"
          block
          disabled={!allReady}
          onClick={handleStart}
        >
          Iniciar {counter}
        </Button>
      ) : (
        <Button variant="primary" block onClick={handleRematch}>
          {youReady ? "Esperando…" : "Volver a jugar"} {counter}
        </Button>
      )}
      <Button variant="ghost" block onClick={handleExit}>
        Salir
      </Button>
    </>
  );
}
