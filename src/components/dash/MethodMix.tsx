"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Attack } from "@/lib/types";
import { compactNumber } from "@/lib/format";
import { inferLayerByName, type Layer } from "@/lib/layer";
import { cn } from "@/lib/cn";

const MAX_ROWS = 8;

/**
 * Which methods get used, and how often. L7 bars use the accent and L4 bars
 * use the info token — the same pairing as the launch tabs, so the chart and
 * the form read as one system.
 */
export function MethodMix({ attacks }: { attacks: Attack[] }) {
  const { t } = useTranslation();

  const rows = useMemo(() => {
    const map = new Map<string, { count: number; packets: number }>();
    for (const a of attacks) {
      const row = map.get(a.method) ?? { count: 0, packets: 0 };
      row.count += 1;
      row.packets += a.packetsSent ?? 0;
      map.set(a.method, row);
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v, layer: inferLayerByName(name) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_ROWS);
  }, [attacks]);

  const max = Math.max(1, ...rows.map((r) => r.count));

  if (rows.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-xs text-fg-subtle">
        {t("dash.chartEmpty")}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
          {t("dash.chartMethods")}
        </div>
        <div className="flex items-center gap-3 text-2xs text-fg-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent" />
            {t("launch.layer7")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-info" />
            {t("launch.layer4")}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="tabular truncate font-medium text-fg">
                {r.name}
              </span>
              <span className="tabular shrink-0 text-fg-subtle">
                {r.count} · {compactNumber(r.packets)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  r.layer === 4
                    ? "bg-gradient-to-r from-fg-subtle to-fg"
                    : "bg-gradient-to-r from-fg-subtle to-fg",
                )}
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
