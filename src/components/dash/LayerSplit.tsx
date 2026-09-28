"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Attack } from "@/lib/types";
import { compactNumber } from "@/lib/format";
import { inferLayerByName, type Layer } from "@/lib/layer";

const R = 52;
const CIRC = 2 * Math.PI * R;
const SIZE = 140;

/**
 * How traffic splits between transport and application. The two arcs share one
 * ring so their relative length is the ratio itself — no second axis to read.
 */
export function LayerSplit({ attacks }: { attacks: Attack[] }) {
  const { t } = useTranslation();

  const { l4, l7, total } = useMemo(() => {
    let l4 = 0;
    let l7 = 0;
    for (const a of attacks) {
      if (inferLayerByName(a.method) === 4) l4 += a.packetsSent ?? 0;
      else l7 += a.packetsSent ?? 0;
    }
    return { l4, l7, total: l4 + l7 };
  }, [attacks]);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-xs text-fg-subtle">
        {t("dash.chartEmpty")}
      </div>
    );
  }

  const share = (v: number) => (total ? v / total : 0);
  const l7Arc = share(l7) * CIRC;
  const l4Arc = share(l4) * CIRC;

  const rows: { layer: Layer; packets: number; color: string; label: string }[] = [
    { layer: 7, packets: l7, color: "var(--color-fg)", label: t("launch.layer7") },
    { layer: 4, packets: l4, color: "var(--color-fg-subtle)", label: t("launch.layer4") },
  ];

  return (
    <div>
      <div className="mb-4 text-2xs uppercase tracking-[0.1em] text-fg-subtle">
        {t("dash.chartLayerSplit")}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative size-[140px] shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="size-[140px] -rotate-90"
            role="img"
            aria-label={t("dash.chartLayerSplitAria")}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="var(--color-surface-3)"
              strokeWidth="14"
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="var(--color-fg)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${l7Arc} ${CIRC}`}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="var(--color-fg-subtle)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${l4Arc} ${CIRC}`}
              strokeDashoffset={-l7Arc}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-xl font-medium text-fg">
              {compactNumber(total)}
            </span>
            <span className="text-2xs text-fg-subtle">
              {t("dash.chartVolumeUnit")}
            </span>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-3.5">
          {rows.map((r) => (
            <li key={r.layer} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-2 text-fg">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  {r.label}
                </span>
                <span className="tabular text-fg-subtle">
                  {Math.round(share(r.packets) * 100)}%
                </span>
              </div>
              <div className="tabular text-2xs text-fg-subtle">
                {compactNumber(r.packets)} {t("dash.chartVolumeUnit")}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
