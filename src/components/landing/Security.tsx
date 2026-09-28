"use client";

import { useTranslation } from "react-i18next";
import { ShieldCheck, KeyRound, Bell, Users } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Kicker } from "./Kicker";

const GROUPS = [
  { key: "identity", icon: ShieldCheck },
  { key: "api", icon: KeyRound },
  { key: "alerts", icon: Bell },
  { key: "team", icon: Users },
] as const;

/**
 * Account-security overview. Mirrors the controls actually surfaced in the
 * dashboard account page, so nothing here is a promise the product breaks.
 */
export function Security() {
  const { t } = useTranslation();

  return (
    <section id="security" className="relative border-y border-line bg-bg-elevated py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Kicker index={5}>{t("landing.kicks.security")}</Kicker>
          <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
            {t("security.title")}
          </h2>
          <p className="mt-5 text-md leading-[1.65] text-fg-muted">{t("security.subtitle")}</p>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {GROUPS.map(({ key, icon: Icon }) => (
            <RevealItem
              key={key}
              className="group flex gap-5 rounded-[16px] border border-line bg-surface p-7 transition-colors duration-300 hover:border-line-strong">
              <div className="relative flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-accent/20 bg-accent/8 text-accent">
                <Icon className="size-5" strokeWidth={1.7} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-fg">
                  {t(`security.${key}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-[1.65] text-fg-muted">
                  {t(`security.${key}Desc`)}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
