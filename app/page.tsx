import { GameStateProvider } from "@/components/providers/game-state-provider";
import { AppShell } from "@/components/app-shell";

export default function Page() {
  return (
    <GameStateProvider>
      <AppShell />
    </GameStateProvider>
  );
}
