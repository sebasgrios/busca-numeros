"use client";

import { Screen } from "@/components/ui/screen";
import { Backdrop } from "@/components/ui/backdrop";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { IconRefresh, IconStopwatch, IconX } from "@/components/ui/icons";
import { formatTimeShort } from "@/lib/format";
import type { LoseInfo } from "@/lib/types";
import styles from "./end-screen.module.css";

interface LoseScreenProps {
  info: LoseInfo;
  onAgain: () => void;
  onHome: () => void;
}

export function LoseScreen({ info, onAgain, onHome }: LoseScreenProps) {
  const isTimeout = info.reason === "timeout";
  return (
    <Screen label="04 Lose">
      <Backdrop blobs={["b2"]} />
      <div className={`${styles.endcard} ${styles.lose}`}>
        <div className={styles.emoji}>
          {isTimeout ? <IconStopwatch size={48} /> : <IconX size={48} />}
        </div>
        <p className={styles.sub}>{isTimeout ? "¡Se acabó el tiempo!" : "¡Casi!"}</p>
        <h2 className={styles.title}>
          {isTimeout ? "Tiempo agotado" : "Te equivocaste"}
        </h2>
        {!isTimeout && (
          <p className={styles.sub} style={{ maxWidth: 260 }}>
            Tocaste el <b>{info.tapped}</b> cuando buscabas el <b>{info.expected}</b>.
          </p>
        )}
        {isTimeout && (
          <p className={styles.sub} style={{ maxWidth: 260 }}>
            Te faltaron <b>{info.total - info.reachedTo}</b> números para
            completar la tabla.
          </p>
        )}
        <div className={styles.statRow}>
          <StatCard label="Llegaste a" value={`${info.reachedTo} / ${info.total}`} />
          <StatCard label="Tiempo" value={formatTimeShort(info.timeAt)} />
        </div>
        <div className={styles.actions}>
          <Button variant="primary" block onClick={onAgain}>
            <IconRefresh size={20} />
            Intentar otra vez
          </Button>
          <Button variant="ghost" block onClick={onHome}>
            Inicio
          </Button>
        </div>
      </div>
    </Screen>
  );
}
