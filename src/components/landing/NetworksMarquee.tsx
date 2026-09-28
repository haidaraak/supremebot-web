"use client";

import { useTranslation } from "react-i18next";
import {
  Cloud,
  CloudLightning,
  Fingerprint,
  Globe,
  Network,
  Radar,
  Shield,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";

/**
 * Auto-scrolling network strip. Pure CSS: the track is duplicated once and
 * translated by -50%, so the loop has no seam and no JS ticker. The animation
 * pauses on hover and under prefers-reduced-motion, so it never fights a reader
 * trying to scan the names.
 *
 * The brands are the CDN/WAF networks a target may sit behind — listed here as
 * infrastructure the platform recognises, not as customers or partners.
 */

type Brand = { name: string; icon: typeof Cloud };

const BRANDS: Brand[] = [
  { name: "Cloudflare", icon: Cloud },
  { name: "DDoS-Guard", icon: ShieldCheck },
  { name: "Akamai", icon: Globe },
  { name: "OVH", icon: Network },
  { name: "Vercel", icon: Cloud },
  { name: "Amazon", icon: Cloud },
  { name: "Gcore", icon: Globe },
  { name: "Stormwall", icon: CloudLightning },
  { name: "TCPShield", icon: Shield },
  { name: "hCaptcha", icon: Fingerprint },
  { name: "Imperva", icon: Radar },
  { name: "Fortinet", icon: Shield },
  { name: "Kaspersky", icon: ShieldCheck },
  { name: "Voxility", icon: Network },
  { name: "Fastly", icon: Globe },
  { name: "Google", icon: Globe },
];

export function NetworksMarquee() {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden border-b border-line bg-bg py-14">
      <div className="mx-auto mb-8 max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-fg-subtle sm:text-sm">
            {t("networks.eyebrow", {
              count: "10M",
            })}
          </p>
        </Reveal>
      </div>

      <div
        className="group relative flex overflow-x-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="marquee-track flex w-max shrink-0 items-center gap-16 px-8 motion-safe:animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
          <BrandRow />
        </div>
        {/* Duplicate — the second copy is what makes the loop seamless */}
        <div
          aria-hidden
          className="marquee-track flex w-max shrink-0 items-center gap-16 px-8 motion-safe:animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]"
        >
          <BrandRow />
        </div>
      </div>
    </section>
  );
}

function BrandRow() {
  return (
    <>
      {BRANDS.map(({ name, icon: Icon }) => (
        <div
          key={name}
          className="flex shrink-0 items-center gap-3 opacity-35 transition-all duration-500 hover:!opacity-90 dark:opacity-30"
        >
          <Icon
            className="size-6 text-fg"
            strokeWidth={1.6}
            aria-hidden
          />
          <span className="font-display text-xl font-semibold text-fg">
            {name}
          </span>
        </div>
      ))}
    </>
  );
}
