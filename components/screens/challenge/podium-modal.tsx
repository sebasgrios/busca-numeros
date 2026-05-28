"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/components/providers/room-provider";
import {
  COLOR_HEX,
  MIN_PLAYERS,
  type PodiumEntry,
} from "@/lib/multiplayer/protocol";
import { getSfx } from "@/lib/sound";
import styles from "./podium-modal.module.css";

interface PodiumModalProps {
  onExit: () => void;
}

function Column({
  entry,
  place,
}: {
  entry: PodiumEntry | undefined;
  place: 1 | 2 | 3;
}) {
  const cls =
    place === 1 ? styles.first : place === 2 ? styles.second : styles.third;
  const medal = place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉";
  return (
    <div className={`${styles.column} ${entry ? "" : styles.empty}`}>
      <div
        className={styles.avatar}
        style={{ background: entry ? COLOR_HEX[entry.color] : "#888" }}
      >
        {entry ? "🙂" : "—"}
      </div>
      <div className={styles.name}>{entry?.name ?? "—"}</div>
      <div className={`${styles.pillar} ${cls}`} aria-label={`Puesto ${place}`}>
        {medal}
      </div>
    </div>
  );
}

export function PodiumModal({ onExit }: PodiumModalProps) {
  const { snapshot, you, isHost, toggleRematch, start, leave } = useRoom();

  if (!snapshot || !you) return null;

  const podium = snapshot.podium ?? [];
  const first = podium.find((p) => p.place === 1);
  const second = podium.find((p) => p.place === 2);
  const third = podium.find((p) => p.place === 3);

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
    leave();
    onExit();
  };

  return (
    <Modal>
      <h2 className={styles.title}>¡Resultados!</h2>
      <p className={styles.subtitle}>
        {first ? `Ganador: ${first.name}` : "Sin ganador"}
      </p>

      <div className={styles.podium}>
        <Column entry={second} place={2} />
        <Column entry={first} place={1} />
        <Column entry={third} place={3} />
      </div>

      <div className={styles.actions}>
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
      </div>
    </Modal>
  );
}
