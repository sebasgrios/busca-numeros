"use client";

import { Modal } from "./modal";
import { Button } from "./button";

interface ConfirmModalProps {
  title: string;
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal de confirmación con dos acciones. */
export function ConfirmModal({
  title,
  subtitle,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal title={title} subtitle={subtitle}>
      <Button variant="primary" block onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button variant="ghost" block onClick={onCancel}>
        {cancelLabel}
      </Button>
    </Modal>
  );
}
