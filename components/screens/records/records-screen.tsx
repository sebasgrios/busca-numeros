"use client";

import { useMemo, useState } from "react";
import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { StatCard } from "@/components/ui/stat-card";
import { Segmented } from "@/components/ui/segmented";
import { useGameState } from "@/components/providers/game-state-provider";
import {
  COUNTDOWN_OPTIONS,
  GRID_OPTIONS,
  MODE_OPTIONS,
  configLabel,
  parseConfigKey,
} from "@/lib/config";
import { formatTime } from "@/lib/format";
import type { GameMode } from "@/lib/types";
import styles from "./records-screen.module.css";

interface RecordsScreenProps {
  onHome: () => void;
  onClear: () => void;
}

const FALLBACK = "10x10-classic";

export function RecordsScreen({ onHome, onClear }: RecordsScreenProps) {
  const { state } = useGameState();
  const initial = state.settings.game;

  const [fGrid, setFGrid] = useState<number | null>(initial.cols);
  const [fMode, setFMode] = useState<GameMode | null>(initial.mode);
  const [fDuration, setFDuration] = useState<number | null>(
    initial.duration || 300,
  );

  const records = useMemo(() => {
    return state.records
      .map((r) => ({ ...r, cfg: parseConfigKey(r.config || FALLBACK) }))
      .filter((r) => r.cfg !== null)
      .filter((r) => fGrid == null || r.cfg!.cols === fGrid)
      .filter((r) => fMode == null || r.cfg!.mode === fMode)
      .filter((r) => {
        if (fMode !== "countdown" || fDuration == null) return true;
        return (r.cfg!.duration || 300) === fDuration;
      })
      .sort((a, b) => a.time - b.time);
  }, [state.records, fGrid, fMode, fDuration]);

  const totalWins = records.length;
  const avg = totalWins
    ? records.reduce((sum, r) => sum + r.time, 0) / totalWins
    : null;

  return (
    <Screen scroll label="05 Records">
      <TopBar>
        <IconButton onClick={onHome}>←</IconButton>
        <IconButton onClick={onClear} title="Borrar récords">
          🗑
        </IconButton>
      </TopBar>
      <h2 className={styles.sectionTitle}>Tus récords</h2>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterLabel}>Grid</div>
          <Segmented
            variant="compact"
            value={fGrid}
            onChange={setFGrid}
            options={[
              { value: null, label: "Todos" },
              ...GRID_OPTIONS.map((o) => ({
                value: o.cols,
                label: `${o.cols}×${o.cols}`,
              })),
            ]}
          />
        </div>
        <div className={styles.filterRow}>
          <div className={styles.filterLabel}>Modo</div>
          <Segmented
            variant="compact"
            value={fMode}
            onChange={setFMode}
            options={[
              { value: null, label: "Todos" },
              ...MODE_OPTIONS.map((o) => ({ value: o.id, label: o.label })),
            ]}
          />
        </div>
        {fMode === "countdown" && (
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>Duración</div>
            <Segmented
              variant="compactWrap"
              value={fDuration}
              onChange={setFDuration}
              options={[
                { value: null, label: "Todas" },
                ...COUNTDOWN_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                })),
              ]}
            />
          </div>
        )}
      </div>

      <div className={styles.summaryGrid}>
        <StatCard dense label="Victorias" value={totalWins} />
        <StatCard
          dense
          label="Mejor"
          value={records[0] ? formatTime(records[0].time) : "—"}
        />
        <StatCard dense label="Promedio" value={avg ? formatTime(avg) : "—"} />
        <StatCard dense label="Total partidas" value={state.played} />
      </div>

      {records.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.em}>Sin récords aquí</div>
          <div>Cambia los filtros o completa una partida con estos ajustes</div>
        </div>
      ) : (
        <div className={styles.list}>
          {records.slice(0, 10).map((r, i) => (
            <div key={r.id} className={styles.row}>
              <div className={styles.rank}>{i + 1}</div>
              <div className={styles.main}>
                <div className={styles.time}>{formatTime(r.time)}</div>
                <div className={styles.meta}>
                  {configLabel(r.cfg!)}
                  {r.wrong ? ` · ${r.wrong} err.` : ""}
                </div>
              </div>
              <div className={styles.date}>
                {new Date(r.at).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
