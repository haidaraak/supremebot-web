"use client";

import { useTranslation } from "react-i18next";

import { Reveal } from "@/components/motion/Reveal";
import { Kicker } from "./Kicker";
import { LiveConsole } from "./LiveConsole";

/**
 * The live console section.
 *
 * This used to be a duplicate. Its heading and body were pulled straight from
 * `features.f2Title` / `features.f2Desc`, so the page said the same sentence
 * twice: once as a section and once as capability 02 in the grid below it — and
 * the section's own kicker ("Live telemetry") was a third pass at the same
 * idea. Two sections arguing one point is worse than one, because the reader
 * has to work out why it was said again.
 *
 * It has its own copy now, and it is about the thing this section actually
 * shows: the console running beside you while a test is in flight. The console
 * reports four numbers and two clocks; the copy says so, rather than describing
 * monitoring in the abstract and leaving the reader to work out what they are
 * about to be looking at.
 */
export function ConsoleSection() {
  const { t } = useTranslation();

  return (
    <section
      id="telemetry"
      className="relative overflow-hidden border-b border-line bg-bg-elevated py-28 sm:py-40"
    >
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="max-w-md">
            <Kicker index={1}>{t("landing.kicks.console")}</Kicker>
            <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
              {t("landing.console.title")}
            </h2>
            <p className="mt-5 text-md leading-[1.7] text-fg-muted">
              {t("landing.console.subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="flex justify-center lg:justify-end">
          <LiveConsole />
        </div>
      </div>
    </section>
  );
}
