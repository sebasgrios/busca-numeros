import styles from "./progress-bar.module.css";

/** Barra de progreso de la partida (0–100%). */
export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className={styles.progress} aria-label={`Progreso ${pct}%`}>
      <span className={styles.fill} style={{ width: `${pct}%` }} />
      <div className={styles.ticks} />
    </div>
  );
}
