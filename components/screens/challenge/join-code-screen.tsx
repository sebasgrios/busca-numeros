"use client";

import { useState } from "react";
import { Screen } from "@/components/ui/screen";
import { TopBar } from "@/components/ui/top-bar";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { IconArrowLeft, IconKey } from "@/components/ui/icons";
import type { JoinAvailability } from "@/lib/multiplayer/protocol";
import styles from "./join-code-screen.module.css";

interface JoinCodeScreenProps {
  initialCode?: string;
  onBack: () => void;
  onValidated: (code: string) => void;
  /** Valida el código contra el servidor. */
  checkCode: (code: string) => Promise<JoinAvailability>;
}

const AVAILABILITY_ERROR: Record<Exclude<JoinAvailability, "joinable">, string> = {
  not_found: "No existe ninguna sala con ese código.",
  full: "Esa sala está completa.",
  in_progress: "La partida ya ha empezado.",
};

export function JoinCodeScreen({
  initialCode = "",
  onBack,
  onValidated,
  checkCode,
}: JoinCodeScreenProps) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const trimmed = code.trim().toUpperCase();

  const submit = async () => {
    if (trimmed.length < 4 || checking) return;
    setChecking(true);
    setError("");
    const avail = await checkCode(trimmed);
    setChecking(false);
    if (avail === "joinable") {
      onValidated(trimmed);
    } else {
      setError(AVAILABILITY_ERROR[avail]);
    }
  };

  return (
    <Screen label="10 Join" className={styles.wrap}>
      <TopBar>
        <IconButton onClick={onBack} title="Volver" aria-label="Volver">
          <IconArrowLeft size={20} />
        </IconButton>
        <div />
      </TopBar>

      <div className={styles.hero}>
        <div className={styles.badge} aria-hidden="true">
          <IconKey size={40} />
        </div>
        <h1 className={styles.title}>Unirse a partida</h1>
        <p className={styles.tagline}>Introduce el código de la sala.</p>
      </div>

      <div className={styles.spacer} />

      <div className={styles.form}>
        <TextField
          code
          autoFocus
          value={code}
          maxLength={4}
          placeholder="CÓDIGO"
          inputMode="text"
          autoCapitalize="characters"
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <p className={styles.error}>{error}</p>
        <Button
          variant="primary"
          block
          disabled={trimmed.length < 4 || checking}
          onClick={submit}
        >
          {checking ? "Comprobando…" : "Continuar"}
        </Button>
      </div>
    </Screen>
  );
}
