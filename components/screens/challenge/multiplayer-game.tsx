"use client";

import { useMemo, useState } from "react";
import { useRoom } from "@/components/providers/room-provider";
import { GameScreen } from "@/components/screens/game/game-screen";
import type { ProgressMarker } from "@/components/screens/game/progress-bar";
import { COLOR_HEX } from "@/lib/multiplayer/protocol";
import type { GameConfig } from "@/lib/types";
import styles from "./eliminated-overlay.module.css";

interface MultiplayerGameProps {
  onExit: () => void;
}

export function MultiplayerGame({ onExit }: MultiplayerGameProps) {
  const { snapshot, youId, sendProgress, sendFinished, sendEliminated } =
    useRoom();
  const [eliminated, setEliminated] = useState(false);

  // Garantiza un único montaje por ronda (key con round) — manejado en el padre.
  const cfg: GameConfig | undefined = snapshot
    ? {
        cols: snapshot.config.cols,
        mode: snapshot.config.mode,
        duration: snapshot.config.duration,
      }
    : undefined;

  const total = snapshot ? snapshot.total : 0;

  const markers: ProgressMarker[] = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.players
      .filter((p) => p.id !== youId)
      .map((p) => ({
        id: p.id,
        color: COLOR_HEX[p.color],
        pct: total ? Math.round((p.progress / total) * 100) : 0,
      }));
  }, [snapshot, youId, total]);

  if (!snapshot || !cfg) return null;

  return (
    <>
      <GameScreen
        configOverride={cfg}
        seed={snapshot.seed}
        markers={markers}
        onProgress={(completed) => sendProgress(completed)}
        onWin={({ time }) => sendFinished(time)}
        onLose={(info) => {
          sendEliminated(info.reachedTo, info.reason);
          setEliminated(true);
        }}
        onExit={onExit}
      />
      {eliminated && (
        <div className={styles.overlay} role="status" aria-live="polite">
          <div className={styles.card}>
            <div className={styles.emoji}>✕</div>
            <h3 className={styles.title}>¡Eliminado!</h3>
            <p className={styles.sub}>
              Esperando al resto de jugadores para ver el resultado…
            </p>
          </div>
        </div>
      )}
    </>
  );
}
