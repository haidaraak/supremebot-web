"use client";

import { forwardRef } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * Single definition for every action in the app.
 *
 * Three corrections worth naming:
 *
 * 1. It now renders as a link when `href` is present (plain `<a>` for an
 *    external/section target, `<Link>` for an in-app route). Until now the
 *    component could only emit a `<button>`, so each primary CTA — nav, hero,
 *    CTA block, account — had a hand-typed `className` copy of these exact
 *    styles, which drifted.
 *
 * 2. The focus ring was `outline-[rgba(var(--rgb-accent),)]`, an invalid
 *    declaration — the channel list had an empty alpha slot, so the browser
 *    dropped it and **no button ever showed a focus outline**. It now uses the
 *    `--focus` token like every other control.
 *
 * 3. `danger` was raw palette colours (`bg-red-500/12`), the one place still
 *    bypassing the themed state ramp after the move to monochrome.
 *
 * `prefers-reduced-motion` already neutralises the transition and the press
 * scale globally in globals.css.
 */

type Variant = "primary" | "outline" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

const BASE = [
  "relative inline-flex items-center justify-center whitespace-nowrap",
  "rounded-[10px] font-medium transition-colors duration-150",
  // Focus ring from globals.css (`:focus-visible { outline: 1px solid var(--focus) }`).
  "disabled:pointer-events-none disabled:opacity-40",
  // Press feedback; reduced-motion in globals.css pins this to normal.
  "active:scale-[0.985]",
];

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent font-medium hover:bg-accent-strong",
  outline: "border border-line text-fg hover:border-line-strong",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  subtle: "border border-line bg-surface-2 text-fg hover:bg-surface-3",
  danger: "border border-bad/40 bg-bad/10 text-bad hover:bg-bad/15",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-6 text-md",
};

type ButtonOwn = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Block fills the width of its container. */
  block?: boolean;
  children?: React.ReactNode;
  /** Render as an anchor (`href`) or Link (`route`) instead of a `<button>`. */
  href?: string;
  route?: string;
  /** Pass `true` on icon-only buttons that have visible text as a sibling. */
  icon?: boolean;
};

type ButtonProps = ButtonOwn &
  Omit<React.ComponentPropsWithoutRef<"button">, "href"> &
  Omit<React.ComponentPropsWithoutRef<"a">, "href">;

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    block = false,
    icon = false,
    href,
    route,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  const classes = cn(
    BASE.join(" "),
    VARIANTS[variant],
    SIZES[size],
    block && "w-full",
    icon && "px-0 w-10",
  );

  const content = (
    <>
      {loading && (
        <span
          aria-hidden
          className="size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
        />
      )}
      {children}
    </>
  );

  // An in-app navigation: client-side.
  if (route) {
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} href={route} className={cn(classes, className)} {...rest}>
        {content}
      </Link>
    );
  }

  // A URL or section target: plain anchor.
  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={cn(classes, className)} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? "button"}
      disabled={disabled || loading}
      className={cn(classes, className)}
      {...rest}
    >
      {content}
    </button>
  );
});
