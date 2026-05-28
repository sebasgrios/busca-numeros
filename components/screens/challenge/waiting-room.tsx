"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/components/providers/room-provider";
import {
  COLOR_HEX,
  MIN_PLAYERS,
  PLAYER_COLORS,
  type PlayerColor,
} from "@/lib/multiplayer/protocol";
import { getSfx } from "@/lib/sound";
import {
  IconCheck,
  IconCopy,
  IconPerson,
  IconSmile,
} from "@/components/ui/icons";
import styles from "./waiting-room.module.css";

interface Slot {
  color: PlayerColor;
  name: string | null;
  isYou: boolean;
  isHost: boolean;
}

export function WaitingRoom({ onRequestClose }: { onRequestClose: () => void }) {
  const { snapshot, youId, isHost, start } = useRoom();
  const [copied, setCopied] = useState(false);

  if (!snapshot) return null;
  const { players, config, code, hostId } = snapshot;

  // Construye los huecos: jugadores presentes + plazas vacías con color libre.
  const usedColors = new Set(players.map((p) => p.color));
  const freeColors = PLAYER_COLORS.filter((c) => !usedColors.has(c));
  const slots: Slot[] = [];
  for (let i = 0; i < config.capacity; i++) {
    const p = players[i];
    if (p) {
      slots.push({
        color: p.color,
        name: p.name,
        isYou: p.id === youId,
        isHost: p.id === hostId,
      });
    } else {
      const color = freeColors[i - players.length] ?? "rojo";
      slots.push({ color, name: null, isYou: false, isHost: false });
    }
  }

  const canStart = players.length >= MIN_PLAYERS;

  const copyCode = async () => {
    getSfx().click();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* portapapeles no disponible */
    }
  };

  const invite = async () => {
    getSfx().click();
    const url = `${window.location.origin}/?join=${code}`;
    const shareData = {
      title: "BuscaNúmeros",
      text: `Únete a mi partida con el código ${code}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* cancelado o no soportado */
    }
  };

  return (
    <Modal
      title="Sala de espera"
      subtitle={`${players.length}/${config.capacity} jugadores`}
      onClose={onRequestClose}
    >
      <div className={styles.grid}>
        {slots.map((s, i) => (
          <div
            key={i}
            className={`${styles.slot} ${s.name ? styles.filled : styles.empty}`}
          >
            <div
              className={styles.avatar}
              style={{ background: COLOR_HEX[s.color] }}
            >
              {s.name ? <IconSmile size={28} /> : <IconPerson size={28} />}
            </div>
            <span className={styles.name}>{s.name ?? "Esperando…"}</span>
            {s.name && (
              <span className={styles.badge}>
                {s.isHost ? "Anfitrión" : s.isYou ? "Tú" : "Listo"}
              </span>
            )}
          </div>
        ))}
      </div>

      <button className={styles.codeRow} onClick={copyCode} title="Copiar código">
        {code}
        <span className={styles.codeIcon} aria-hidden="true">
          {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
        </span>
      </button>
      <p className={styles.codeHint}>
        {copied ? "¡Copiado!" : "Toca el código para copiarlo"}
      </p>

      {isHost ? (
        <div className={styles.actions}>
          <Button variant="ghost" block onClick={invite}>
            Invitar
          </Button>
          <Button
            variant="primary"
            block
            disabled={!canStart}
            onClick={() => {
              getSfx().click();
              start();
            }}
          >
            Iniciar
          </Button>
        </div>
      ) : (
        <>
          <Button variant="ghost" block onClick={invite}>
            Invitar
          </Button>
          <p className={styles.waitHint}>
            Esperando a que el anfitrión inicie la partida…
          </p>
        </>
      )}
    </Modal>
  );
}
