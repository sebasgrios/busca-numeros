"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface AbandonedModalProps {
  onContinue: () => void;
}

/**
 * Se muestra cuando el resto de jugadores ha salido y queda un único
 * jugador conectado en la sala. La partida se cierra al continuar.
 */
export function AbandonedModal({ onContinue }: AbandonedModalProps) {
  return (
    <Modal
      title="Te has quedado solo"
      subtitle="Los demás jugadores han salido de la partida, así que se va a cerrar."
    >
      <Button variant="primary" block onClick={onContinue}>
        Entendido
      </Button>
    </Modal>
  );
}
