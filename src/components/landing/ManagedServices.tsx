"use client";

import { useTranslation } from "react-i18next";
import { Crosshair, Send, Check } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { Kicker } from "./Kicker";

/**
 * Manually-delivered assessment services.
 *
 * Origin discovery is real work for an authorised operator: it answers "which
 * of my boxes actually fronts this name". So the scope guardrails are in the
 * component itself, not a footnote — own or written-authorisation targets
 * only, passive sources only, and the static-site caveat stated up front so
 * nobody buys a lookup that has no answer.
 */
const TELEGRAM = "https://t.me/supremec2";

export function ManagedServices() {
  const { t } = useTranslation();

  const included = [t("services.originB1"), t("services.originB2"), t("services.originB3")];

  return (
    <section id="services" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Kicker index={6}>{t("services.eyebrow")}</Kicker>
          <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
            {t("services.title")}
          </h2>
          <p className="mt-5 text-md leading-[1.65] text-fg-muted">{t("services.subtitle")}</p>
        </Reveal>

        <Reveal delay={0.06} y={22}>
          <div className="relative mt-12 overflow-hidden rounded-[20px] border border-line-strong bg-surface">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
              {/* Left: what it is */}
              <div className="relative p-7 sm:p-9 lg:border-r lg:border-line">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-[12px] border border-accent/30 bg-[rgba(var(--rgb-accent),0.09)]">
                    <Crosshair className="size-5 text-accent" strokeWidth={1.8} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-2xs font-semibold uppercase tracking-[0.1em] text-fg-subtle">
                      {t("services.originName")}
                    </span>
                    <span className="font-display text-2xl font-semibold leading-tight text-accent">
                      {t("services.originPrice")}
                    </span>
                  </div>
                </div>

                <h3 className="mt-7 text-lg font-semibold leading-snug text-fg">
                  {t("services.originHeadline")}
                </h3>
                <p className="mt-4 text-md leading-[1.7] text-fg-muted">
                  {t("services.originDesc")}
                </p>

                <div className="mt-6 flex items-start gap-2 rounded-[12px] border border-line bg-surface-2 px-3.5 py-3">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <p className="text-xs leading-[1.6] text-fg-muted">
                    {t("services.originStaticNote")}
                  </p>
                </div>
              </div>

              {/* Right: scope + ordering */}
              <div className="relative flex flex-col p-7 sm:p-9">
                <h4 className="text-2xs font-semibold uppercase tracking-[0.1em] text-fg-subtle">
                  {t("services.originIncluded")}
                </h4>
                <ul className="mt-4 flex flex-col gap-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-[1.55] text-fg-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.4} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* `--rgb-bad` was referenced here but never defined, so this
                    callout rendered with a transparent background. */}
                <p className="mt-6 rounded-[12px] border border-bad/25 bg-bad/8 px-3.5 py-3 text-xs leading-[1.6] text-fg-muted">
                  {t("services.originScopeNote")}
                </p>

                <a
                  href={TELEGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex h-[48px] items-center justify-center gap-2.5 rounded-[13px] bg-accent px-7 text-md font-semibold text-on-accent transition-all duration-200 hover:bg-accent-strong">
                  {t("services.originCta")}
                  <span className="tabular text-sm opacity-80">{t("services.originHandle")}</span>
                  <Send
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.2}
                  />
                </a>
                <p className="mt-3 text-center text-2xs text-fg-subtle">
                  {t("services.originLegal")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
