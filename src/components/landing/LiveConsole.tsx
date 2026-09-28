"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useReducedMotion } from "@/lib/useReducedMotion";

/* Seed shape for the sparkline — rising load curve with realistic noise */
const SEED = [142, 138, 140, 124, 128, 110, 117, 90, 99, 71, 78, 62, 68, 44, 52, 34, 48, 37, 43, 25, 32, 20, 29, 17, 23, 14, 18, 10];
const W = 640;
const H = 170;

function pathFrom(values: number[]) {
  const step = W / (values.length - 1);
  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${v.toFixed(1)}`)
    .join(" ");
  return {
    line,
    fill: `${line} L${W} ${H} L0 ${H} Z`,
  };
}

export function LiveConsole() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  // Re-shape the curve on an interval so the preview feels live, not looping.
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((v) => v + 1), 2200);
    return () => window.clearInterval(id);
  }, [reduced]);

  const values = SEED.map((v, i) => {
    const wobble = reduced
      ? 0
      : Math.sin(tick * 0.9 + i * 0.7) * 7 + Math.sin(tick * 0.37 + i * 0.31) * 5;
    return Math.max(6, Math.min(158, v + wobble));
  });
  const { line, fill } = pathFrom(values);

  const throughput = reduced
    ? 8.42
    : 8.42 + Math.sin(tick * 0.6) * 0.34 + Math.sin(tick * 1.7) * 0.12;
  const latency = reduced ? 46 : 46 + Math.round(Math.sin(tick * 0.8) * 4);
  const success = reduced ? 99.98 : 99.98 - Math.abs(Math.sin(tick * 0.5)) * 0.03;

  return (
    <div className="pointer-events-none relative w-full max-w-[520px] overflow-hidden rounded-[20px] border border-line-strong bg-glass backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-[9px] bg-accent/12 text-accent">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12h4.5l1.5 -6l4 12l2 -9l1.5 3h4.5" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-fg">{t("console.title")}</span>
          <span className="tabular text-2xs text-fg-subtle">#SB-8421</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-ok">
          <span className="pulse-dot size-1.5 rounded-full bg-ok text-ok" />
          {t("console.status")}
        </span>
      </div>

      <div className="flex items-center gap-2.5 px-5 py-3">
        <span className="text-2xs uppercase tracking-wider text-fg-subtle">
          {t("console.target")}
        </span>
        <strong className="tabular truncate text-sm font-medium text-fg">api.example.com</strong>
        <code className="rounded-md bg-surface-3 px-1.5 py-0.5 text-2xs text-fg-muted">HTTPS</code>
      </div>

      {/* Three fixed metric columns get cramped on a 375px phone, so the gutter
          tightens rather than the columns reflowing under each other. */}
      <div className="grid grid-cols-3 gap-px border-y border-line bg-line">
        {[
          { label: t("console.throughput"), val: throughput.toFixed(2), unit: "M", sub: "req/s" },
          { label: t("console.latency"), val: String(latency), unit: "ms", sub: "p95" },
          { label: t("console.success"), val: success.toFixed(2), unit: "%", sub: "2xx" },
        ].map((m) => (
          <div key={m.label} className="min-w-0 bg-surface px-3 py-3.5 sm:px-5">
            <div className="truncate text-2xs uppercase tracking-wider text-fg-subtle">
              {m.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="tabular text-xl font-medium text-fg sm:text-2xl">{m.val}</span>
              <span className="text-2xs text-fg-muted">{m.unit}</span>
            </div>
            <div className="text-2xs text-fg-subtle">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-2xs text-fg-subtle">
          <span>{t("console.reqVolume")}</span>
          <span>{t("console.last60")}</span>
        </div>
        {/*
          `preserveAspectRatio="none"` is kept deliberately: there is no text in
          this SVG, and stretching the viewBox is what lets the sparkline fill
          the panel at any width. `vectorEffect="non-scaling-stroke"` is what
          keeps the 2px line from being stretched out of round by that scaling.
        */}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[110px] w-full" aria-hidden>
          <defs>
            <linearGradient id="sb-console-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.3" />
              <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[32, 85, 138].map((y) => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="var(--grid-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={fill} fill="url(#sb-console-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line px-5 py-3 text-2xs text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-ok" />
          12 {t("console.nodes")}
        </span>
        <span className="tabular">
          {t("console.elapsed")} 04:18
        </span>
        <span className="tabular">
          {t("console.remaining")} 05:42
        </span>
      </div>
    </div>
  );
}
