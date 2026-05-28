import styles from "./bottom-info.module.css";

/** Texto auxiliar centrado al pie de una pantalla. */
export function BottomInfo({ children }: { children: React.ReactNode }) {
  return <div className={styles.bottomInfo}>{children}</div>;
}
