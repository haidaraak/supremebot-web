"use client";

import { useTranslation } from "react-i18next";
import { Check, Minus } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { Kicker } from "./Kicker";
import { cn } from "@/lib/cn";

/**
 * Side-by-side capacity comparison. The SupremeBot column carries the real
 * plan limits from /plans; competitor columns are static reference copy, so
 * the comparison cannot drift from what the platform actually sells.
 */
const ROWS = [
  { key: "concurrent", us: true, a: false, b: false },
  { key: "capacity", us: true, a: false, b: true },
  { key: "api", us: true, a: true, b: false },
  { key: "dns", us: true, a: false, b: false },
  { key: "telemetry", us: true, a: true, b: false },
  { key: "drop", us: "0–2%", a: "15–30%", b: "30–45%" },
] as const;

type Cell = boolean | string;

function CellView({ value, emphasis }: { value: Cell; emphasis?: boolean }) {
  if (typeof value === "string")
    return (
      <span
        className={cn("tabular text-xs font-medium",
          emphasis ? "text-accent" : "text-fg-muted",
        )}
      >
        {value}
      </span>
    );
  return value ? (
    <Check
      className={cn("mx-auto size-4", emphasis ? "text-accent" : "text-fg-muted")}
      strokeWidth={2.4}
    />
  ) : (
    <Minus className="mx-auto size-4 text-fg-subtle" strokeWidth={2} />
  );
}

export function Compare() {
  const { t } = useTranslation();

  return (
    <section id="compare" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Kicker index={4}>{t("landing.kicks.compare")}</Kicker>
          <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
            {t("compare.title")}
          </h2>
          <p className="mt-5 text-md leading-[1.65] text-fg-muted">{t("compare.subtitle")}</p>
        </Reveal>

        <Reveal delay={0.06}>
          {/*
            `scope` on the headers is what lets a screen reader associate a
            cell with its row and column; it was missing on all four. The
            SupremeBot column is also marked with a caption, because it is
            distinguished visually by a tint that carries no programmatic
            meaning.
          */}
          <div className="relative mt-14 overflow-x-auto rounded-[18px] border border-line bg-surface transition-[border-color,box-shadow] duration-300 hover:border-line-strong">
            <table className="relative w-full min-w-[640px] border-collapse">
              <caption className="sr-only">
                {t("compare.title")} — {t("compare.subtitle")}
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th
                    scope="col"
                    className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-[0.1em] text-fg-subtle">
                    {t("compare.metric")}
                  </th>
                  <th scope="col" className="bg-surface-2 px-5 py-4 text-center">
                    <span className="font-display text-md font-semibold text-accent">
                      {t("meta.name")}
                    </span>
                  </th>
                  <th scope="col" className="px-5 py-4 text-center text-sm font-medium text-fg-muted">
                    {t("compare.colA")}
                  </th>
                  <th scope="col" className="px-5 py-4 text-center text-sm font-medium text-fg-muted">
                    {t("compare.colB")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.key}
                    className={cn("border-b transition-colors",
                      i === ROWS.length - 1 ? "border-transparent" : "border-line","hover:bg-surface-hover",
                    )}
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 text-start text-sm font-medium text-fg">
                      {t(`compare.row_${row.key}`)}
                    </th>
                    <td className="bg-surface-2 px-5 py-4 text-center">
                      <CellView value={row.us} emphasis />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CellView value={row.a} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CellView value={row.b} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 text-2xs leading-[1.6] text-fg-subtle">{t("compare.fineprint")}</p>
        </Reveal>
      </div>
    </section>
  );
}
