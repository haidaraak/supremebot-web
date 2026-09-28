"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Sets framer-motion's global reduced-motion policy to `user`, which means it
 * drops transform and layout animations for anyone who has asked their OS for
 * reduced motion — while still allowing opacity to animate, so content never
 * appears abruptly.
 *
 * This is why the individual components do not each need their own
 * `useReducedMotion` check.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
