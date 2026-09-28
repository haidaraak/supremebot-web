"use client";

import { useTranslation } from "react-i18next";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Kicker } from "./Kicker";

/*
 * No icon tiles. Each card previously opened with a bordered, filled square
 * holding a decorative glyph — a frame inside a frame, contributing nothing
 * the heading did not already say. Minimalism removes the frame and lets the
 * type do the work.
 *
 * No lift on hover either. A border change is enough of an affordance.
 */
const FEATURES = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;

export function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="relative border-y border-line py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-xl">
          <Kicker index={3}>{t("landing.kicks.features")}</Kicker>
          <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
            {t("features.title")}
          </h2>
          <p className="mt-5 text-md leading-[1.7] text-fg-muted">{t("features.subtitle")}</p>
        </Reveal>

        <RevealGroup
          className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          step={0.05}
        >
          {FEATURES.map((key, i) => (
            <RevealItem key={key} className="border-t border-line pt-6">
              <div className="font-mono text-2xs text-fg-subtle">
                0{String(i + 1)}
              </div>
              <h3 className="font-display mt-3 text-md font-semibold text-fg">
                {t(`features.${key}Title`)}
              </h3>
              <p className="mt-2.5 text-sm leading-[1.7] text-fg-muted">
                {t(`features.${key}Desc`)}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
