"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Screen } from "@/components/ui/screen";
import { IconButton } from "@/components/ui/icon-button";
import { BottomInfo } from "@/components/ui/bottom-info";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { IconArrowLeft, IconX } from "@/components/ui/icons";
import { useGameState } from "@/components/providers/game-state-provider";
import { useNow } from "@/hooks/use-now";
import {
  COLORS,
  COUNTDOWN_PENALTY_MS,
  configKey,
  seededShuffle,
  shuffle,
} from "@/lib/config";
import { formatTime } from "@/lib/format";
import { getSfx } from "@/lib/sound";
import { vibrate } from "@/lib/haptics";
import type { GameConfig, LoseInfo } from "@/lib/types";
import { TimerPill } from "./timer-pill";
import { ProgressBar, type ProgressMarker } from "./progress-bar";
import { GameBoard } from "./game-board";
import { StartCountdown } from "./start-countdown";
import styles from "./game-screen.module.css";

export interface WinPayload {
  time: number;
  wrong: number;
  config: string;
  remaining: number | null;
}

interface GameScreenProps {
  onWin: (payload: WinPayload) => void;
  onLose: (info: LoseInfo) => void;
  onExit: () => void;
  /** Configuración explícita (multijugador); por defecto usa los ajustes. */
  configOverride?: GameConfig;
  /** Semilla para tablero compartido (multijugador). */
  seed?: number | null;
  /** Se llama con el nº de celdas completadas tras cada acierto. */
  onProgress?: (completed: number) => void;
  /** Marcadores de progreso de rivales. */
  markers?: ProgressMarker[];
  /** Si false, el back llama onExit directo y no pausa (el padre confirma). */
  confirmOnExit?: boolean;
}

