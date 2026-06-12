import type * as Party from "partykit/server";
import {
  DEFAULT_ROOM_CONFIG,
  MAX_DURATION,
  MAX_PLAYERS,
  MIN_DURATION,
  MIN_PLAYERS,
  PLAYER_COLORS,
  encode,
  safeDecode,
  sanitizeName,
  type ClientMessage,
  type JoinAvailability,
  type PlayerColor,
  type PlayerView,
  type PodiumEntry,
  type RoomConfig,
  type RoomSnapshot,
  type RoomStatus,
  type ServerMessage,
} from "../lib/multiplayer/protocol";

interface RoomState {
  initialized: boolean;
  hostId: string | null;
  status: RoomStatus;
  config: RoomConfig;
  players: PlayerView[]; // orden de llegada
  seed: number | null;
  round: number;
  startedAt: number | null;
  podium: PodiumEntry[] | null;
}

function freshState(): RoomState {
  return {
    initialized: false,
    hostId: null,
    status: "lobby",
    config: { ...DEFAULT_ROOM_CONFIG },
    players: [],
    seed: null,
    round: 0,
    startedAt: null,
    podium: null,
  };
}

// Saneamiento defensivo: el cliente no es de confianza, así que toda config
// entrante se acota a valores válidos (también frente a NaN / no-números).
function clampConfig(c: RoomConfig): RoomConfig {
  const rawDuration = Number.isFinite(c.duration)
    ? Math.floor(c.duration)
    : DEFAULT_ROOM_CONFIG.duration;
  const rawCapacity = Number.isFinite(c.capacity)
    ? Math.floor(c.capacity)
    : DEFAULT_ROOM_CONFIG.capacity;
  return {
    cols: [5, 7, 10].includes(c.cols) ? c.cols : DEFAULT_ROOM_CONFIG.cols,
    mode:
      c.mode === "countdown" || c.mode === "classic" || c.mode === "relax"
        ? c.mode
        : DEFAULT_ROOM_CONFIG.mode,
    duration: Math.min(MAX_DURATION, Math.max(MIN_DURATION, rawDuration)),
    capacity: Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, rawCapacity)),
    board: c.board === "independent" ? "independent" : "shared",
  };
}

export default class GameRoom implements Party.Server {
  state: RoomState = freshState();

  constructor(readonly room: Party.Room) {}

  async onStart() {
    const saved = await this.room.storage.get<RoomState>("state");
    if (saved) this.state = saved;
  }

  private async save() {
    await this.room.storage.put("state", this.state);
  }

  private get total() {
    return this.state.config.cols * this.state.config.cols;
  }

  private snapshot(): RoomSnapshot {
    return {
      code: this.room.id,
      status: this.state.status,
      hostId: this.state.hostId,
      config: this.state.config,
      players: this.state.players,
      seed: this.state.seed,
      round: this.state.round,
      startedAt: this.state.startedAt,
      total: this.total,
      podium: this.state.podium,
    };
  }

