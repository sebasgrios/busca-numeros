import { IconStopwatch } from "@/components/ui/icons";
import styles from "./timer-pill.module.css";

interface TimerPillProps {
  label: string;
  bump?: boolean;
  low?: boolean;
  penalty?: boolean;
  showIcon?: boolean;
}

/** Píldora del temporizador con estados de pulso, tiempo bajo y penalización. */
export function TimerPill({
  label,
  bump,
  low,
  penalty,
  showIcon,
}: TimerPillProps) {
  const classes = [
    styles.timerPill,
    bump ? styles.bump : "",
    low ? styles.low : "",
    penalty ? styles.penalty : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {showIcon && (
        <span className={styles.icon} aria-hidden="true">
          <IconStopwatch size={18} />
        </span>
      )}
      {label}
    </div>
  );
}
