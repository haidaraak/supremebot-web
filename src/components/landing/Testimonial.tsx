"use client";

import { useTranslation } from "react-i18next";
import { Quote } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";

/**
 * One operator statement, standing alone. Deliberately a single voice rather
 * than a three-card testimonial row: the page's authority comes from the
 * telemetry above it, not from a wall of quotes.
 *
 * The quote and its attribution are wrapped in a `<figure>`. A `<figcaption>`
 * outside a figure is invalid HTML, which left the attribution with no
 * programmatic relationship to the quote it credited.
 */
export function Testimonial() {
  const { t } = useTranslation();

  return (
    <section className="relative border-y border-line bg-bg-elevated py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* The container matches every other section so the page's left edge
            never shifts; the reading measure is held on the figure instead,
            because a pull-quote set at 1240px is no longer a pull-quote. */}
        <figure className="m-0 max-w-[54rem]">
          {/* No icon tile: the quotation mark alone is the passage's marker. */}
          <Reveal>
            <Quote className="size-7 text-fg-subtle" strokeWidth={1.4} aria-hidden />
          </Reveal>

          <Reveal delay={0.06}>
            <blockquote className="font-display mt-7 text-balance text-[clamp(1.4rem,3.1vw,2.15rem)] font-medium leading-[1.3] text-fg">
              {t("quote.body")}
            </blockquote>
          </Reveal>

          <Reveal delay={0.12}>
            <figcaption className="mt-8 flex items-center gap-3 border-t border-line pt-6">
              <span
                aria-hidden
                className="font-mono flex size-9 shrink-0 items-center justify-center rounded-[8px] border border-line text-sm text-fg-muted"
              >
                ///
              </span>
              {/*
                The avatar is decorative, so the attribution carries the whole
                identity. Before, both the glyph and the name were
                `aria-hidden` or absent, leaving the quote with no accessible
                author at all.
              */}
              <span className="flex flex-col">
                <span className="text-base font-semibold text-fg">{t("quote.author")}</span>
                <span className="text-xs text-fg-muted">{t("quote.role")}</span>
              </span>
            </figcaption>
          </Reveal>
        </figure>
      </div>
    </section>
  );
}
