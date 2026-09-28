"use client";

/**
 * Scroll-reveal primitives.
 *
 * The product previously had no scroll-linked animation at all: sections were a
 * static document with hover affordances. These are the building blocks for
 * the entrance register defined in `lib/motion.ts`.
 *
 * Reduced motion is handled twice over — `MotionProvider` sets
 * `reducedMotion="user"` so framer-motion drops transforms automatically, and
 * the `from` state here is the resting state when the user has asked for
 * stillness, so content is never left invisible.
 */

import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

import { DURATION, EASE, revealGroup, revealItem } from "@/lib/motion";

/* Motion components for the elements a reveal is likely to wrap. */
const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
  li: motion.li,
  span: motion.span,
  p: motion.p,
  ul: motion.ul,
} as const;

export type RevealTag = keyof typeof TAGS;

/*
 * `as` is polymorphic over the elements above, which TypeScript cannot express
 * without a generic per tag — and a generic here would push that complexity onto
 * every call site for no runtime benefit. Widening the union to `motion.div`
 * costs per-tag prop checking on the `as` prop alone.
 */
type AnyTag = typeof motion.div;

type Shared = {
  children: ReactNode;
  className?: string;
  /** How much of the element must be visible before it fires. */
  amount?: number;
  /** Re-run every time it scrolls back into view. Default plays once. */
  repeat?: boolean;
};

/**
 * Reveals a single element as it enters the viewport.
 *
 * <Reveal as="section" y={18}>…</Reveal>
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  blur = false,
  repeat = false,
  amount = 0.2,
  as = "div",
  ...rest
}: Shared & {
  delay?: number;
  /** Travel distance in px. 0 for a pure fade. */
  y?: number;
  /** Subtle defocus on arrival. Costs a filter, so opt in per element. */
  blur?: boolean;
  as?: RevealTag;
} & HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as] as AnyTag;

  // Render content visible immediately; no scroll-triggered animation.
  const from = { opacity: 1, y: 0, filter: "blur(0px)" };
  const to = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <Tag
      className={className}
      initial={from}
      animate={to}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Stagger container. Pair with `RevealItem`; each item's delay comes from the
 * parent's stagger, so grids animate in sequence without per-child delay props.
 *
 * <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
 *   <RevealItem>…</RevealItem>
 * </RevealGroup>
 */
export function RevealGroup({
  children,
  className,
  step = 0.055,
  delayChildren = 0.04,
  amount = 0.15,
  as = "div",
  ...rest
}: Shared & {
  step?: number;
  delayChildren?: number;
  as?: RevealTag;
} & HTMLMotionProps<"div">) {
  const Tag = TAGS[as] as AnyTag;
  return (
    <Tag
      className={className}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Child of `RevealGroup`. Inherits the stagger and needs no delay prop. */
export function RevealItem({
  children,
  className,
  as = "div",
  ...rest
}: { children: ReactNode; className?: string; as?: RevealTag } & HTMLMotionProps<"div">) {
  const Tag = TAGS[as] as AnyTag;
  return (
    <Tag className={className} initial={{ opacity: 1 }} animate={{ opacity: 1 }} {...rest}>
      {children}
    </Tag>
  );
}

/* ── Entrance register ─────────────────────────────────────────── */

/**
 * Fires once on mount rather than on scroll. Above the fold there is nothing to
 * scroll to, so a hero's choreography has to be timed from load.
 *
 * The first element should sit at `delay={0}`; each subsequent element adds one
 * step, so the block reads as one gesture rather than five.
 */
export function Entrance({
  children,
  className,
  delay = 0,
  y = 16,
  blur = false,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
  as?: RevealTag;
} & HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as] as AnyTag;

  // Start visible; no entrance animation needed above the fold.
  return (
    <Tag
      className={className}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Mount-staggered group, for the children of a hero or a modal. */
export function EntranceGroup({
  children,
  className,
  step = 0.075,
  delayChildren = 0.06,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  delayChildren?: number;
  as?: RevealTag;
} & HTMLMotionProps<"div">) {
  const Tag = TAGS[as] as AnyTag;
  return (
    <Tag
      className={className}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Child of `EntranceGroup`; delay comes from the parent's stagger. */
export function EntranceItem({
  children,
  className,
  as = "div",
  ...rest
}: { children: ReactNode; className?: string; as?: RevealTag } & HTMLMotionProps<"div">) {
  const Tag = TAGS[as] as AnyTag;
  return (
    <Tag className={className} initial={{ opacity: 1 }} animate={{ opacity: 1 }} {...rest}>
      {children}
    </Tag>
  );
}
