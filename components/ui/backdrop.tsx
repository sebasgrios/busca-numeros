import styles from "./backdrop.module.css";

type Blob = "b1" | "b2" | "b3";

/** Manchas de color difuminadas decorativas de fondo. */
export function Backdrop({ blobs = ["b1", "b2", "b3"] }: { blobs?: Blob[] }) {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      {blobs.map((b) => (
        <div key={b} className={`${styles.blob} ${styles[b]}`} />
      ))}
    </div>
  );
}
