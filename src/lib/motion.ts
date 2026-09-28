/**
 * Motion vocabulary.
 *
 * The whole product animates from this file, which is the point: when every
 * entrance shares one easing, one travel distance and one duration, unrelated
 * sections feel like one designed surface. When each component picks its own
 * numbers, the page feels assembled. So the vocabulary is deliberately small —
 * three registers, nothing else:
 *
 *   entrance    scroll-triggered reveal. One easing, one distance, one duration.
 *   interaction springs. Anything the pointer touches.
 *   ambient     continuous loops (3D, pulse, ). Deliberately slow.
 *
 * Values are duplicated from the `--ease-*` / duration tokens in globals.css
 * so the CSS and JS halves of a transition cannot drift apart.
 */

import type { Transition, Variants } from "framer-motion";

/** Matches `--ease-out-quint` and `--ease-in-out-quart` in globals.css. */
export const EASE = {
  outQuint: [0.22, 1, 0.36, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  outBack: [0.34, 1.56, 0.64, 1],
} as const;

/** For anything the pointer touches. Springs settle; tweens slide. */
export const SPRING = {
  /** Presses, toggles, chip selection — 2% scale, near-instant. */
  snappy: { type: "spring", stiffness: 420, damping: 34, mass: 0.7 },
  /** Panels, drawers, popovers — has some travel. */
  smooth: { type: "spring", stiffness: 220, damping: 30, mass: 1 },
  /** Layout shifts and large reflows. */
  gentle: { type: "spring", stiffness: 120, damping: 22, mass: 1.1 },
} as const;

export const DURATION = {
  instant: 0.12,
  quick: 0.2,
  base: 0.32,
  slow: 0.52,
  /** The single entrance duration. Do not vary it per component. */
  entrance: 0.62,
} as const;

export const DISTANCE = {
  /** How far an element travels as it arrives. */
  rise: 16,
  scale: 0.97,
} as const;

/**
 * framer-motion dropped its `stagger` helper in v13, and the hand-rolled version
 * is clearer anyway: the delay is a function of the child's index.
 */
export const stagger = (index: number, step = 0.055) => index * step;

const entrance = (delay = 0): Transition => ({
  duration: DURATION.entrance,
  ease: EASE.outQuint,
  delay,
});

/* ── Entrance variants ───────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: DISTANCE.rise },
  show: { transition: entrance() },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { transition: entrance() },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: DISTANCE.scale },
  show: { transition: entrance() },
};

/** For elements that arrive from the inline axis — matches the RTL flip. */
export const fadeStart: Variants = {
  hidden: { opacity: 0, x: -DISTANCE.rise },
  show: { transition: entrance() },
};

/**
 * A staggered container. Children using `revealItem` read their delay from
 * this, so a grid of cards animates in sequence without any per-card delay prop.
 */
export const revealGroup = (step = 0.055, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: step, delayChildren },
  },
});

export const revealItem: Variants = {
  hidden: { opacity: 0, y: DISTANCE.rise },
  show: { transition: { duration: DURATION.entrance, ease: EASE.outQuint } },
};

/* ── Interaction transitions ─────────────────────────────────── */

/** Press feedback. Same spring as `SPRING.snappy`, named for intent. */
export const press: Transition = SPRING.snappy;
