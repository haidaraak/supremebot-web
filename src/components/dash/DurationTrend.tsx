"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Attack } from "@/lib/types";
import { dayKey } from "@/lib/format";
import { ChartFrame } from "./chart/ChartFrame";

const DAYS = 14;

/**
 * Requested runtime per day. Rather than a total, this plots the *mean*
 * configured duration — it answers "are my tests getting longer", which a sum
 * cannot.
 *
 * Gaps are drawn as gaps. The previous version filtered the empty days out and
 * joined what remained, so a three-day gap with no tests was rendered as a
 * confident straight line across the missing window — a chart asserting data it
 * did not have. Here each contiguous run of days becomes its own path, and the
 * empty days are marked explicitly.
 */
export function DurationTrend({ attacks }: { attacks: Attack[] }) {
  const { t } = useTranslation();

  const { points, mean } = useMemo(() => {
    const today = new Date();
    const days: { key: string; label: string; total: number; n: number; avg: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        key: dayKey(d.toISOString()),
        label: String(d.getDate()),
        total: 0,
        n: 0,
        avg: 0,
      });
    }

    const byKey = new Map(days.map((d) => [d.key, d]));
    let grand = 0;
    let n = 0;
    for (const a of attacks) {
      const bucket = byKey.get(dayKey(a.createdAt));
      if (!bucket) continue;
      bucket.total += a.duration ?? 0;
      bucket.n += 1;
      grand += a.duration ?? 0;
      n += 1;
    }

    for (const d of days) d.avg = d.n ? d.total / d.n : 0;
    return { points: days, mean: n ? grand / n : 0 };
  }, [attacks]);

  const values = useMemo(() => points.map((p) => p.avg), [points]);

  /**
   * Contiguous runs of days that have data, so the line never bridges a gap.
   * Declared above the empty-state return so hook order never changes.
   */
  const runs = useMemo(() => {
    const out: number[][] = [];
    let current: number[] = [];
    points.forEach((p, i) => {
      if (p.n > 0) {
        current.push(i);
      } else if (current.length) {
        out.push(current);
        current = [];
      }
    });
    if (current.length) out.push(current);
    return out;
  }, [points]);

  if (attacks.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-xs text-fg-subtle">
        {t("dash.chartEmpty")}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
            {t("dash.chartDuration")}
          </div>
          <div className="tabular mt-1 text-2xl font-medium text-fg">
            {Math.round(mean)}
            <span className="text-xs font-normal text-fg-muted"> {t("dash.chartDurationUnit")}</span>
          </div>
        </div>
        <span className="text-2xs text-fg-subtle">{t("dash.chartVolumeRange", { n: DAYS })}</span>
      </div>

      <ChartFrame
        values={values}
        formatValue={(v) => `${Math.round(v)}`}
        formatCaption={(i) => points[i]?.key ?? ""}
        ariaLabel={t("dash.chartDurationAria")}
      >
        {({ yFor, xFor, hover }) => {
          const last = points.length - 1;

          return (
            <>
              <defs>
                <linearGradient id="sb-duration-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-fg)" stopOpacity="0.28" />
                  <stop offset="1" stopColor="var(--color-fg)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* One path per contiguous run. A single day gets a dot rather than
                  a degenerate zero-length path. */}
              {runs.map((run, r) => {
                if (run.length === 1) {
                  const i = run[0];
                  return (
                    <circle
                      key={`run-${r}`}
                      cx={xFor(i)}
                      cy={yFor(points[i].avg)}
                      r="2.5"
                      fill="var(--color-fg)"
                    />
                  );
                }
                const d = run
                  .map((i, k) => `${k === 0 ? "M" : "L"} ${xFor(i)} ${yFor(points[i].avg)}`)
                  .join(" ");
                const base = yFor(0);
                return (
                  <g key={`run-${r}`}>
                    <path
                      d={`${d} L ${xFor(run[run.length - 1])} ${base} L ${xFor(run[0])} ${base} Z`}
                      fill="url(#sb-duration-area)"
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--color-fg)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {points.map((p, i) => {
                const isHovered = hover === i;
                const isLast = i === last;

                if (p.n === 0) {
                  // Explicit "no data" tick — a gap, not a zero.
                  return (
                    <g key={p.key}>
                      <rect
                        x={xFor(i) - 1}
                        y={yFor(0) - 1.5}
                        width="2"
                        height="1.5"
                        fill="var(--color-surface-3)"
                        opacity={isHovered ? 1 : 0.75}
                      />
                      {(i % 3 === 0 || isLast) && (
                        <text
                          x={xFor(i)}
                          y={184}
                          textAnchor="middle"
                          className="tabular fill-fg-subtle"
                          fontSize="10"
                        >
                          {p.label}
                        </text>
                      )}
                    </g>
                  );
                }

                return (
                  <g key={p.key}>
                    <circle
                      cx={xFor(i)}
                      cy={yFor(p.avg)}
                      r={isHovered ? 4 : isLast ? 3.5 : 2.5}
                      fill="var(--color-surface)"
                      stroke="var(--color-fg)"
                      strokeWidth="2"
                    >
                      <title>{`${p.key} — ${Math.round(p.avg)} ${t("dash.chartDurationUnit")}`}</title>
                    </circle>
                    {(i % 3 === 0 || isLast) && (
                      <text
                        x={xFor(i)}
                        y={184}
                        textAnchor="middle"
                        className="tabular fill-fg-subtle"
                        fontSize="10"
                      >
                        {p.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          );
        }}
      </ChartFrame>
    </div>
  );
}
