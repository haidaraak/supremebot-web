import { cn } from "@/lib/cn";
import { useId } from "react";

/**
 * SupremeBot mark — original, not derived from any referenced site.
 *
 * Concept: three ascending chevrons (a load curve ramping to its peak) inside
 * a faceted hexagonal seal. The chevrons read as "supreme" — the top tier — and
 * the seal as a hardened core. Drawn from primitives so it stays crisp at any
 * size.
 *
 * Now monochrome: the logo inherits `--color-fg`, so it follows the theme
 * instead of carrying its own palette, and it stops being the one place on the
 * page where the old crimson survived.
 *
 * `useId` namespaces the gradient ids. Rendering two `Wordmark`s (nav + login)
 * previously emitted duplicate DOM ids, so whichever came second silently
 * adopted the first one's gradient.
 */
export function BrandMark({ className, size = 28 }: { className?: string; size?: number }) {
  const uid = useId().replace(/[:]/g, "");
  const sealId = `sb-seal-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={sealId} x1="10" y1="6" x2="54" y2="58">
          <stop offset="0" stopColor="var(--color-fg)" stopOpacity="0.92" />
          <stop offset="1" stopColor="var(--color-fg)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Hex seal — two offset halves give it a cut-gem facet line */}
      <path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" fill={`url(#${sealId})`} />
      <path d="M32 4 L56 18 L32 32 L8 18 Z" fill="var(--color-fg)" opacity="0.08" />
      <path
        d="M32 60 L32 32 M8 18 L32 32 L56 18"
        stroke="var(--color-bg)"
        strokeOpacity="0.28"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* Three ascending chevrons — the ramp to the top tier */}
      <path
        d="M17 41 L32 31 L47 41"
        stroke="var(--color-bg)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d="M17 33 L32 22 L47 33"
        stroke="var(--color-bg)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.72"
      />
      <path
        d="M17 25 L32 13 L47 25"
        stroke="var(--color-bg)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  showMark = true,
  size = 26,
}: {
  className?: string;
  showMark?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && <BrandMark size={size} />}
      <span className="font-display text-lg font-semibold text-fg">SupremeBot</span>
    </span>
  );
}
