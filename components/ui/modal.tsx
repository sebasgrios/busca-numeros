import { IconButton } from "./icon-button";
import styles from "./modal.module.css";

interface ModalProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** Si se indica, muestra una X de cierre arriba a la izquierda. */
  onClose?: () => void;
}

/** Modal centrado sobre un velo oscuro, fiel a las tarjetas del diseño. */
export function Modal({ children, title, subtitle, onClose }: ModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.card}>
        {onClose && (
          <IconButton
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </IconButton>
        )}
        {title && (
          <h2 className={`${styles.title} ${onClose ? styles.titleOffset : ""}`}>
            {title}
          </h2>
        )}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
