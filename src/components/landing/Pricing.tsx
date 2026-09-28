"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "@/lib/api";
import type { Plan } from "@/lib/types";
import { FALLBACK_PLANS, featuredPlanIndex } from "@/lib/fallbackPlans";
import { useAuth } from "@/lib/auth";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Kicker } from "@/components/landing/Kicker";
import { CustomPlan } from "@/components/landing/CustomPlan";
import { PlanCard } from "@/components/plans/PlanCard";

export function Pricing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);

  useEffect(() => {
    let alive = true;
    api
      .get<Plan[]>("/plans")
      .then((data) => {
        if (alive && Array.isArray(data) && data.length) setPlans(data);
      })
      .catch(() => {
        /* keep fallback copy */
      });
    return () => {
      alive = false;
    };
  }, []);

  const featuredIdx = featuredPlanIndex(plans);

  return (
    <section id="pricing" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Kicker index={7}>{t("landing.kicks.pricing")}</Kicker>
          <h2 className="font-display mt-5 text-balance text-display-sm font-semibold text-fg">
            {t("pricing.title")}
          </h2>
          <p className="mt-5 text-md leading-[1.65] text-fg-muted">{t("pricing.subtitle")}</p>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <RevealItem key={plan.id} className="flex">
              <PlanCard
                plan={plan}
                featured={i === featuredIdx}
                current={user?.planId === plan.id}
                href={user ? "/dashboard" : "/login"}
                selectLabel={user?.planId === plan.id ? t("pricing.currentPlan") : undefined}
              />
            </RevealItem>
          ))}
        </RevealGroup>

        <CustomPlan />
      </div>
    </section>
  );
}
