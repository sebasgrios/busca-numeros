"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { getStoredName, setStoredName } from "@/lib/multiplayer/identity";

interface NameModalProps {
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const MAX_NAME = 14;

export function NameModal({
  title = "¿Cómo te llamas?",
  subtitle = "Así te verán el resto de jugadores",
  confirmLabel = "Continuar",
  onConfirm,
  onCancel,
}: NameModalProps) {
  const [name, setName] = useState(() => getStoredName());
  const trimmed = name.trim();

  const submit = () => {
    if (!trimmed) return;
    setStoredName(trimmed);
    onConfirm(trimmed);
  };

  return (
    <Modal title={title} subtitle={subtitle} onClose={onCancel}>
      <TextField
        autoFocus
        value={name}
        maxLength={MAX_NAME}
        placeholder="Tu nombre"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <Button variant="primary" block disabled={!trimmed} onClick={submit}>
        {confirmLabel}
      </Button>
    </Modal>
  );
}
