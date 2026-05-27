import styles from "./segmented.module.css";

export interface SegmentedOption<T> {
  value: T;
  label: React.ReactNode;
  sub?: React.ReactNode;
}

type Variant = "default" | "stack" | "compact" | "compactWrap";

interface SegmentedProps<T> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: Variant;
  /** Semántica de radiogroup (selección única explícita). */
  radio?: boolean;
  ariaLabel?: string;
}

/** Selector segmentado reutilizable con variantes de presentación. */
export function Segmented<T extends string | number | null>({
  options,
  value,
  onChange,
  variant = "default",
  radio,
  ariaLabel,
}: SegmentedProps<T>) {
  const classes = [
    styles.segmented,
    variant === "stack" ? styles.stack : "",
    variant === "compact" || variant === "compactWrap" ? styles.compact : "",
    variant === "compactWrap" ? styles.wrap : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role={radio ? "radiogroup" : undefined}
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role={radio ? "radio" : undefined}
            aria-checked={radio ? selected : undefined}
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
            {opt.sub != null && <span className={styles.sub}>{opt.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
