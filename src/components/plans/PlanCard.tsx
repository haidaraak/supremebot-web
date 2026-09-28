"use client";

import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Check } from "lucide-react";

import type { Plan } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * The capacity a plan sells, in the user's own words.
 *
 * The first three perks are derived from the limits rather than trusted from
 * whatever `features` string the backend sends, so the card can never promise
 * more than the plan actually grants — a plan claiming 10 slots while granting
 * one is a card the product cannot honour.
 *
 * `features` entries are resolved as translation keys first. A backend that
 * sends its own prose still renders, unchanged, because the key lookup misses
 * and the raw string is returned; that is what keeps a live catalogue from
 * blanking the cards while the fallback ladder is translated.
 */
export function planPerks(plan: Plan, t: TFunction) {
  return [
    t("pricing.perkSlots", { n: plan.maxConcurrent }),
    t("pricing.perkRuntime", { n: Math.round(plan.maxDuration / 60) }),
  ];
}

function featurePerks(plan: Plan, t: TFunction) {
  return (plan.features ?? []).map((f) => t(`pricing.perk_${f}`, { defaultValue: f }));
}

/**
 * Pointer-tracked 3D plan card. Tilt is capped and the layers are stacked with
 * translateZ so the price and headline lift clear of the surface; the card
 * itself stays readable because the rotation is small.
 */
export function PlanCard({
  plan,
  featured,
  current,
  href,
  onSelect,
  selectLabel,
}: {
  plan: Plan;
  featured: boolean;
  current?: boolean;
  /** Renders the footer as a link to this path (landing pages — crawlable). */
  href?: string;
  /** Renders the footer as a button that calls this handler. */
  onSelect?: () => void;
  /** Overrides the default CTA label. */
  selectLabel?: string;
}) {
  const { t } = useTranslation();
  
  const price = Number(plan.price);

  // The featured tier is marked by a stronger border, not by a gradient fill
  // or glow. Nothing here is filled with colour.
  const shared = cn(
    "group relative flex flex-col rounded-[14px] border p-7 transition-colors duration-200",
    featured
      ? "border-line-strong bg-surface hover:border-fg-subtle"
      : "border-line bg-surface hover:border-line-strong",
  );

  const inner = (
    <>
      {(featured || current) && (
        <span
          className={cn(
            "absolute -top-3 start-7 inline-flex h-6 items-center rounded-full px-3 text-2xs font-semibold",
            current
              ? "border border-line bg-surface-2 text-fg-muted"
              : "bg-accent text-on-accent",
          )}
        >
          {current ? t("pricing.currentPlan") : t("pricing.popular")}
        </span>
      )}

      <h3 className="font-display text-xl font-semibold text-fg">{plan.name}</h3>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="tabular text-3xl font-semibold text-fg">
          ${Number.isFinite(price) ? price.toFixed(0) : plan.price}
        </span>
        <span className="text-sm text-fg-muted">{t("pricing.perMonth")}</span>
      </div>
      <div className="mt-1 text-xs text-fg-subtle">{t("pricing.billedMonthly")}</div>

      <div className="my-6 h-px bg-line" />

      <ul className="flex flex-1 flex-col gap-3">
        {planPerks(plan, t).slice(0, 2).map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm text-fg-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.2} />
            {perk}
          </li>
        ))}
        {featurePerks(plan, t).slice(0, 1).map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm text-fg-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.2} />
            {perk}
          </li>
        ))}
      </ul>

      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          className={cn("mt-8 inline-flex h-11 w-full items-center justify-center rounded-[12px] text-sm font-semibold transition-all duration-200",
            featured
              ? "bg-accent text-on-accent hover:bg-accent-strong"
              : "border border-line-strong bg-surface-hover text-fg hover:bg-surface-2",
          )}
        >
          {selectLabel ?? t("pricing.choose")}
        </button>
      ) : href ? (
        /* The whole card is the link (see the wrapper below), so the footer CTA
           is a span rather than a nested anchor — nested interactive elements
           are invalid and screen readers announce them as a single control. */
        <span
          aria-hidden
          className={cn("mt-8 inline-flex h-11 w-full items-center justify-center rounded-[12px] text-sm font-semibold transition-all duration-200",
            featured
              ? "bg-accent text-on-accent group-hover:bg-accent-strong"
              : "border border-line-strong bg-surface-hover text-fg group-hover:bg-surface-2",
          )}
        >
          {selectLabel ?? t("pricing.choose")}
        </span>
      ) : null}
    </>
  );

  /* Interactive: the footer calls back. No tilt — see remove-tilt.js. */
  if (onSelect) {
    return (
      <div className={shared}>
        {inner}
      </div>
    );
  }

  /*
   * Linked (the landing page). Previously this fell through to the read-only
   * branch below, which applied `[&>*]:pointer-events-none` — the `<a>` in
   * `inner` is a direct child, so every "Choose plan" button on the landing
   * page was unclickable. Making the card itself the link is also the stronger
   * pattern: one target instead of a small one, and a single accessible name.
   */
  if (href) {
    return (
      <a
        href={href}
        className={cn(shared, "cursor-pointer", featured && "hover:border-line-strong")}
      >
        {inner}
      </a>
    );
  }

  /* Read-only — the dashboard plans page shows the tiers without offering one. */
  return (
    <div className={shared}>
      {inner}
    </div>
  );
}
