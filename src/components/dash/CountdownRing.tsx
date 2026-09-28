"use client";

import { useTranslation } from "react-i18next";

import type { Attack } from "@/lib/types";
import { useCountdown, fmtCountdown, type CountdownState } from "@/lib/useCountdown";
import { cn } from "@/lib/cn";

/* ============================================================
   Attack status + live countdown.
   ------------------------------------------------------------
   Shows where an attack stands right now — the status the backend
   last reported, plus a countdown ring driven by the launch
   window the user asked for. The ring is a progress shape, not a
   decoration: its fill is the remaining fraction of the window.
   ============================================================ */

type Tone = "running" | "queued" | "stopped" | "completed" | "failed";

const TONE_CLASS: Record<Tone, string> = {
  running: "text-state border-bad/40 bg-bad/10",
  queued: "text-warn border-warn/40 bg-warn/10",
  stopped: "text-fg-muted border-line bg-surface-2",
  completed: "text-ok border-ok/40 bg-ok/10",
  failed: "text-bad border-bad/40 bg-bad/10",
};

const RING_COLOR: Record<Tone, string> = {
  running: "var(--color-state)",
  queued: "var(--color-warn)",
  stopped: "var(--color-fg-subtle)",
  completed: "var(--color-ok)",
  failed: "var(--color-bad)",
};

export function toneOf(status: string): Tone {
  if (status === "running") return "running";
  if (status === "queued") return "queued";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  return "stopped";
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const { t } = useTranslation();
  const tone = toneOf(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-[0.08em]",
        TONE_CLASS[tone],
        className,
      )}
    >
      {tone === "running" && <span className="pulse-dot size-1.5 rounded-full bg-current" />}
      {t(`attacks.${tone}`)}
    </span>
  );
}

const R = 26;
const CIRC = 2 * Math.PI * R;

/** Ring + remaining-time readout for one attack. */
export function CountdownRing({
  attack,
  compact = false,
  className,
}: {
  attack: Pick<Attack, "status" | "createdAt" | "duration" | "endedAt">;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const tone = toneOf(attack.status);
  const live = tone === "running" || tone === "queued";
  const c: CountdownState = useCountdown(
    attack.createdAt,
    attack.duration,
    attack.endedAt,
    live,
  );

  const label = !live
    ? t(`attacks.${tone}`)
    : c.finished
      ? t("console.expired")
      : fmtCountdown(c.remaining);

  const dash = c.duration > 0 ? CIRC * c.progress : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative shrink-0" style={{ width: compact ? 44 : 60, height: compact ? 44 : 60 }}>
        <svg
          viewBox="0 0 64 64"
          className="size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke={RING_COLOR[tone]}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC}`}
            className={cn("transition-[stroke-dasharray] duration-1000 ease-linear", live && !c.finished && "")}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 grid place-items-center tabular font-semibold",
            compact ? "text-2xs" : "text-sm",
            tone === "running" && !c.finished ? "text-accent" : "text-fg",
          )}
        >
          {live ? c.remaining : "–"}
        </span>
      </div>
      <div className="min-w-0">
        <div
          className={cn(
            "tabular font-semibold leading-tight text-fg",
            compact ? "text-base" : "text-xl",
          )}
        >
          {label}
        </div>
        <div className="tabular text-2xs text-fg-subtle">
          {t("console.elapsed")} {fmtCountdown(c.elapsed)}
          {c.duration > 0 && <span className="opacity-60"> / {fmtCountdown(c.duration)}</span>}
        </div>
      </div>
    </div>
  );
}
