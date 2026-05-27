import styles from "./button.module.css";

type Variant = "primary" | "ghost" | "secondary";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  /** Botón "próximamente": deshabilitado con badge flotante. */
  comingSoon?: boolean;
}

export function Button({
  variant = "primary",
  block,
  comingSoon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.btn,
    comingSoon ? styles.disabled : styles[variant],
    block ? styles.block : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={comingSoon || rest.disabled}
      aria-disabled={comingSoon || rest.disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
