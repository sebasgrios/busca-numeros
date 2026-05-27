import { memo } from "react";
import styles from "./game-board.module.css";

interface CellProps {
  n: number;
  color?: string;
  wrong: boolean;
  onSelect: (n: number) => void;
}

const Cell = memo(function Cell({ n, color, wrong, onSelect }: CellProps) {
  const classes = [styles.cell, color ? styles.done : "", wrong ? styles.wrong : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      className={classes}
      style={color ? ({ "--c": color } as React.CSSProperties) : undefined}
      onClick={() => onSelect(n)}
      aria-label={`Número ${n}`}
    >
      {n}
    </button>
  );
});

interface GameBoardProps {
  numbers: number[];
  cols: number;
  done: Record<number, string>;
  wrongNumber: number | null;
  onSelect: (n: number) => void;
}

/** Tablero adaptativo de celdas numeradas. */
export function GameBoard({
  numbers,
  cols,
  done,
  wrongNumber,
  onSelect,
}: GameBoardProps) {
  const gap = cols >= 10 ? "4px" : cols >= 7 ? "6px" : "8px";
  return (
    <div className={styles.boardWrap}>
      <div
        className={styles.board}
        role="grid"
        aria-label="Tabla de números"
        style={{ "--cols": cols, "--cell-gap": gap } as React.CSSProperties}
      >
        {numbers.map((n) => (
          <Cell
            key={n}
            n={n}
            color={done[n]}
            wrong={wrongNumber === n}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
