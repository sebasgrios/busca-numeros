import styles from "./icon-button.module.css";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual: "default" (superficie) o "accent" (coral destacado). */
  variant?: "default" | "accent";
}

/** Botón cuadrado de icono usado en barras superiores. */
export function IconButton({
  className,
  children,
  variant = "default",
  ...rest
}: IconButtonProps) {
  const classes = [
    styles.iconbtn,
    variant === "accent" ? styles.accent : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
