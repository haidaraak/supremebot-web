import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Section kicker — the small label that sits above each landing heading.
 *
 * One typographic voice across the page: a monospace label with an index
 * prefix, e.g. `01 · LIVE TELEMETRY`. It is the same shape everywhere so the
 * page reads as a single terminal rather than fifteen sections each inventing
 * its own little header ornament.
 *
 * `index` is optional and rendered as a fixed two-digit slot, which keeps the
 * type aligned as the reader scrolls regardless of label length.
 *
 * When supplied, `index` must equal the section's position in reading order —
 * the order they are composed in `app/page.tsx`. These numbers were once
 * hand-assigned per component and had drifted to `02 · 03 · 01 · 05 · 04 · 08 ·
 * 06 · 07` down the page, which is worse than no numbering at all: it tells the
 * reader the page is in an order it is not in. If you add, remove or reorder a
 * section, renumber the rest.
 */
export function Kicker({
  index,
  children,
  className,
}: {
  /** Optional two-digit slot, e.g. `02`. */
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle",
        className,
      )}
    >
      <span className="text-fg-muted">
        {index !== undefined ? `0${index}` : "//"}
      </span>
      <span className="mx-2 text-fg-subtle">·</span>
      <span>{children}</span>
    </div>
  );
}
