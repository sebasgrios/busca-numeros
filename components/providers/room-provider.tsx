"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PartySocket } from "partysocket";
import {
  decode,
  encode,
  type ClientMessage,
  type ErrorCode,
  type JoinAvailability,
  type LoseReason,
  type PlayerView,
  type RoomConfig,
  type RoomSnapshot,
  type ServerMessage,
} from "@/lib/multiplayer/protocol";
import { PARTYKIT_HOST } from "@/lib/multiplayer/identity";

type ConnStatus = "idle" | "connecting" | "connected" | "closed";

interface RoomError {
  code: ErrorCode;
  message: string;
}

interface RoomContextValue {
  code: string | null;
  snapshot: RoomSnapshot | null;
  youId: string | null;
  you: PlayerView | null;
  isHost: boolean;
  connStatus: ConnStatus;
  error: RoomError | null;
  peekResult: JoinAvailability | null;
  connect: (code: string) => void;
  peekRoom: (code: string) => Promise<JoinAvailability>;
  disconnect: () => void;
  clearError: () => void;
  create: (name: string, config: RoomConfig) => void;
  peek: () => void;
  join: (name: string) => void;
  setConfig: (config: Partial<RoomConfig>) => void;
  start: () => void;
  sendProgress: (progress: number) => void;
  sendFinished: (time: number) => void;
  sendEliminated: (progress: number, reason: LoseReason) => void;
  toggleRematch: () => void;
  leave: () => void;
  close: () => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<PartySocket | null>(null);
  const peekResolverRef = useRef<((a: JoinAvailability) => void) | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [youId, setYouId] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<ConnStatus>("idle");
  const [error, setError] = useState<RoomError | null>(null);
  const [peekResult, setPeekResult] = useState<JoinAvailability | null>(null);

  const teardown = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    teardown();
    setCode(null);
    setSnapshot(null);
    setYouId(null);
    setConnStatus("idle");
    setError(null);
    setPeekResult(null);
  }, [teardown]);

  const connect = useCallback(
    (roomCode: string) => {
      teardown();
      setSnapshot(null);
      setYouId(null);
      setError(null);
      setPeekResult(null);
      setCode(roomCode);
      setConnStatus("connecting");

      const socket = new PartySocket({ host: PARTYKIT_HOST, room: roomCode });
      socketRef.current = socket;

      socket.addEventListener("open", () => setConnStatus("connected"));
      socket.addEventListener("close", () => setConnStatus("closed"));
      socket.addEventListener("message", (event) => {
        const msg = decode<ServerMessage>(event.data as string);
        switch (msg.type) {
          case "snapshot":
            setSnapshot(msg.room);
            setYouId(msg.you);
            break;
          case "peek":
            setPeekResult(msg.availability);
            peekResolverRef.current?.(msg.availability);
            peekResolverRef.current = null;
            break;
          case "error":
            setError({ code: msg.code, message: msg.message });
            break;
          case "closed":
            setSnapshot(null);
            setConnStatus("closed");
            break;
        }
      });
    },
    [teardown],
  );

  // Cerrar la conexión al desmontar el proveedor.
  useEffect(() => () => teardown(), [teardown]);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(encode(msg));
  }, []);

  const peekRoom = useCallback(
    (roomCode: string) =>
      new Promise<JoinAvailability>((resolve) => {
        connect(roomCode);
        peekResolverRef.current = resolve;
        const socket = socketRef.current;
        socket?.addEventListener("open", () => send({ type: "peek" }), {
          once: true,
        });
        // Salvaguarda: si no hay respuesta, asumimos que no existe.
        setTimeout(() => {
          if (peekResolverRef.current === resolve) {
            peekResolverRef.current = null;
            resolve("not_found");
          }
        }, 5000);
      }),
    [connect, send],
  );

  const value = useMemo<RoomContextValue>(() => {
    const you = snapshot?.players.find((p) => p.id === youId) ?? null;
    return {
      code,
      snapshot,
      youId,
      you,
      isHost: !!youId && snapshot?.hostId === youId,
      connStatus,
      error,
      peekResult,
      connect,
      peekRoom,
      disconnect,
      clearError: () => setError(null),
      create: (name, config) => send({ type: "create", name, config }),
      peek: () => send({ type: "peek" }),
      join: (name) => send({ type: "join", name }),
      setConfig: (config) => send({ type: "config", config }),
      start: () => send({ type: "start" }),
      sendProgress: (progress) => send({ type: "progress", progress }),
      sendFinished: (time) => send({ type: "finished", time }),
      sendEliminated: (progress, reason) =>
        send({ type: "eliminated", progress, reason }),
      toggleRematch: () => send({ type: "rematch" }),
      leave: () => send({ type: "leave" }),
      close: () => send({ type: "close" }),
    };
  }, [
    code,
    snapshot,
    youId,
    connStatus,
    error,
    peekResult,
    connect,
    peekRoom,
    disconnect,
    send,
  ]);

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom debe usarse dentro de RoomProvider");
  return ctx;
}
