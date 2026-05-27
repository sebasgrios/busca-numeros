import styles from "./section-title.module.css";

/** Título de sección grande (display). */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={styles.title}>{children}</h2>;
}
