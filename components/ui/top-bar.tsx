import styles from "./top-bar.module.css";

/** Barra superior con elementos distribuidos a los extremos. */
export function TopBar({ children }: { children: React.ReactNode }) {
  return <div className={styles.topbar}>{children}</div>;
}
