"use client";

import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { BottomInfo } from "@/components/ui/bottom-info";
import { Backdrop } from "@/components/ui/backdrop";
import styles from "./choice-screen.module.css";

interface ChoiceScreenProps {
  onBack: () => void;
  onCreate: () => void;
  onJoin: () => void;
}

export function ChoiceScreen({ onBack, onCreate, onJoin }: ChoiceScreenProps) {
  return (
    <Screen label="07 Challenge" className={styles.wrap}>
      <Backdrop blobs={["b1", "b2"]} />
      <TopBar>
        <IconButton onClick={onBack} title="Volver">
          ←
        </IconButton>
        <div />
      </TopBar>

      <div className={styles.hero}>
        <div className={styles.emoji} aria-hidden="true">
          ⚔️
        </div>
        <h1 className={styles.title}>Multijugador</h1>
        <p className={styles.tagline}>Reta a tus amigos en la misma tabla.</p>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" block onClick={onCreate}>
          ➕&nbsp;&nbsp;Crear partida
        </Button>
        <Button variant="secondary" block onClick={onJoin}>
          🔑&nbsp;&nbsp;Unirse a partida
        </Button>
      </div>

      <BottomInfo>Hasta 4 jugadores</BottomInfo>
    </Screen>
  );
}
