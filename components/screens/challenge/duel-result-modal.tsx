"use client";

import { Modal } from "@/components/ui/modal";
import { Confetti } from "@/components/ui/confetti";
import { IconSmile, IconTrophy } from "@/components/ui/icons";
import { useRoom } from "@/components/providers/room-provider";
import { COLOR_HEX } from "@/lib/multiplayer/protocol";
import { formatTime } from "@/lib/format";
import { ResultActions } from "./result-actions";
import styles from "./duel-result-modal.module.css";

interface DuelResultModalProps {
  onExit: () => void;
}

/**
 * Modal de resultado para partidas 2P:
 * - Si tú ganaste: ¡Has ganado! + confeti + IconTrophy + tu tiempo.
 * - Si no: Ha ganado X + IconTrophy y avatar del ganador.
 */
export function DuelResultModal({ onExit }: DuelResultModalProps) {
  const { snapshot, you } = useRoom();
  if (!snapshot || !you) return null;

  const winner = snapshot.podium?.find((p) => p.place === 1);
  const youWon = !!winner && winner.id === you.id;

  return (
    <>
      {youWon && <Confetti count={60} />}
      <Modal>
        <div className={styles.card}>
          <div
            className={`${styles.emoji} ${youWon ? styles.emojiWin : styles.emojiLose}`}
          >
            <IconTrophy size={48} />
          </div>

          {youWon ? (
            <>
              <h2 className={styles.title}>¡Has ganado!</h2>
              {winner?.time != null && (
                <div className={styles.bigTime}>{formatTime(winner.time)}</div>
              )}
              <p className={styles.sub}>Le has ganado el duelo a tu rival.</p>
            </>
          ) : (
            <>
              <h2 className={styles.title}>Has perdido el duelo</h2>
              {winner && (
                <>
                  <div
                    className={styles.winnerAvatar}
                    style={{ background: COLOR_HEX[winner.color] }}
                  >
                    <IconSmile size={32} />
                  </div>
                  <p className={styles.winnerName}>
                    Ha ganado <b>{winner.name}</b>
                  </p>
                </>
              )}
              {winner?.time != null && (
                <p className={styles.sub}>
                  Lo completó en <b>{formatTime(winner.time)}</b>
                </p>
              )}
            </>
          )}

          <div className={styles.actions}>
            <ResultActions onExit={onExit} />
          </div>
        </div>
      </Modal>
    </>
  );
}
