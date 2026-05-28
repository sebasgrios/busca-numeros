import styles from "./stat-card.module.css";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Reduce el tamaño del valor (rejillas de resumen). */
  dense?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Tarjeta compacta con una etiqueta y un valor destacado. */
export function StatCard({ label, value, dense, className, style }: StatCardProps) {
  const classes = [styles.card, dense ? styles.dense : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} style={style}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
