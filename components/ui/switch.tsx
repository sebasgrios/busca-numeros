import styles from "./switch.module.css";

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

/** Interruptor on/off accesible. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      className={styles.switch}
      aria-pressed={checked}
      aria-label={label}
      onClick={onChange}
    />
  );
}