  private send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(encode(msg));
  }

  private broadcastSnapshot() {
    // El snapshot es idéntico para todos; se construye una sola vez.
    const room = this.snapshot();
    for (const conn of this.room.getConnections()) {
      this.send(conn, { type: "snapshot", room, you: conn.id });
    }
  }

  private pickColor(): PlayerColor {
    const used = new Set(this.state.players.map((p) => p.color));
    const free = PLAYER_COLORS.filter((c) => !used.has(c));
    const pool = free.length ? free : PLAYER_COLORS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private availability(): JoinAvailability {
    if (!this.state.initialized) return "not_found";
    if (this.state.status === "playing") return "in_progress";
    if (this.state.players.length >= this.state.config.capacity) return "full";
    return "joinable";
  }

  onConnect(conn: Party.Connection) {
    if (this.state.initialized) {
      this.send(conn, { type: "snapshot", room: this.snapshot(), you: conn.id });
    }
  }

  async onMessage(raw: string, sender: Party.Connection) {
    // Frame no confiable: ignora JSON inválido o sin un `type` reconocible.
    const msg = safeDecode<ClientMessage>(raw);
    if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;

    switch (msg.type) {
      case "create": {
        if (this.state.initialized) {
          this.send(sender, {
            type: "error",
            code: "already_initialized",
            message: "La sala ya existe.",
          });
          return;
        }
        const name = sanitizeName(msg.name);
        if (!name) {
          this.send(sender, {
            type: "error",
            code: "name_required",
            message: "Introduce un nombre.",
          });
          return;
        }
        this.state = freshState();
        this.state.initialized = true;
        this.state.hostId = sender.id;
        this.state.config = clampConfig(msg.config);
        this.state.players.push(this.newPlayer(sender.id, name));
        await this.save();
        this.broadcastSnapshot();
        return;
      }

      case "peek": {
        this.send(sender, {
          type: "peek",
          availability: this.availability(),
          code: this.room.id,
        });
        return;
      }

      case "join": {
        const avail = this.availability();
        if (avail !== "joinable") {
          const code =
            avail === "full"
              ? "room_full"
              : avail === "in_progress"
                ? "already_started"
                : "not_found";
          this.send(sender, {
            type: "error",
            code,
            message: "No puedes unirte a esta sala.",
          });
          return;
        }
        const name = sanitizeName(msg.name);
        if (!name) {
          this.send(sender, {
            type: "error",
            code: "name_required",
            message: "Introduce un nombre.",
          });
          return;
        }
        if (!this.state.players.some((p) => p.id === sender.id)) {
          this.state.players.push(this.newPlayer(sender.id, name));
        }
        await this.save();
        this.broadcastSnapshot();
        return;
      }

      case "config": {
        if (sender.id !== this.state.hostId || this.state.status === "playing")
          return;
        this.state.config = clampConfig({ ...this.state.config, ...msg.config });
        // Si baja la capacidad por debajo de los presentes, no expulsamos:
        // simplemente impedirá nuevas uniones.
        await this.save();
        this.broadcastSnapshot();
        return;
      }

      case "start": {
        if (sender.id !== this.state.hostId) return;
        if (this.state.players.length < MIN_PLAYERS) return;
        if (this.state.status === "finished") {
          const allReady = this.state.players.every((p) => p.rematchReady);
          if (!allReady) return;
        } else if (this.state.status !== "lobby") {
          return;
        }
        this.startRound();
        await this.save();
        this.broadcastSnapshot();
        return;
      }

      case "progress": {
        const p = this.player(sender.id);
        if (!p || p.status !== "playing") return;
        const next = Number.isFinite(msg.progress) ? msg.progress : 0;
        p.progress = Math.max(0, Math.min(this.total, next));
        // El progreso es efímero y de alta frecuencia: se difunde pero no se
        // persiste (las escrituras a storage del Durable Object son lo caro).
        // El estado durable lo fijan startRound/endRound.
        this.broadcastSnapshot();
        return;
      }

      case "finished": {
        if (this.state.status !== "playing") return;
        const p = this.player(sender.id);
        if (!p || p.status !== "playing") return;
        p.status = "finished";
        p.progress = this.total;
        // Tiempo autoritativo: se mide en servidor desde startedAt en lugar de
        // confiar en msg.time del cliente (anti-trampa). Si por alguna razón no
        // hay startedAt, se cae a null antes que a un valor manipulable.
        const winnerTime =
          this.state.startedAt != null
            ? Math.max(0, Date.now() - this.state.startedAt)
            : null;
        // Decisión de producto: la ronda acaba al primer ganador.
        this.endRound(p.id, winnerTime);
        await this.save();
        this.broadcastSnapshot();
        return;
      }

      case "eliminated": {
        if (this.state.status !== "playing") return;
        const p = this.player(sender.id);
        if (!p || p.status !== "playing") return;
        p.status = "eliminated";
        const reached = Number.isFinite(msg.progress) ? msg.progress : 0;
        p.progress = Math.max(0, Math.min(this.total, reached));
        // Si ya nadie sigue jugando, cerramos la ronda por progreso.
        if (!this.state.players.some((x) => x.status === "playing")) {
          this.endRound(null, null);
        }
        await this.save();
        this.broadcastSnapshot();
        return;
      }

      case "rematch": {
        if (this.state.status !== "finished") return;
        const p = this.player(sender.id);
        if (!p) return;
        p.rematchReady = !p.rematchReady;
        await this.save();
        this.broadcastSnapshot();
        return;
      }

      case "leave": {
        await this.removePlayer(sender.id);
        return;
      }

      case "close": {
        if (sender.id !== this.state.hostId) return;
        this.room.broadcast(encode({ type: "closed" }));
        this.state = freshState();
        await this.room.storage.delete("state");
        return;
      }
    }
  }

  async onClose(conn: Party.Connection) {
    await this.removePlayer(conn.id);
  }

  // ===== Helpers de estado =====

  private newPlayer(id: string, name: string): PlayerView {
    return {
      id,
      name,
      color: this.pickColor(),
      connected: true,
      progress: 0,
      status: "idle",
      rematchReady: false,
    };
  }

  private player(id: string): PlayerView | undefined {
    return this.state.players.find((p) => p.id === id);
  }

  private startRound() {
    this.state.status = "playing";
    this.state.round += 1;
    this.state.startedAt = Date.now();
    this.state.podium = null;
    this.state.seed =
      this.state.config.board === "shared"
        ? Math.floor(Math.random() * 2 ** 31)
        : null;
    for (const p of this.state.players) {
      p.progress = 0;
      p.status = "playing";
      p.rematchReady = false;
    }
  }

  private endRound(winnerId: string | null, winnerTime: number | null) {
    this.state.status = "finished";
    const finishers = this.state.players.filter((p) => p.id === winnerId);
    const rest = this.state.players
      .filter((p) => p.id !== winnerId)
      .sort((a, b) => b.progress - a.progress);
    const ordered = [...finishers, ...rest];

    this.state.podium = ordered.map((p, i) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      place: i + 1,
      progress: p.progress,
      time: p.id === winnerId ? winnerTime : null,
      reason: null,
    }));
    // Marcar a quien no terminó ni fue eliminado como eliminado (corte).
    for (const p of this.state.players) {
      if (p.status === "playing") p.status = "eliminated";
    }
  }

  private async removePlayer(id: string) {
    const idx = this.state.players.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const wasHost = this.state.hostId === id;
    this.state.players.splice(idx, 1);

    if (this.state.players.length === 0) {
      this.state = freshState();
      await this.room.storage.delete("state");
      return;
    }

    // Traspaso de liderazgo al siguiente por orden de llegada.
    if (wasHost) this.state.hostId = this.state.players[0].id;

    // Si la salida deja la ronda sin jugadores activos, cerrarla.
    if (
      this.state.status === "playing" &&
      !this.state.players.some((p) => p.status === "playing")
    ) {
      this.endRound(null, null);
    }

    await this.save();
    this.broadcastSnapshot();
  }
}
