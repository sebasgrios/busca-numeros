"use client";

import { useState } from "react";
import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { BottomInfo } from "@/components/ui/bottom-info";
import { HowToModal } from "@/components/ui/how-to-modal";
import { useGameState } from "@/components/providers/game-state-provider";
import { COUNTDOWN_OPTIONS, GRID_OPTIONS, MODE_OPTIONS } from "@/lib/config";
import { getSfx } from "@/lib/sound";
import { IconArrowLeft } from "@/components/ui/icons";
import { APP_VERSION } from "@/lib/version";
import type { GameMode } from "@/lib/types";
import styles from "./settings-screen.module.css";

export function SettingsScreen({ onHome }: { onHome: () => void }) {
  const { state, updateGame, updateSettings } = useGameState();
  const s = state.settings;
  const g = s.game;
  const isCountdown = g.mode === "countdown";
  const [howTo, setHowTo] = useState(false);

  const changeGame = <K extends "cols" | "mode" | "duration">(
    key: K,
    value: GameMode | number,
  ) => {
    getSfx().click();
    updateGame({ [key]: value });
  };

  return (
    <>
    <Screen scroll label="06 Settings">
      <TopBar>
        <IconButton onClick={onHome} aria-label="Volver">
          <IconArrowLeft size={20} />
        </IconButton>
        <div />
      </TopBar>
      <h2 className={styles.sectionTitle}>Ajustes</h2>

      <div className={styles.list}>
        <div className={styles.group}>
          <div className={styles.groupLabel}>Tablero</div>
          <h4 className={styles.heading}>Tamaño del grid</h4>
          <p className={styles.help}>Cuántos números tendrás que encontrar</p>
          <Segmented
            radio
            ariaLabel="Tamaño del grid"
            value={g.cols}
            onChange={(v) => changeGame("cols", v)}
            options={GRID_OPTIONS.map((o) => ({
              value: o.cols,
              label: o.label,
              sub: o.sub,
            }))}
          />
        </div>

        <div className={styles.group}>
          <div className={styles.groupLabel}>Reglas</div>
          <h4 className={styles.heading}>Modo de juego</h4>
          <p className={styles.help}>Decide cómo se gana o pierde</p>
          <Segmented
            radio
            variant="stack"
            ariaLabel="Modo de juego"
            value={g.mode}
            onChange={(v) => changeGame("mode", v)}
            options={MODE_OPTIONS.map((o) => ({
              value: o.id,
              label: o.label,
              sub: o.sub,
            }))}
          />

          {isCountdown && (
            <div className={styles.durationBlock}>
              <h4 className={styles.heading}>Duración</h4>
              <p className={styles.help}>Tiempo total para completar la tabla</p>
              <Segmented
                radio
                variant="compactWrap"
                ariaLabel="Duración"
                value={g.duration || 300}
                onChange={(v) => changeGame("duration", v)}
                options={COUNTDOWN_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
            </div>
          )}
        </div>

        <div className={styles.group}>
          <div className={styles.groupLabel}>Preferencias</div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Sonido</span>
              <span className={styles.toggleDesc}>Tonos al tocar las celdas</span>
            </div>
            <Switch
              label="Sonido"
              checked={s.sound}
              onChange={() => updateSettings({ sound: !s.sound })}
            />
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Vibración</span>
              <span className={styles.toggleDesc}>
                Feedback háptico (si tu dispositivo lo permite)
              </span>
            </div>
            <Switch
              label="Vibración"
              checked={s.haptic}
              onChange={() => updateSettings({ haptic: !s.haptic })}
            />
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Modo oscuro</span>
              <span className={styles.toggleDesc}>Interfaz con menos brillo</span>
            </div>
            <Switch
              label="Modo oscuro"
              checked={s.dark}
              onChange={() => updateSettings({ dark: !s.dark })}
            />
          </div>
        </div>

        <div className={styles.group}>
          <div className={styles.groupLabel}>Ayuda</div>
          <button
            type="button"
            className={styles.helpBtn}
            onClick={() => {
              getSfx().click();
              setHowTo(true);
            }}
          >
            <span className={styles.helpChip} aria-hidden="true">
              ?
            </span>
            ¿Cómo se juega?
          </button>
        </div>
      </div>

      <BottomInfo>BuscaNúmeros · v{APP_VERSION}</BottomInfo>
    </Screen>
    {howTo && <HowToModal onClose={() => setHowTo(false)} />}
    </>
  );
}
