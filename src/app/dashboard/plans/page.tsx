"use client";

import { useTranslation } from "react-i18next";

import { planApi } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { usePoll } from "@/lib/hooks";
import { FALLBACK_PLANS, featuredPlanIndex } from "@/lib/fallbackPlans";
import { CurrentPlanPanel } from "@/components/plans/CurrentPlanPanel";
import { PlanCard } from "@/components/plans/PlanCard";

export default function PlansPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data } = usePoll(() => planApi.list(), 60000, !!user);

  const plans = data && Array.isArray(data) && data.length ? data : FALLBACK_PLANS;
  const featuredIdx = featuredPlanIndex(plans);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-fg sm:text-3xl">
          {t("pricing.title")}
        </h1>
        <p className="mt-2 text-base text-fg-muted">
          {t("pricing.subtitle")}
        </p>
      </header>

      {user?.plan && <CurrentPlanPanel plan={user.plan} />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            featured={i === featuredIdx}
            current={user?.planId === plan.id}
          />
        ))}
      </div>
    </div>
  );
}
