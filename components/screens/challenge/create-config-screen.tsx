"use client";

import { useState } from "react";
import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { SectionTitle } from "@/components/ui/section-title";
import { SettingGroup } from "@/components/ui/setting-group";
import { IconArrowLeft } from "@/components/ui/icons";
import { getSfx } from "@/lib/sound";
import { COUNTDOWN_OPTIONS, GRID_OPTIONS, MODE_OPTIONS } from "@/lib/config";
import {
  DEFAULT_ROOM_CONFIG,
  type BoardMode,
  type RoomConfig,
} from "@/lib/multiplayer/protocol";
import type { GameMode } from "@/lib/types";
import styles from "./create-config-screen.module.css";

interface CreateConfigScreenProps {
  onBack: () => void;
  onSubmit: (config: RoomConfig) => void;
}

const BOARD_OPTIONS: { value: BoardMode; label: string; sub: string }[] = [
  { value: "shared", label: "Mismo tablero", sub: "carrera justa" },
  { value: "independent", label: "Independiente", sub: "uno por jugador" },
];

export function CreateConfigScreen({
  onBack,
  onSubmit,
}: CreateConfigScreenProps) {
  const [config, setConfig] = useState<RoomConfig>(() => ({
    ...DEFAULT_ROOM_CONFIG,
  }));

  const patch = (p: Partial<RoomConfig>) => {
    getSfx().click();
    setConfig((c) => ({ ...c, ...p }));
  };

  const isCountdown = config.mode === "countdown";

  return (
    <Screen scroll label="08 Create">
      <TopBar>
        <IconButton onClick={onBack} title="Volver" aria-label="Volver">
          <IconArrowLeft size={20} />
        </IconButton>
        <div />
      </TopBar>
      <SectionTitle>Crear partida</SectionTitle>

      <div className={styles.list}>
        <SettingGroup
          groupLabel="Tablero"
          heading="Tamaño del grid"
          help="Cuántos números habrá que encontrar"
        >
          <Segmented
            radio
            ariaLabel="Tamaño del grid"
            value={config.cols}
            onChange={(v) => patch({ cols: v })}
            options={GRID_OPTIONS.map((o) => ({
              value: o.cols,
              label: o.label,
              sub: o.sub,
            }))}
          />
        </SettingGroup>

        <SettingGroup
          groupLabel="Tablero"
          heading="¿Mismo tablero?"
          help="Comparte la cuadrícula entre todos o reparte una distinta"
        >
          <Segmented
            radio
            variant="stack"
            ariaLabel="Tipo de tablero"
            value={config.board}
            onChange={(v) => patch({ board: v })}
            options={BOARD_OPTIONS}
          />
        </SettingGroup>

        <SettingGroup
          groupLabel="Reglas"
          heading="Modo de juego"
          help="Decide cómo se gana o pierde"
        >
          <Segmented
            radio
            variant="stack"
            ariaLabel="Modo de juego"
            value={config.mode}
            onChange={(v: GameMode) => patch({ mode: v })}
            options={MODE_OPTIONS.map((o) => ({
              value: o.id,
              label: o.label,
              sub: o.sub,
            }))}
          />

          {isCountdown && (
            <div className={styles.durationBlock}>
              <h4 className={styles.durationHeading}>Duración</h4>
              <p className={styles.help}>Tiempo total para completar la tabla</p>
              <Segmented
                radio
                variant="compactWrap"
                ariaLabel="Duración"
                value={config.duration}
                onChange={(v) => patch({ duration: v })}
                options={COUNTDOWN_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
            </div>
          )}
        </SettingGroup>
      </div>

      <div className={styles.footer}>
        <Button variant="primary" block onClick={() => onSubmit(config)}>
          Crear sala
        </Button>
      </div>
    </Screen>
  );
}
