"use client";

import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";

export function Cta() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden py-28 sm:py-40">
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal
          blur
          y={22}
          className="relative overflow-hidden rounded-[14px] border border-line bg-surface px-8 py-20 text-center sm:px-16 sm:py-24">
          <div className="relative">
            <h2 className="font-display mx-auto max-w-2xl text-balance text-[clamp(1.9rem,4.6vw,3.2rem)] font-semibold leading-[1.04] text-fg">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-md leading-[1.65] text-fg-muted">
              {t("cta.subtitle")}
            </p>
            <a
              href="/login"
              className="group mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-accent px-7 text-md font-medium text-on-accent transition-colors duration-150 hover:bg-accent-strong"
            >
              {t("cta.button")}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
