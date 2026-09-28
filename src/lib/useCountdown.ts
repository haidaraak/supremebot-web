import { useEffect, useState } from "react";

/* ============================================================
   Front-end countdown for a running attack.
   ------------------------------------------------------------
   The backend does not stream progress — it hands back `createdAt`,
   `duration` and (once finished) `endedAt`. So rather than ticking a
   counter down and drifting away from reality a second at a time, the
   remaining time is recomputed from the wall clock on every render:
   the elapsed amount is always `now - createdAt`, and the remaining
   amount is whatever is left of the requested duration.
   ============================================================ */

export type CountdownState = {
  /** Whole seconds left, clamped at 0. */
  remaining: number;
  /** Whole seconds elapsed, clamped at 0. */
  elapsed: number;
  /** requested duration in seconds. */
  duration: number;
  /** 0..1 — fraction of the window still ahead. */
  progress: number;
  /** True once the window has been used up. */
  finished: boolean;
};

function compute(startedAt: number, duration: number, endedAt: number | null): CountdownState {
  const now = endedAt ?? Date.now();
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = Math.max(0, duration - elapsed);
  const finished = endedAt !== null || remaining <= 0;
  return {
    remaining,
    elapsed,
    duration,
    progress: duration > 0 ? remaining / duration : 0,
    finished,
  };
}

/**
 * Recomputes the countdown once a second from the timestamps the backend
 * gave us. Stops ticking once the window is used up, and does not tick at
 * all when `enabled` is false (e.g. the attack is stopped before its time).
 */
export function useCountdown(
  startedAt: string | number | null | undefined,
  duration: number,
  endedAt: string | number | null | undefined,
  enabled = true,
): CountdownState {
  const started = toMs(startedAt);
  const ended = toMs(endedAt);
  const settled = ended !== null || !enabled;

  const [, tick] = useState(0);
  useEffect(() => {
    if (settled) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [settled]);

  if (started === null) {
    return { remaining: 0, elapsed: 0, duration, progress: 0, finished: true };
  }
  return compute(started, Math.max(0, duration), ended);
}

function toMs(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v > 1e12 ? v : v * 1000;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? null : ms;
}

/* ── Formatting ─────────────────────────────────────────────── */

export function fmtCountdown(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
