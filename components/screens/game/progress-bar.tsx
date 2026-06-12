import styles from "./progress-bar.module.css";

export interface ProgressMarker {
  id: string;
  color: string;
  pct: number;
}

interface ProgressBarProps {
  pct: number;
  /** Marcadores de progreso de otros jugadores (multijugador). */
  markers?: ProgressMarker[];
}

/** Barra de progreso de la partida (0–100%) con marcadores de rivales. */
export function ProgressBar({ pct, markers }: ProgressBarProps) {
  return (
    <div className={styles.progress} aria-label={`Progreso ${pct}%`}>
      <span className={styles.fill} style={{ width: `${pct}%` }} />
      <div className={styles.ticks} />
      {markers?.map((m) => (
        <span
          key={m.id}
          className={styles.ghost}
          style={{ left: `${m.pct}%`, background: m.color }}
        />
      ))}
    </div>
  );
}
