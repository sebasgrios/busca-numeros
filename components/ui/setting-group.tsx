import styles from "./setting-group.module.css";

interface SettingGroupProps {
  groupLabel?: string;
  heading?: string;
  help?: string;
  children: React.ReactNode;
}

/** Tarjeta de grupo de ajustes con etiqueta, título y ayuda opcionales. */
export function SettingGroup({
  groupLabel,
  heading,
  help,
  children,
}: SettingGroupProps) {
  return (
    <div className={styles.group}>
      {groupLabel && <div className={styles.groupLabel}>{groupLabel}</div>}
      {heading && <h4 className={styles.heading}>{heading}</h4>}
      {help && <p className={styles.help}>{help}</p>}
      {children}
    </div>
  );
}