export function GameScreen({
  onWin,
  onLose,
  onExit,
  configOverride,
  seed = null,
  onProgress,
  markers,
  confirmOnExit = true,
}: GameScreenProps) {
  const { state } = useGameState();
  // Congela la configuración al iniciar la partida.
  const [cfg] = useState(() => configOverride ?? state.settings.game);
  const haptic = state.settings.haptic;

  const cols = cfg.cols;
  const total = cols * cols;
  const isCountdown = cfg.mode === "countdown";
  const durationMs = (cfg.duration || 300) * 1000;

  const [numbers] = useState(() => {
    const range = Array.from({ length: total }, (_, i) => i + 1);
    return seed != null ? seededShuffle(range, seed) : shuffle(range);
  });
  const [current, setCurrent] = useState(1);
  const [done, setDone] = useState<Record<number, string>>({});
  const [wrongNumber, setWrongNumber] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [timerBump, setTimerBump] = useState(false);
  const [penaltyFlash, setPenaltyFlash] = useState(false);

  // started: la partida ha pasado la cuenta atrás 3-2-1-¡YA!
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  // Pausa al abrir el ConfirmModal de salida: el timer se congela y al
  // cancelar se desplaza startTime para descontar la duración de la pausa.
  const [pausedAt, setPausedAt] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const endedRef = useRef(false);
  const active = started && pausedAt === 0;
  const now = useNow(active);

  const elapsed = started ? now - startTime : 0;
  const remaining = Math.max(0, durationMs - elapsed - penaltyMs);
  const lowTime =
    isCountdown && started && remaining > 0 && remaining < 10000;

  const sfx = getSfx();

  const handleCountdownComplete = useCallback(() => {
    setStartTime(Date.now());
    setStarted(true);
  }, []);

  const handleBackClick = () => {
    if (!confirmOnExit) {
      onExit();
      return;
    }
    setPausedAt(Date.now());
    setConfirmExit(true);
  };

  const handleCancelExit = () => {
    setStartTime((t) => t + (Date.now() - pausedAt));
    setPausedAt(0);
    setConfirmExit(false);
  };

  const handleConfirmExit = () => {
    setConfirmExit(false);
    onExit();
  };

  // Detección de tiempo agotado (cuenta atrás).
  useEffect(() => {
    if (!isCountdown || !started || endedRef.current || remaining > 0) return;
    endedRef.current = true;
    sfx.wrong();
    if (haptic) vibrate([80, 40, 80, 40, 120]);
    const t = setTimeout(() => {
      onLose({
        reason: "timeout",
        reachedTo: current - 1,
        timeAt: durationMs,
        total,
        config: configKey(cfg),
      });
    }, 250);
    return () => clearTimeout(t);
  }, [
    remaining,
    isCountdown,
    onLose,
    current,
    total,
    cfg,
    durationMs,
    sfx,
    haptic,
    started,
  ]);

  const handleSelect = useCallback(
    (num: number) => {
      if (endedRef.current || done[num] || !started) return;

      if (num === current) {
        const progress = current / total;
        const color = COLORS[Math.floor(progress * COLORS.length) % COLORS.length];
        setDone((prev) => ({ ...prev, [num]: color }));
        sfx.tap(progress);
        if (haptic) vibrate(15);
        setTimerBump(true);
        setTimeout(() => setTimerBump(false), 380);

        if (current === total) {
          endedRef.current = true;
          const finalTime = Date.now() - startTime + penaltyMs;
          sfx.win();
          if (haptic) vibrate([30, 60, 30, 60, 80]);
          setTimeout(
            () =>
              onWin({
                time: finalTime,
                wrong: wrongCount,
                config: configKey(cfg),
                remaining: isCountdown ? Math.max(0, durationMs - finalTime) : null,
              }),
            350,
          );
        } else {
          onProgress?.(current);
          setCurrent((c) => c + 1);
        }
      } else {
        sfx.wrong();
        if (haptic) vibrate([60, 30, 60]);
        setWrongNumber(num);
        setTimeout(() => setWrongNumber(null), 400);
        setWrongCount((c) => c + 1);

        if (cfg.mode === "classic") {
          endedRef.current = true;
          setTimeout(() => {
            onLose({
              reason: "mistake",
              reachedTo: current - 1,
              timeAt: Date.now() - startTime,
              tapped: num,
              expected: current,
              total,
              config: configKey(cfg),
            });
          }, 520);
        } else if (isCountdown) {
          setPenaltyMs((p) => p + COUNTDOWN_PENALTY_MS);
          setPenaltyFlash(true);
          setTimeout(() => setPenaltyFlash(false), 600);
        }
      }
    },
    [
      current,
      done,
      onLose,
      onWin,
      haptic,
      sfx,
      total,
      cfg,
      wrongCount,
      isCountdown,
      durationMs,
      penaltyMs,
      startTime,
      started,
      onProgress,
    ],
  );

  const completedCount = current - 1;
  const pct = Math.round((completedCount / total) * 100);
  const timerLabel = isCountdown ? formatTime(remaining) : formatTime(elapsed);
  const showErrors = (cfg.mode === "relax" || isCountdown) && wrongCount > 0;

  return (
    <>
      <Screen label="02 Game">
        <div className={styles.head}>
          <div className={styles.left}>
            <IconButton
              onClick={handleBackClick}
              title="Salir"
              aria-label="Salir de la partida"
            >
              <IconArrowLeft size={20} />
            </IconButton>
          </div>
          <div className={styles.center}>
            <TimerPill
              label={timerLabel}
              bump={timerBump}
              low={lowTime}
              penalty={penaltyFlash}
              showIcon={isCountdown}
            />
          </div>
          <div className={styles.right}>
            {showErrors && (
              <div className={styles.errorBadge} title="Errores">
                <IconX size={14} />
                {wrongCount}
              </div>
            )}
          </div>
        </div>

        <ProgressBar pct={pct} markers={markers} />

        <GameBoard
          numbers={numbers}
          cols={cols}
          done={done}
          wrongNumber={wrongNumber}
          onSelect={handleSelect}
        />

        <BottomInfo>
          {cfg.mode === "classic" && "¡cuidado, un error termina la partida!"}
          {cfg.mode === "relax" && "Modo relax · sigue aunque te equivoques"}
          {isCountdown &&
            `Cuenta atrás · cada error resta ${COUNTDOWN_PENALTY_MS / 1000}s`}
        </BottomInfo>
      </Screen>
      {!started && <StartCountdown onComplete={handleCountdownComplete} />}
      {confirmExit && (
        <ConfirmModal
          title="¿Salir de la partida?"
          subtitle="Perderás el progreso actual."
          confirmLabel="Salir"
          cancelLabel="Seguir jugando"
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      )}
    </>
  );
}
