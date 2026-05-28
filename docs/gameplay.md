---
title: Gameplay
summary: Mecánicas de juego — modos, grids, timer, cuenta atrás de inicio (3-2-1-¡YA!), pausa en confirm SP, penalización, victoria/derrota, generación del tablero (semilla compartida en multijugador).
tags: [gameplay, game, modes, timer, countdown, pause, penalty, board, seed, victory, lose]
---

# Gameplay

## Objetivo

Tocar los números del 1 al `cols × cols` en orden, sin pistas visuales de cuál es el siguiente. El jugador memoriza el orden. Solo la barra de progreso refleja cuántos llevas.

## Modos

Definidos en `lib/config.ts`:

```ts
const MODE_OPTIONS = [
  { id: "countdown", label: "Cuenta atrás", sub: "tiempo limitado" },
  { id: "classic",   label: "Clásico",      sub: "1 error y pierdes" },
  { id: "relax",     label: "Relax",        sub: "sin penalización" },
];
```

### Cuenta atrás (default)

- Timer regresivo desde `duration` (segundos) configurable: 60 / 150 / 300 / 600 / 900.
- Cada error suma `penaltyMs` (3000 ms) que se descuenta de `remaining`. El texto del modo dice "cada error resta 3s".
- Si `remaining` llega a 0 → derrota con `reason: "timeout"`.
- Si completa la tabla antes → victoria con `remaining` restante mostrado en Victory.
- TimerPill pulsa cuando `remaining < 10000ms` (clase `low` con animación `timerLow` infinita).
- Shake "penalty" del TimerPill al sumar penalización (animación `timerPenalty`).

### Clásico

- Cronómetro ascendente.
- Un solo error → derrota inmediata con `reason: "mistake"` (info: `tapped`, `expected`).

### Relax

- Cronómetro ascendente.
- Errores no terminan la partida; se cuentan en `wrongCount` y se muestran en el badge ✕N de la topbar.

## Grids

```ts
const GRID_OPTIONS = [
  { cols: 5,  label: "5 × 5",   sub: "25 nº" },
  { cols: 7,  label: "7 × 7",   sub: "49 nº" },
  { cols: 10, label: "10 × 10", sub: "100 nº" },
];
```

El tablero usa `container-type: inline-size` y las celdas se dimensionan en `cqw`: `font-size: calc(100cqw / var(--cols) * 0.40)`. Escala automático sin breakpoints. Gap entre celdas según cols (8/6/4 px).

## Generación del tablero

`useState(() => shuffle(Array.from({length: total}, (_, i) => i + 1)))`:

- **SP**: `shuffle()` usa `Math.random` — orden distinto cada partida.
- **MP con `board: "shared"`**: `seededShuffle(range, seed)` con la semilla del servidor (`snapshot.seed`). Todos los jugadores ven la misma cuadrícula.
- **MP con `board: "independent"`**: `seed === null` → `shuffle()` aleatorio por cliente.

`seededShuffle` usa **mulberry32**, PRNG determinista. Misma semilla → misma permutación.

## Cuenta atrás de inicio (3-2-1-¡YA!)

`components/screens/game/start-countdown.tsx`. Cada partida (SP y MP) muestra un overlay con cuenta atrás antes de que el tablero acepte taps. El timer del modo no arranca hasta que termina.

### Implementación

`GameScreen`:

```ts
const [started, setStarted] = useState(false);
const [startTime, setStartTime] = useState(0);

const handleCountdownComplete = useCallback(() => {
  setStartTime(Date.now());
  setStarted(true);
}, []);

// JSX al final
{!started && <StartCountdown onComplete={handleCountdownComplete} />}
```

- `useNow(started && pausedAt === 0)` — solo tickea cuando el juego está activo.
- `handleSelect(num)` ignora el tap si `!started`.
- `useEffect` de timeout (cuenta atrás → 0) está gateado por `started`.

### StartCountdown

Estado interno: `step` baja de 3 → 2 → 1 → 0 (muestra "¡YA!") → -1 (completado).

```ts
useEffect(() => {
  if (step < 0) return;
  if (step > 0) sfx.click();
  const delay = step === 0 ? 450 : 850;
  const t = setTimeout(() => {
    if (step === 0) { onComplete(); setStep(-1); }
    else setStep(step - 1);
  }, delay);
  return () => clearTimeout(t);
}, [step, onComplete]);
```

Total: 850×3 + 450 ≈ 3.0s.

Visual: número grande coral (180px Fredoka) con `animation: countPop 0.85s` (scale 0.4→1.15→0.85, opacity 0→1→0). El "¡YA!" en mint (120px) con duración más corta.

Overlay con `position: absolute; inset: 0; background: rgba(20,12,36,0.4); backdrop-filter: blur(6px); z-index: 30` — bloquea visualmente el tablero y captura pointer events.

## Pausa en confirm SP

Cuando el jugador pulsa back en SP, se abre el `ConfirmModal` de salida y el timer se **pausa**.

### Implementación

