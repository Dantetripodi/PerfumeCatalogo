/**
 * PIN gate for the internal Content Studio tools.
 *
 * Lives apart from PinModal so the modal — and the studio bundle behind it —
 * can be code-split: App needs to know whether the studio is already unlocked
 * on first render, long before the modal itself is worth downloading.
 */
const STUDIO_PIN = import.meta.env.VITE_STUDIO_PIN ?? "dt2025";
const SESSION_KEY = "dtfragancias_studio_unlocked";

/** True when the PIN was already entered in this browser session. */
export function isStudioUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function unlockStudio(): void {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function isStudioPin(candidate: string): boolean {
  return candidate === STUDIO_PIN;
}
