import styles from "./text-field.module.css";

interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Estilo de código: mayúsculas y espaciado amplio. */
  code?: boolean;
}

/** Campo de texto con el estilo del juego. */
export function TextField({ code, className, ...rest }: TextFieldProps) {
  const classes = [styles.field, code ? styles.uppercase : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <input className={classes} {...rest} />;
}
