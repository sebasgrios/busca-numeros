import styles from "./stat-card.module.css";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** Tarjeta compacta con una etiqueta y un valor destacado. */
export function StatCard({ label, value, className, style }: StatCardProps) {
  return (
    <div className={`${styles.card} ${className ?? ""}`.trim()} style={style}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
