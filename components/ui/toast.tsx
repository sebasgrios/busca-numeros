import styles from "./toast.module.css";

/** Notificación efímera anclada al pie de pantalla. */
export function Toast({ message }: { message: string }) {
  return (
    <div className={styles.toast} role="status">
      {message}
    </div>
  );
}
