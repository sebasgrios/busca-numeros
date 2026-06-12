"use client";

import { Modal } from "@/components/ui/modal";
import { useRoom } from "@/components/providers/room-provider";
import { COLOR_HEX, type PodiumEntry } from "@/lib/multiplayer/protocol";
import { IconSmile } from "@/components/ui/icons";
import { ResultActions } from "./result-actions";
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
  return (
    <div className={`${styles.column} ${entry ? "" : styles.empty}`}>
      <div
        className={styles.avatar}
        style={{ background: entry ? COLOR_HEX[entry.color] : "#888" }}
      >
        {entry ? <IconSmile size={28} /> : "—"}
      </div>
      <div className={styles.name}>{entry?.name ?? "—"}</div>
      <div className={`${styles.pillar} ${cls}`} aria-label={`Puesto ${place}`}>
        {place}
      </div>
    </div>
  );
}

export function PodiumModal({ onExit }: PodiumModalProps) {
  const { snapshot, you } = useRoom();

  if (!snapshot || !you) return null;

  const podium = snapshot.podium ?? [];
  const first = podium.find((p) => p.place === 1);
  const second = podium.find((p) => p.place === 2);
  const third = podium.find((p) => p.place === 3);

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
        <ResultActions onExit={onExit} />
      </div>
    </Modal>
  );
}
