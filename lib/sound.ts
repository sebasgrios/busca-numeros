// Sintetizador simple vía Web Audio — sin dependencias de assets externos.

interface BeepOptions {
  freq?: number;
  type?: OscillatorType;
  dur?: number;
  vol?: number;
  slide?: number;
}

class SoundFx {
  private ctx: AudioContext | null = null;
  enabled = true;

  private ensure(): boolean {
    if (typeof window === "undefined") return false;
    if (!this.ctx) {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctx) return false;
        this.ctx = new Ctx();
      } catch {
        return false;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return !!this.ctx;
  }

  private beep({
    freq = 600,
    type = "sine",
    dur = 0.08,
    vol = 0.18,
    slide = 0,
  }: BeepOptions): void {
    if (!this.enabled) return;
    if (!this.ensure() || !this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    if (slide) {
      o.frequency.exponentialRampToValueAtTime(
        Math.max(1, freq + slide),
        ctx.currentTime + dur,
      );
    }
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  }

  /** Tono ascendente pentatónico según el progreso (0..1). */
  tap(progress = 0): void {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const idx = Math.min(scale.length - 1, Math.floor(progress * scale.length));
    this.beep({ freq: scale[idx], type: "triangle", dur: 0.12, vol: 0.18 });
  }

  wrong(): void {
    this.beep({ freq: 220, type: "sawtooth", dur: 0.22, vol: 0.18, slide: -90 });
  }

  win(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(
        () => this.beep({ freq: f, type: "triangle", dur: 0.22, vol: 0.22 }),
        i * 120,
      );
    });
  }

  click(): void {
    this.beep({ freq: 480, type: "sine", dur: 0.05, vol: 0.12 });
  }
}

let instance: SoundFx | null = null;

/** Devuelve el singleton de efectos de sonido (lazy, solo en cliente). */
export function getSfx(): SoundFx {
  if (!instance) instance = new SoundFx();
  return instance;
}

export type { SoundFx };
