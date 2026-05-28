import styles from "./screen.module.css";

interface ScreenProps {
  children: React.ReactNode;
  /** Habilita scroll vertical independiente (pantallas largas). */
  scroll?: boolean;
  /** Etiqueta interna usada como ayuda de diseño/depuración. */
  label?: string;
  className?: string;
}

/** Contenedor base de una pantalla, con animación de entrada. */
export function Screen({ children, scroll, label, className }: ScreenProps) {
  const classes = [styles.screen, scroll ? styles.scroll : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} data-screen-label={label}>
      {children}
    </div>
  );
}
