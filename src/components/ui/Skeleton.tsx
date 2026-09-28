/**
 * Loading placeholders.
 *
 * The app had no route-level loading boundaries, so most surfaces jumped from
 * nothing straight to content — and the dashboard overview, which suspends on
 * `useSearchParams`, rendered a blank screen for the duration. These shapes
 * mirror the real layouts closely enough that content arriving does not shift
 * the page under the reader.
 *
 * Motion is handled by `.skeleton` in globals.css, which is already disabled
 * under `prefers-reduced-motion`.
 */

import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden />;
}

/** A stat card sized like the dashboard's 4-up strip. */
export function SkeletonStatCard() {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-5">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-4 h-2 w-16" />
    </div>
  );
}

/** A panel with a heading rule and body lines, used for chart and list cards. */
export function SkeletonPanel({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-[16px] border border-line bg-surface p-6", className)}
      aria-hidden
    >
      <Skeleton className="h-3 w-32" />
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={cn("h-2.5", i % 3 === 2 ? "w-2/5" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

/** A row shaped like `AttackTable`'s. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5" aria-hidden>
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <Skeleton className="h-2.5 flex-1" />
      <Skeleton className="hidden h-2.5 w-24 sm:block" />
      <Skeleton className="hidden h-2.5 w-16 md:block" />
      <Skeleton className="h-2.5 w-20 shrink-0" />
    </div>
  );
}

/**
 * Announces to assistive tech that a region is loading. The visual shapes are
 * `aria-hidden`, so this is the only thing a screen reader hears.
 */
export function SkeletonRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
