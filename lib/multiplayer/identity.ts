const NAME_KEY = "buscanumeros:name";

/** Host del servidor PartyKit (override por env en producción). */
export const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";

/** Lee el último nombre de usuario usado. */
export function getStoredName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Persiste el nombre de usuario para futuras partidas. */
export function setStoredName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}
