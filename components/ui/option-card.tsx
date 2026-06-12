import styles from "./option-card.module.css";

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  /** Color de fondo del chip del icono (token o hex). */
  color: string;
  onClick: () => void;
}

/** Tarjeta de opción pulsable: chip de icono + título + descripción. */
export function OptionCard({ icon, title, desc, color, onClick }: OptionCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <span className={styles.chip} style={{ background: color }} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.desc}>{desc}</span>
      </span>
      <svg
        className={styles.chevron}
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
