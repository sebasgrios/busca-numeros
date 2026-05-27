"use client";

import { useMemo } from "react";
import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { BottomInfo } from "@/components/ui/bottom-info";
import { Backdrop } from "@/components/ui/backdrop";
import { useGameState } from "@/components/providers/game-state-provider";
import { COLORS, configKey, configLabel, shuffle } from "@/lib/config";
import { formatTime } from "@/lib/format";
import styles from "./home-screen.module.css";

interface HomeScreenProps {
  onPlay: () => void;
  onRecords: () => void;
  onSettings: () => void;
}

const LOGO_SEED = [7, 3, 12, 9, 1, 4, 11, 2, 8];

export function HomeScreen({ onPlay, onRecords, onSettings }: HomeScreenProps) {
  const { state, toggleDark } = useGameState();
  const cfg = state.settings.game;
  const key = configKey(cfg);

  const recordsForCfg = state.records.filter(
    (r) => (r.config || "10x10-classic") === key,
  );
  const best = recordsForCfg.slice().sort((a, b) => a.time - b.time)[0]?.time;
  const wins = recordsForCfg.length;

  const sample = useMemo(() => shuffle(LOGO_SEED).slice(0, 9), []);

  return (
    <Screen label="01 Home" className={styles.home}>
      <Backdrop />

      <TopBar>
        <IconButton
          aria-pressed={state.settings.dark}
          onClick={toggleDark}
          title="Modo oscuro"
        >
          {state.settings.dark ? "☀︎" : "☾"}
        </IconButton>
        <IconButton onClick={onSettings} title="Ajustes" aria-label="Ajustes">
          ⚙
        </IconButton>
      </TopBar>

      <div className={styles.hero}>
        <div className={styles.logoArt} aria-hidden="true">
          {sample.map((n, i) => (
            <div
              key={i}
              className={styles.tile}
              style={{ background: COLORS[i % COLORS.length] }}
            >
              {n}
            </div>
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
          ▶&nbsp;&nbsp;Jugar
        </Button>
        <Button variant="ghost" block onClick={onRecords}>
          🏆&nbsp;&nbsp;Récords
        </Button>
        <Button block comingSoon>
          ⚔&nbsp;&nbsp;Retar
        </Button>
      </div>

      <BottomInfo>{configLabel(cfg)}</BottomInfo>
    </Screen>
  );
}
