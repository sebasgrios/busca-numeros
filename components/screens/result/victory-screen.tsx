"use client";

import { Screen } from "@/components/ui/screen";
import { Backdrop } from "@/components/ui/backdrop";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import { configLabel, parseConfigKey } from "@/lib/config";
import { formatTime, formatTimeShort } from "@/lib/format";
import type { WinInfo } from "@/lib/types";
import styles from "./end-screen.module.css";

interface VictoryScreenProps {
  info: WinInfo;
  onAgain: () => void;
  onHome: () => void;
}

export function VictoryScreen({ info, onAgain, onHome }: VictoryScreenProps) {
  const parsed = parseConfigKey(info.config);
  return (
    <Screen label="03 Victory">
      <Confetti count={70} />
      <Backdrop blobs={["b1", "b3"]} />
      <div className={styles.endcard}>
        <div className={styles.emoji}>🏆</div>
        <p className={styles.sub}>¡Lo lograste!</p>
        <h2 className={styles.title}>¡Tabla completa!</h2>
        <div className={styles.bigTime}>{formatTime(info.time)}</div>
        {parsed && <div className={styles.configChip}>{configLabel(parsed)}</div>}
        {info.remaining != null && (
          <p className={styles.sub}>
            Te sobraron <b>{formatTimeShort(info.remaining)}</b>
          </p>
        )}
        {info.isRecord && <div className={styles.newRecord}>★ NUEVO RÉCORD</div>}
        {!info.isRecord && info.rank > 0 && (
          <div className={styles.sub}>Top {info.rank} de tus partidas</div>
        )}
        <div className={styles.actions}>
          <Button variant="primary" block onClick={onAgain}>
            ↻&nbsp;&nbsp;Jugar de nuevo
          </Button>
          <Button variant="ghost" block onClick={onHome}>
            Inicio
          </Button>
        </div>
      </div>
    </Screen>
  );
}
