"use client";

import { useTranslation } from "react-i18next";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Kicker } from "./Kicker";

const STEP_KEYS = ["s1", "s2", "s3"] as const;

export function Steps() {
  const { t } = useTranslation();

  return (
    <section id="steps" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Kicker index={2}>{t("landing.kicks.steps")}</Kicker>
          <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
            {t("steps.title")}
          </h2>
          <p className="mt-5 text-md leading-[1.65] text-fg-muted">{t("steps.subtitle")}</p>
        </Reveal>

        {/* The hairline grid is the `gap-px` on the surface colour trick, so the
            stagger container has to be the grid itself. */}
        <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-[12px] border border-line bg-line md:grid-cols-3">
          {STEP_KEYS.map((s, i) => (
            <RevealItem
              key={s}
              className="group relative bg-surface p-7 transition-colors duration-300 hover:bg-surface-2 sm:p-8"
            >
              <div className="font-mono text-2xs text-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold text-fg">
                {t(`steps.${s}Title`)}
              </h3>
              <p className="mt-3 text-md leading-[1.65] text-fg-muted">{t(`steps.${s}Desc`)}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
