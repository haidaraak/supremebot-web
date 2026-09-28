"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";

import type { Plan, User } from "@/lib/types";
import { maxConcurrentOf, maxDurationOf, maxThreadsOf } from "@/lib/types";

/**
 * The tier you already hold, with the three limits that define it. Read-only by
 * design — upgrading is a billing action the backend owns, so this panel states
 * the facts instead of impersonating a checkout.
 *
 * Simplified for the minimal regime: no gradient wash, no blurred accent orb
 * bleeding in from the corner, and no `translateZ` layer per value. The three
 * limits were previously stacked at different depths to fake dimensionality;
 * they are now simply three numbers on a flat panel.
 */
export function CurrentPlanPanel({ plan, user }: { plan: Plan; user?: User | null }) {
  const { t } = useTranslation();

  const limits = [
    { label: t("dash.slots"), value: `${maxConcurrentOf(user)}`, unit: t("pricing.concurrent") },
    {
      label: t("dash.maxDuration"),
      value: `${Math.round(maxDurationOf(user) / 60)}`,
      unit: t("dash.chartDurationUnit") === "s" ? "min" : t("dash.chartDurationUnit"),
    },
    { label: t("dash.maxThreads"), value: maxThreadsOf(user).toLocaleString(), unit: "" },
  ];

  return (
    <div className="rounded-[14px] border border-line bg-surface p-6 sm:p-7">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-2xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            {t("pricing.currentPlan")}
          </div>
          <h2 className="font-display mt-3 text-2xl font-semibold text-fg sm:text-3xl">
            {plan.name}
          </h2>
          <p className="mt-1.5 text-sm text-fg-muted">{t("pricing.billedMonthly")}</p>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:gap-9">
          {limits.map((l) => (
            <div key={l.label}>
              <div className="text-2xs uppercase tracking-[0.12em] text-fg-subtle">
                {l.label}
              </div>
              <div className="tabular mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-fg">{l.value}</span>
                {l.unit && <span className="text-2xs text-fg-subtle">{l.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/launch"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-[10px] bg-accent px-5 text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-strong"
        >
          {t("launch.title")}
        </Link>
      </div>
    </div>
  );
}
