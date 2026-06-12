"use client";

import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { BottomInfo } from "@/components/ui/bottom-info";
import { useGameState } from "@/components/providers/game-state-provider";
import { useClientValue } from "@/hooks/use-client-value";
import { COLORS, configKey, configLabel, shuffle } from "@/lib/config";
import { formatTime } from "@/lib/format";
import { getSfx } from "@/lib/sound";
import {
  IconCog,
  IconPlay,
  IconSwords,
  IconTrophy,
} from "@/components/ui/icons";
import styles from "./home-screen.module.css";

interface HomeScreenProps {
  onPlay: () => void;
  onRecords: () => void;
  onSettings: () => void;
  onChallenge: () => void;
}

const LOGO_SEED = [7, 3, 12, 9, 1, 4, 11, 2, 8];

export function HomeScreen({
  onPlay,
  onRecords,
  onSettings,
  onChallenge,
}: HomeScreenProps) {
  const { state } = useGameState();
  const cfg = state.settings.game;
  const key = configKey(cfg);

  const recordsForCfg = state.records.filter(
    (r) => (r.config || "10x10-classic") === key,
  );
  const best = recordsForCfg.slice().sort((a, b) => a.time - b.time)[0]?.time;
  const wins = recordsForCfg.length;

  const sample =
    useClientValue(() => shuffle(LOGO_SEED).slice(0, 9)) ??
    LOGO_SEED.slice(0, 9);

  return (
    <Screen label="01 Home" className={styles.home}>
      <TopBar>
        {/* Toggle de tema oculto por accesibilidad. El cambio de modo
            oscuro vive ahora únicamente en Ajustes.
        <IconButton
          aria-pressed={state.settings.dark}
          onClick={toggleDark}
          title="Modo oscuro"
          aria-label="Cambiar tema"
        >
          {state.settings.dark ? <IconSun size={20} /> : <IconMoon size={20} />}
        </IconButton>
        */}
        <div />
        <IconButton
          variant="accent"
          onClick={onSettings}
          title="Ajustes"
          aria-label="Ajustes"
        >
          <IconCog size={20} />
        </IconButton>
      </TopBar>

      <div className={styles.hero}>
        {/* Easter egg: los tiles del logo son pulsables y suenan como un
            pequeño instrumento (una nota por posición). No hay orden ni
            acierto/fallo, solo el sonido. */}
        <div className={styles.logoArt} aria-hidden="true">
          {sample.map((n, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              className={styles.tile}
              style={{ background: COLORS[i % COLORS.length] }}
              onClick={() => getSfx().tap(i / (sample.length - 1))}
            >
              {n}
            </button>
          ))}
        </div>
        <h1 className={styles.brand}>
          Busca<span className={styles.accent}>Números</span>
        </h1>
        <p className={styles.tagline}>
          Memoriza el orden. Toca del 1 al {cfg.cols * cfg.cols}.
        </p>
      </div>

      <div className={styles.spacer} />

      <div className={styles.stats}>
        <StatCard
          label={`Mejor · ${cfg.cols}×${cfg.cols}`}
          value={best != null ? formatTime(best) : "—"}
        />
        <StatCard label="Victorias" value={wins} />
      </div>

      <div className={styles.actions}>
        <Button variant="primary" block onClick={onPlay}>
          <IconPlay size={20} />
          Jugar
        </Button>
        <Button variant="ghost" block onClick={onRecords}>
          <IconTrophy size={20} />
          Récords
        </Button>
        <Button variant="secondary" block onClick={onChallenge}>
          <IconSwords size={20} />
          Retar
        </Button>
      </div>

      <BottomInfo>{configLabel(cfg)}</BottomInfo>
    </Screen>
  );
}
