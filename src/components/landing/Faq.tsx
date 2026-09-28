"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Kicker } from "./Kicker";
import { cn } from "@/lib/cn";

const Q = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function Faq() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative border-t border-line bg-bg-elevated py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <Kicker index={8}>{t("landing.kicks.faq")}</Kicker>
            <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
              {t("faq.title")}
            </h2>
          </Reveal>

          {/*
            The answers use the grid-rows 1fr/0fr height technique, so the
            panel keeps its content in the DOM and stays findable by a screen
            reader and by in-page search.
          */}
          <RevealGroup as="div" amount={0.05} step={0.045}>
            <div className="divide-y divide-line border-y border-line">
              {Q.map((key, i) => {
                const isOpen = open === i;
                const buttonId = `faq-button-${key}`;
                const panelId = `faq-panel-${key}`;

                return (
                  <RevealItem key={key}>
                    <div>
                      <button
                        type="button"
                        id={buttonId}
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        /* The two were previously unpaired: the button announced
                           its state but nothing identified what it controlled. */
                        aria-controls={panelId}
                        className="flex w-full items-center justify-between gap-4 py-5 text-start">
                        <span
                          className={cn("text-md font-medium transition-colors",
                            isOpen ? "text-fg" : "text-fg-muted",
                          )}
                        >
                          {t(`faq.${key}`)}
                        </span>
                        <ChevronDown
                          className={cn("size-4 shrink-0 text-accent transition-transform duration-300",
                            isOpen && "rotate-180",
                          )}
                          strokeWidth={2}
                        />
                      </button>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className={cn("grid transition-all duration-300 ease-[var(--ease-out-quint)]",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="pb-6 pr-8 text-sm leading-[1.7] text-fg-muted">
                            {t(`faq.a${key.slice(1)}`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </div>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
