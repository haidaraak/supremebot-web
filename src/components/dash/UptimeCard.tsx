"use client";

import { useTranslation } from "react-i18next";

function UptimeDonut({ value, label }: { value: number; label: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (value / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative size-20">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="transition-[stroke-dasharray] duration-700"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="tabular text-2xl font-semibold text-fg">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs text-fg-subtle">{label}</span>
    </div>
  );
}

export function UptimeCard() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <div className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
          {t("dash.chartUptime")}
        </div>
        <div className="tabular mt-1 text-2xl font-medium text-fg">
          99.90%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <UptimeDonut value={99} label="L4" />
        <UptimeDonut value={99.9} label="Avg" />
        <UptimeDonut value={99.99} label="L7" />
      </div>
    </div>
  );
}
