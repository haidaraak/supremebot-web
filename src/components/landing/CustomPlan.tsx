"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Build-your-own plan. The three sliders are the same limits every tier caps
 * (concurrency, runtime, threads); price is derived from them so the quote is
 * always consistent with the chosen capacity rather than a hardcoded number.
 *
 * This produces a quote only — it links to the dashboard where an operator
 * finalizes it. The backend has no custom-plan endpoint, so nothing here
 * pretends to bill.
 */
const CURRENCY = "$";

function quote(concurrent: number, durationMin: number, threads: number): number {
  const base = 12;
  const bySlot = concurrent * 7.5;
  const byRuntime = (durationMin / 60) * 4;
  const byThreads = (threads / 1000) * 9;
  return Math.round((base + bySlot + byRuntime + byThreads) * 100) / 100;
}

/** Fills the track up to the thumb; sliders stay LTR even under an RTL locale. */
function rangeStyle(min: number, max: number, value: number): React.CSSProperties {
  const span = Math.max(1, max - min);
  const pct = Math.min(100, Math.max(0, ((value - min) / span) * 100));
  return {
    background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-surface-3) ${pct}%)`,
  };
}

export function CustomPlan() {
  const { t } = useTranslation();
  
  const [concurrent, setConcurrent] = useState(2);
  const [durationMin, setDurationMin] = useState(30);
  const [threads, setThreads] = useState(2000);

  const price = useMemo(
    () => quote(concurrent, durationMin, threads),
    [concurrent, durationMin, threads],
  );

  const sliders = [
    {
      key: "concurrent",
      value: concurrent,
      set: setConcurrent,
      min: 1,
      max: 100,
      step: 1,
      display: String(concurrent),
    },
    {
      key: "duration",
      value: durationMin,
      set: setDurationMin,
      min: 10,
      max: 1440,
      step: 10,
      display: `${durationMin} min`,
    },
    {
      key: "threads",
      value: threads,
      set: setThreads,
      min: 500,
      max: 20000,
      step: 500,
      display: threads.toLocaleString(),
    },
  ] as const;

  return (
    <div
      className="mt-16 overflow-hidden rounded-[14px] border border-line">
      <div
        className="relative px-7 py-9 transition-transform duration-300 ease-out sm:px-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface px-3 py-1 text-2xs font-semibold uppercase tracking-[0.1em] text-accent">
              <Sparkles className="size-3.5" strokeWidth={2} />
              {t("custom.badge")}
            </div>
            <h3 className="font-display mt-5 text-2xl font-semibold text-fg">
              {t("custom.title")}
            </h3>
            <p className="mt-2.5 max-w-[460px] text-base leading-[1.65] text-fg-muted">
              {t("custom.subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-7">
              {sliders.map((s) => (
                <div key={s.key}>
                  <div dir="ltr" className="flex items-baseline justify-between">
                    <label className="text-xs font-medium text-fg-muted">
                      {t(`custom.${s.key}`)}
                    </label>
                    <span className="tabular text-md font-semibold text-fg">
                      {s.display}
                    </span>
                  </div>
                  <input
                    type="range"
                    dir="ltr"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.value}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="supreme-range mt-3 w-full"
                    style={rangeStyle(s.min, s.max, s.value)}
                    aria-label={t(`custom.${s.key}`)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col rounded-[16px] border border-line-strong bg-bg-elevated p-6">
            <span className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
              {t("custom.estimate")}
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="tabular font-display text-4xl font-semibold text-fg">
                {CURRENCY}
                {Math.round(price)}
              </span>
              <span className="text-sm text-fg-muted">{t("pricing.perMonth")}</span>
            </div>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-xs text-fg-muted">
              <Summary row={t("custom.summarySlots", { n: concurrent })} />
              <Summary row={t("custom.summaryRuntime", { n: durationMin })} />
              <Summary row={t("custom.summaryThreads", { n: threads.toLocaleString() })} />
            </ul>

            <a
              href="/register"
              className={cn("mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-[12px]","bg-accent text-base font-semibold text-on-accent","transition-all duration-200 hover:bg-accent-strong",
              )}
            >
              <SlidersHorizontal className="size-4" strokeWidth={2} />
              {t("custom.cta")}
            </a>
            <p className="mt-3 text-center text-2xs leading-[1.55] text-fg-subtle">
              {t("custom.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ row }: { row: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="size-1 shrink-0 rounded-full bg-accent" />
      {row}
    </li>
  );
}
