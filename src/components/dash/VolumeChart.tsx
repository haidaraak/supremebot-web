"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Attack } from "@/lib/types";
import { compactNumber, dayKey } from "@/lib/format";
import { ChartFrame } from "./chart/ChartFrame";

const DAYS = 14;

/**
 * Daily packet volume, bucketed from real test telemetry. The axis is the last
 * DAYS calendar days, so empty days read as quiet days rather than disappearing
 * — that is what makes the chart trustworthy at a glance.
 *
 * Drawn through `ChartFrame`, which measures the container and adds the labelled
 * value axis and hover readout this chart previously lacked.
 */
export function VolumeChart({ attacks }: { attacks: Attack[] }) {
  const { t } = useTranslation();

  const { buckets, total } = useMemo(() => {
    const today = new Date();
    const days: { key: string; label: string; packets: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ key: dayKey(d.toISOString()), label: String(d.getDate()), packets: 0 });
    }

    const byKey = new Map(days.map((d) => [d.key, d]));
    let total = 0;
    for (const a of attacks) {
      const bucket = byKey.get(dayKey(a.createdAt));
      if (bucket) {
        bucket.packets += a.packetsSent ?? 0;
        total += a.packetsSent ?? 0;
      }
    }
    return { buckets: days, total };
  }, [attacks]);

  const values = useMemo(() => buckets.map((b) => b.packets), [buckets]);

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
            {t("dash.chartVolume")}
          </div>
          <div className="tabular mt-1 text-2xl font-medium text-fg">
            {compactNumber(total)}{" "}
            <span className="text-xs font-normal text-fg-muted">
              {t("dash.chartVolumeUnit")}
            </span>
          </div>
        </div>
        <span className="text-2xs text-fg-subtle">
          {t("dash.chartVolumeRange", { n: DAYS })}
        </span>
      </div>

      <ChartFrame
        values={values}
        formatValue={compactNumber}
        formatCaption={(i) => buckets[i]?.key ?? ""}
        ariaLabel={t("dash.chartVolumeAria")}
      >
        {({ yFor, xFor, hover, values: data }) => {
          const barWidth = Math.max(3, (xFor(1) - xFor(0)) * 0.62 || 8);
          const last = data.length - 1;

          return (
            <>
              <defs>
                {/* Namespaced per-instance: the old id was global, so two charts
                    on one page resolved to whichever gradient came first. */}
                <linearGradient id="sb-volume-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-fg)" stopOpacity="0.95" />
                  <stop offset="1" stopColor="var(--color-fg-subtle)" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {buckets.map((b, i) => {
                const empty = b.packets === 0;
                // Zero days get a baseline tick so the axis still reads.
                const top = empty ? yFor(0) - 1.5 : yFor(b.packets);
                const height = empty ? 1.5 : Math.max(3, yFor(0) - yFor(b.packets));
                const isHovered = hover === i;

                return (
                  <g key={b.key}>
                    <rect
                      x={xFor(i) - barWidth / 2}
                      y={top}
                      width={barWidth}
                      height={height}
                      rx="2.5"
                      fill={empty ? "var(--color-surface-3)" : "url(#sb-volume-bar)"}
                      opacity={empty ? 1 : isHovered ? 1 : i === last ? 1 : 0.8}
                    >
                      <title>
                        {`${b.key} — ${compactNumber(b.packets)} ${t("dash.chartVolumeUnit")}`}
                      </title>
                    </rect>

                    {/* Every third day plus the last, so labels never collide. */}
                    {(i % 3 === 0 || i === last) && (
                      <text
                        x={xFor(i)}
                        y={184}
                        textAnchor="middle"
                        className="tabular fill-fg-subtle"
                        fontSize="10"
                      >
                        {b.label}
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
