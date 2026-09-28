"use client";

import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { EntranceGroup, EntranceItem } from "@/components/motion/Reveal";
import { ScenePanel } from "@/components/three/ScenePanel";
import { Button } from "@/components/ui/Button";
import { Kicker } from "./Kicker";

// WebGL canvas only loads client-side; falls back to a placeholder cell.
const HeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false, loading: () => <div className="size-full" /> },
);

/**
 * ============================================================
 *  Hero — the first screen, and the one place a visitor decides
 *  whether this product matches the one they are about to use.
 * ============================================================
 *
 * It was the only section on the page that spoke a different language from
 * the other thirteen:
 *
 *   · It ignored `Kicker`, the monospace `01 · LABEL` eyebrow every other
 *     section opens with, and instead stacked two labels of its own — a shell
 *     prompt *and* a plain-text eyebrow — doing one job twice, neither of them
 *     in the shared voice.
 *   · It framed the 3D in a hard square with four corner brackets over a
 *     scanline texture. `globals.css` had already abolished that vocabulary
 *     ("removed: dot grids, line networks"), and the dashboard's own 3D tile
 *     used a completely different treatment, so the two halves of the product
 *     looked like two products.
 *   · Its vertical rhythm was `pt-12 / pb-16` while every section below it ran
 *     `py-28 / sm:py-40`, so the page opened at one scale and immediately
 *     changed scale.
 *
 * What is here now:
 *
 *   · `Kicker` for the eyebrow, so the hero opens in the same voice as every
 *     section under it. The shell prompt is kept but demoted to what it
 *     actually is — a status line reporting the running state, sitting below
 *     the actions where a readout belongs, beside the trust line it shares a
 *     row with. Nothing is dropped, so no copy is lost in translation.
 *   · `ScenePanel` for the 3D, which is the same component the dashboard's
 *     load-core tile uses. The copy sits on the inline-start side, so the
 *     panel fades that edge and the core stays clear in the open half.
 *   · The landing page's own container width, padding and vertical rhythm, so
 *     the hero is the first section of the page rather than a masthead bolted
 *     in front of it.
 */
export function Hero() {
  const { t } = useTranslation();

  const trust = [t("hero.trusted"), t("hero.trusted2"), t("hero.trusted3")];

  return (
    <section id="top" className="relative overflow-hidden pt-[60px]">
      <div className="relative z-10 mx-auto max-w-[1240px] px-5 pb-28 pt-16 sm:px-8 sm:pt-20 sm:pb-36 lg:pb-40">
        {/*
          The copy and the 3D share one grid. On large screens the text takes the
          left column and the scene the right, both on the same horizontal axis,
          so they read as a single composition rather than a heading with a
          decoration floating off one edge. On small screens the scene drops to
          its own row above the copy, where it introduces the page instead of
          sitting under it.
        */}
        <EntranceGroup className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <EntranceItem>
              <Kicker>{t("landing.kicks.hero")}</Kicker>
            </EntranceItem>

            {/* Headline: contrast by weight and value, not colour. */}
            <EntranceItem>
              <h1 className="font-display mt-6 text-balance text-display font-semibold leading-[1.04] text-fg">
                {t("hero.title")}
              </h1>
            </EntranceItem>

            <EntranceItem>
              <p className="mt-6 max-w-[32rem] text-pretty text-md leading-[1.7] text-fg-muted">
                {t("hero.subtitle")}
              </p>
            </EntranceItem>

            <EntranceItem>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/login" size="lg" className="group">
                  {t("hero.ctaPrimary")}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </Button>
                <Button href="#compare" variant="outline" size="lg">
                  {t("hero.ctaSecondary")}
                </Button>
              </div>
            </EntranceItem>

            {/* Status and trust, on one block of monospace metadata. The prompt
                reports what is running; the brackets report who runs it. Same
                type, same voice as the kicker above, both metadata rather than
                copy. */}
            <EntranceItem>
              <div className="mt-12 flex flex-col gap-3 font-mono text-xs text-fg-subtle">
                <div className="flex flex-wrap items-center gap-x-1.5">
                  <span>$</span>
                  <span className="text-fg">supersonic</span>
                  <span>--layer 4</span>
                  <span>--layer 7</span>
                  <span>--live</span>
                  <span className="caret" aria-hidden />
                </div>
                <div
                  className="flex flex-wrap items-center gap-x-0 gap-y-2"
                  aria-label={trust.join(", ")}
                >
                  <span className="text-fg-muted">[</span>
                  {trust.map((label, i, arr) => (
                    <span key={label} className="flex items-center">
                      <span>{label}</span>
                      {i < arr.length - 1 && <span className="mx-2.5">·</span>}
                    </span>
                  ))}
                  <span className="text-fg-muted">]</span>
                </div>
              </div>
            </EntranceItem>
          </div>

          <EntranceItem>
            {/*
              No `edge` here on purpose. The copy is in the grid column beside
              this panel, not on top of it, so there is nothing for a directional
              fade to protect — passing one only painted the panel's own colour
              over half the scene. Overlaid copy (the dashboard's load-core tile)
              is what `edge` is for.
            */}
            <ScenePanel
              className="aspect-square w-full"
              sceneKey="hero"
              label={t("landing.scene.label")}
              scene={<HeroScene />}
            />
          </EntranceItem>
        </EntranceGroup>
      </div>

      <div className="rule relative z-10" />
    </section>
  );
}
