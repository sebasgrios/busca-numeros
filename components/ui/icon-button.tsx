import styles from "./icon-button.module.css";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Botón cuadrado de icono usado en barras superiores. */
export function IconButton({ className, children, ...rest }: IconButtonProps) {
  return (
    <button
      className={`${styles.iconbtn} ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
