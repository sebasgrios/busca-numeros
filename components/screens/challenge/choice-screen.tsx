"use client";

import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { OptionCard } from "@/components/ui/option-card";
import { BottomInfo } from "@/components/ui/bottom-info";
import {
  IconArrowLeft,
  IconKey,
  IconPlus,
  IconSwords,
} from "@/components/ui/icons";
import styles from "./choice-screen.module.css";

interface ChoiceScreenProps {
  onBack: () => void;
  onCreate: () => void;
  onJoin: () => void;
}

export function ChoiceScreen({ onBack, onCreate, onJoin }: ChoiceScreenProps) {
  return (
    <Screen label="07 Challenge" className={styles.wrap}>
      <TopBar>
        <IconButton onClick={onBack} title="Volver" aria-label="Volver">
          <IconArrowLeft size={20} />
        </IconButton>
        <div />
      </TopBar>

      <div className={styles.hero}>
        <div className={styles.badge} aria-hidden="true">
          <IconSwords size={44} />
        </div>
        <h1 className={styles.title}>Multijugador</h1>
        <p className={styles.tagline}>Reta a tus amigos en la misma tabla.</p>
      </div>

      <div className={styles.spacer} />

      <div className={styles.actions}>
        <OptionCard
          color="var(--coral)"
          icon={<IconPlus size={26} />}
          title="Crear partida"
          desc="Nueva sala con código"
          onClick={onCreate}
        />
        <OptionCard
          color="var(--sky)"
          icon={<IconKey size={24} />}
          title="Unirse a partida"
          desc="Con un código de 4 letras"
          onClick={onJoin}
        />
      </div>

      <div className={styles.spacer} />

      <BottomInfo>Hasta 4 jugadores</BottomInfo>
    </Screen>
  );
}
