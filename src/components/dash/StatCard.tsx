"use client";

import { cn } from "@/lib/cn";

/**
 * Stat tile. Flat, with a hairline to mark the boundary.
 *
 * Everything that used to make this read as a "raised tile" is gone: the hover
 * lift, the blurred accent orb bleeding in from the corner, the drop shadow on
 * the numeral, and the `translateZ` layering. None of it communicated anything
 * the number and its label did not already say.
 *
 * `accent` now marks a value in inverse ink rather than in colour.
 */
export function StatCard({
  label,
  value,
  sub,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border p-4 transition-colors duration-150 sm:p-5",
        highlight
          ? "border-line-strong bg-surface"
          : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <div className="text-2xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
        {label}
      </div>
      <div
        className={cn(
          "tabular mt-2 text-2xl font-medium",
          accent ? "text-fg" : "text-fg-muted",
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-2xs text-fg-subtle">{sub}</div>}
    </div>
  );
}
