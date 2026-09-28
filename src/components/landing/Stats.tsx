"use client";

import { useTranslation } from "react-i18next";

import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const STATS = [
  { key: "uptime", value: "99.90%" },
  { key: "throughput", value: "10M+" },
  { key: "latency", value: "<50ms" },
  { key: "support", value: "24/7" },
] as const;

export function Stats() {
  const { t } = useTranslation();
  return (
    <section className="relative border-b border-line bg-bg">
      <RevealGroup
        className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-line sm:grid-cols-4"
        step={0.07}
      >
        {STATS.map((s) => (
          <RevealItem key={s.key} className="px-6 py-9 text-center sm:py-11">
            <div className="font-display text-display-sm font-semibold text-fg">{s.value}</div>
            <div className="mt-1.5 text-xs text-fg-muted">{t(`stats.${s.key}`)}</div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
