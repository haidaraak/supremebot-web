"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Attack } from "@/lib/types";

/** The four outcomes the backend distinguishes, in display order. */
const ORDER = ["running", "completed", "stopped", "failed"] as const;
type Status = (typeof ORDER)[number];

const TOKEN: Record<Status, string> = {
  running: "var(--color-state)",
  completed: "var(--color-ok)",
  stopped: "var(--color-fg-subtle)",
  failed: "var(--color-bad)",
};

/**
 * How tests end. A single 100%-wide stacked bar carries the whole ratio — the
 * segments are labelled in place, so there is no legend to cross-reference and
 * no second chart saying the same thing twice.
 */
export function StatusBreakdown({ attacks }: { attacks: Attack[] }) {
  const { t } = useTranslation();

  const { counts, total } = useMemo(() => {
    const counts = new Map<Status, number>();
    for (const a of attacks) {
      const s = a.status as Status;
      if (!ORDER.includes(s)) continue;
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return { counts, total: attacks.length };
  }, [attacks]);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-xs text-fg-subtle">
        {t("dash.chartEmpty")}
      </div>
    );
  }

  const segments = ORDER.filter((s) => counts.has(s)).map((s) => ({
    status: s,
    n: counts.get(s) as number,
  }));
  const widest = Math.max(...segments.map((s) => s.n));

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
          {t("dash.chartStatus")}
        </div>
        <span className="tabular text-2xs text-fg-subtle">
          {t("dash.chartStatusTotal", { n: total })}
        </span>
      </div>

      {/* Stacked bar — one segment per outcome, widths are the ratio itself. */}
      <div
        className="flex h-9 overflow-hidden rounded-[10px] border border-line"
        role="img"
        aria-label={t("dash.chartStatusAria")}
      >
        {segments.map((s) => (
          <div
            key={s.status}
            className="h-full transition-all duration-500"
            style={{
              width: `${(s.n / total) * 100}%`,
              backgroundColor: TOKEN[s.status],
            }}
          />
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
        {segments.map((s) => (
          <li key={s.status} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs text-fg">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: TOKEN[s.status] }}
              />
              {t(`dash.status_${s.status}`)}
            </span>
            <span
              className={`tabular shrink-0 text-2xs ${
                s.n === widest
                  ? "font-semibold text-fg"
                  : "text-fg-subtle"
              }`}
            >
              {s.n} · {Math.round((s.n / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