```ts
const [pausedAt, setPausedAt] = useState(0);
const [confirmExit, setConfirmExit] = useState(false);
const active = started && pausedAt === 0;
const now = useNow(active);  // ⛔ deja de tickear cuando pausedAt > 0

const handleBackClick = () => {
  if (!confirmOnExit) { onExit(); return; }     // MP: salir directo
  setPausedAt(Date.now());                       // ⏸️ guarda momento de pausa
  setConfirmExit(true);
};

const handleCancelExit = () => {                 // ▶️ reanudar
  setStartTime((t) => t + (Date.now() - pausedAt));  // desplaza startTime
  setPausedAt(0);
  setConfirmExit(false);
};

const handleConfirmExit = () => {                // ⏹️ salir
  setConfirmExit(false);
  onExit();  // navegación, el componente se desmonta
};
```

El truco: al reanudar, se desplaza `startTime` **hacia adelante** la duración de la pausa, así `elapsed = now - startTime` no incluye el tiempo congelado.

En multijugador `confirmOnExit={false}` y el back llama directo a `onExit` (el padre `ChallengeFlow` muestra su propio ConfirmModal sin pausar, porque pausar afectaría solo al jugador local y no tiene sentido en una partida competitiva).

## Detección de tiempo agotado (cuenta atrás)

```ts
useEffect(() => {
  if (!isCountdown || !started || endedRef.current || remaining > 0) return;
  endedRef.current = true;
  sfx.wrong();
  if (haptic) vibrate([80, 40, 80, 40, 120]);
  const t = setTimeout(() => {
    onLose({
      reason: "timeout",
      reachedTo: current - 1,
      timeAt: durationMs,
      total,
      config: configKey(cfg),
    });
  }, 250);
  return () => clearTimeout(t);
}, [remaining, isCountdown, ..., started]);
```

`endedRef` (no state) garantiza que onLose se llame exactamente una vez aunque el effect se re-evalúe.

## Acertar y fallar

```ts
function handleSelect(num) {
  if (endedRef.current || done[num] || !started) return;

  if (num === current) {
    // ACIERTO
    setDone(prev => ({ ...prev, [num]: COLORS[...] }));   // pinta verde+✓
    sfx.tap(progress); if (haptic) vibrate(15);
    setTimerBump(true);  // animación timerBump 0.4s

    if (current === total) {
      // GAME OVER: victoria
      endedRef.current = true;
      const finalTime = Date.now() - startTime + penaltyMs;
      sfx.win(); if (haptic) vibrate([30,60,30,60,80]);
      setTimeout(() => onWin({ time: finalTime, wrong, config, remaining }), 350);
    } else {
      onProgress?.(current);   // notifica MP
      setCurrent(c => c + 1);
    }
  } else {
    // FALLO
    sfx.wrong(); if (haptic) vibrate([60,30,60]);
    setWrongNumber(num);  // shake celda
    setWrongCount(c => c + 1);

    if (cfg.mode === "classic") {
      endedRef.current = true;
      setTimeout(() => onLose({ reason: "mistake", ... }), 520);
    } else if (isCountdown) {
      setPenaltyMs(p => p + COUNTDOWN_PENALTY_MS);
      setPenaltyFlash(true);  // shake timer
    }
  }
}
```

## Constantes

```ts
const COUNTDOWN_PENALTY_MS = 3000;  // 3s
const COLORS = ["var(--mint)", "var(--sky)", "var(--coral)",
                "var(--sun)", "var(--lavender)", "var(--pink)"];
```

El color de la celda al acertar rota según el progreso (`COLORS[Math.floor(progress * COLORS.length) % COLORS.length]`) → arcoíris al completar la tabla.

## Sonido (`lib/sound.ts`)

`SoundFx` con Web Audio (singleton lazy `getSfx()`):

- `tap(progress)` — onda triangle ascendente pentatónica según progreso (0..1).
- `wrong()` — sawtooth grave con slide downward.
- `win()` — secuencia de 4 notas triangle (fanfarria).
- `click()` — beep corto sine para navegación.

`enabled` se sincroniza con `settings.sound` desde `GameStateProvider`.

## Vibración (`lib/haptics.ts`)

```ts
vibrate(pattern: number | number[]): void
```

Llama a `navigator.vibrate(pattern)` con try/catch. Patrones:

- Acierto: 15ms.
- Fallo: 60-30-60 (tres pulsos cortos).
- Victoria: 30-60-30-60-80 (escalada).
- Timeout: 80-40-80-40-120 (sirena).
- Clic UI: ninguno (solo sonido).

`settings.haptic` controla si se llama.

## Final de partida

- **Victoria**: `onWin({time, wrong, config, remaining})`. El shell registra el récord vía `registerWin()` (calcula rank/isRecord) y navega a Victory. En MP envía `finished{time}` al servidor.
- **Derrota**: `onLose({reason, reachedTo, timeAt, total, config, tapped?, expected?})`. El shell registra `registerLoss()` (suma `played`) y navega a Lose. En MP envía `eliminated{progress, reason}` y muestra `EliminatedOverlay`.

## Récords

`registerWin` mantiene **top 20 por configuración**. La pantalla Records muestra top 10 con filtros. Detalles en [`screens-and-flows.md`](./screens-and-flows.md) y [`state.md`](./state.md).
