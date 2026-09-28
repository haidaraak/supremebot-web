"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AlertTriangle, Rocket, Activity, History, X, Megaphone, Globe, Sparkles } from "lucide-react";
import { Suspense } from "react";

import { announcementApi, attackApi, maintenanceApi } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { usePoll } from "@/lib/hooks";
import {
  maxConcurrentOf,
  maxDurationOf,
  maxThreadsOf,
  type Attack,
} from "@/lib/types";
import { AttackTable } from "@/components/dash/AttackTable";
import { StatCard } from "@/components/dash/StatCard";
import { CountdownRing, StatusPill } from "@/components/dash/CountdownRing";
import { ScenePanel } from "@/components/three/ScenePanel";
import { cn } from "@/lib/cn";
import { UptimeCard } from "@/components/dash/UptimeCard";
import { MethodMix } from "@/components/dash/MethodMix";
import { DurationTrend } from "@/components/dash/DurationTrend";
import { LayerSplit } from "@/components/dash/LayerSplit";
import { StatusBreakdown } from "@/components/dash/StatusBreakdown";

const LoadCoreScene = dynamic(
  () => import("@/components/three/LoadCore").then((m) => m.LoadCoreScene),
  { ssr: false },
);

function OverviewContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useSearchParams();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { data: maintenance } = usePoll(
    () => maintenanceApi.status(),
    30000,
    !!user,
  );
  const { data: attacks } = usePoll(() => attackApi.list(), 4000, !!user);
  const { data: announcements } = usePoll(
    () => announcementApi.active(),
    30000,
    !!user,
  );

  const showMaintenance = maintenance?.maintenance && !bannerDismissed;
  const justLaunched = params.get("launched") === "1";

  const running = (attacks ?? []).filter((a) => a.status === "running");
  const maxConcurrent = maxConcurrentOf(user);
  const slotsInUse = running.length;

  return (
    <div className="flex flex-col gap-8">
      {showMaintenance && (
        <div className="flex items-start gap-3.5 rounded-[14px] border border-warn/30 bg-warn/8 p-4">
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-warn"
            strokeWidth={1.8}
          />
          <div className="flex-1">
            <div className="text-sm font-semibold text-fg">
              {t("dash.maintenanceTitle")}
            </div>
            <p className="mt-1 text-xs leading-[1.6] text-fg-muted">
              {t("dash.maintenanceBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label={t("common.close")}
            className="text-fg-subtle transition-colors hover:text-fg">
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {justLaunched && (
        <div className="flex items-center gap-3 rounded-[14px] border border-ok/30 bg-ok/8 p-4">
          <Activity className="size-5 shrink-0 text-ok" strokeWidth={1.8} />
          <span className="text-sm text-fg">
            {t("launch.success")}
          </span>
        </div>
      )}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-fg sm:text-3xl">
            {t("auth.welcomeBack")}, {user?.username}
          </h1>
          <p className="mt-2 text-base text-fg-muted">
            {t("dash.overview")} · {user?.plan?.name ?? "—"}
          </p>
        </div>
        <Link
          href="/dashboard/launch"
          className="inline-flex h-11 items-center justify-center gap-2.5 rounded-[12px] bg-accent px-5 text-base font-semibold text-on-accent transition-all duration-200 hover:-translate-y-px hover:bg-accent-strong">
          <Rocket className="size-4" strokeWidth={2} />
          {t("launch.title")}
        </Link>
      </header>

      {/* Stat strip. StatCard already pushes its numeral up on a translateZ
       * layer; the perspective here is what makes that layer actually separate
       * from the tile instead of rendering flat. */}
      <div
        style={{ perspective: "1100px", perspectiveOrigin: "50% -10%" }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("dash.balance")}
          value={`$${user?.balance ?? "0.00"}`}
          accent
        />
        <StatCard label={t("dash.plan")} value={user?.plan?.name ?? "—"} />
        <StatCard
          label={t("dash.slots")}
          value={`${slotsInUse} / ${maxConcurrent}`}
          sub={t("dash.slotsDesc")}
          highlight={slotsInUse >= maxConcurrent}
        />
        <StatCard
          label={t("dash.maxDuration")}
          value={`${maxDurationOf(user)}s`}
          sub={`${maxThreadsOf(user).toLocaleString()} ${t("dash.maxThreads")}`}
        />
       </div>

       {/* Private service horizontal card */}
       <div className="relative overflow-hidden rounded-[18px] border border-violet/40 bg-gradient-to-r from-violet/10 to-transparent p-6 transition-all duration-300 hover:border-violet/60">
         <div className="pointer-events-none absolute inset-0 opacity-30" />
         <div className="relative flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <Globe className="size-6 shrink-0 text-violet" strokeWidth={2.2} />
             <div>
               <h3 className="font-semibold text-fg">Reverse Proxy Service</h3>
               <p className="text-xs text-fg-muted">Get what's behind Cloudflare • Real-time IP resolution</p>
             </div>
           </div>
           <button
             type="button"
             className="inline-flex h-10 items-center gap-2 rounded-lg border border-violet/50 bg-violet/5 px-4 text-sm font-medium text-violet transition-colors hover:bg-violet/10"
           >
             <Sparkles className="size-3.5" strokeWidth={2.2} />
             Launch
           </button>
         </div>
       </div>

       {/* Bento row — varied spans, one tall hero tile carrying the 3D core. */}
      <section className="grid gap-4 lg:grid-cols-6">
        <LoadCoreHero running={running} className="lg:col-span-3 lg:row-span-2" />

        <div className="relative flex flex-col overflow-hidden rounded-[18px] border border-line bg-surface p-6 lg:col-span-3">
          <div className="relative mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-fg">
              {t("attacks.running")}
            </h3>
            <span className="tabular text-2xs text-fg-subtle">
              {slotsInUse} / {maxConcurrent}
            </span>
          </div>
          {running.length === 0 ? (
            <div className="flex h-[130px] flex-col items-start justify-center gap-2">
              <p className="text-xs text-fg-subtle">
                {t("dash.noTests")}
              </p>
              <Link
                href="/dashboard/launch"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-strong">
                <Rocket className="size-3.5" strokeWidth={2} />
                {t("launch.title")}
              </Link>
            </div>
          ) : (
            <ul className="relative flex flex-col gap-2.5">
              {running.map((a) => (
                <li
                  key={a.id}
                  className="rounded-[11px] border border-line bg-surface-2 px-3.5 py-3 transition-colors duration-200 hover:border-accent/35">
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-accent pulse-dot" />
                      <span className="tabular truncate text-xs text-fg">
                        {a.target}
                      </span>
                    </span>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="tabular truncate text-2xs text-fg-subtle">
                      {a.method}
                    </span>
                    <CountdownRing attack={a} compact />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ChartCard className="lg:col-span-3">
          <StatusBreakdown attacks={attacks ?? []} />
        </ChartCard>
      </section>

       <section className="grid gap-4 lg:grid-cols-3">
         <ChartCard>
           <UptimeCard />
         </ChartCard>
         <ChartCard>
           <MethodMix attacks={attacks ?? []} />
         </ChartCard>
         <ChartCard>
           <LayerSplit attacks={attacks ?? []} />
         </ChartCard>
       </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ChartCard>
          <DurationTrend attacks={attacks ?? []} />
        </ChartCard>

        {/* Announcements sit in their own narrow column so the bento stays
         * asymmetric rather than another flat full-width list. */}
        <div className="flex flex-col overflow-hidden rounded-[16px] border border-line bg-surface p-6">
          <h3 className="relative flex items-center gap-2 text-sm font-semibold text-fg">
            <Megaphone className="size-3.5 text-fg-subtle" strokeWidth={1.9} />
            {t("dash.announcements")}
          </h3>
          {(announcements?.length ?? 0) === 0 ? (
            <p className="relative mt-5 text-xs text-fg-subtle">
              {t("dash.noAnnouncements")}
            </p>
          ) : (
            <div className="relative mt-4 flex flex-col gap-2.5">
              {announcements!.map((a) => (
                <div
                  key={a.id}
                  className="rounded-[11px] border border-line bg-surface-2 px-3.5 py-3">
                  <div className="text-sm font-medium text-fg">
                    {a.title}
                  </div>
                  {a.content && (
                    <p className="mt-1 text-xs leading-[1.6] text-fg-muted">
                      {a.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-fg">
            {t("dash.recent")}
          </h2>
          <Link
            href="/dashboard/attacks"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-accent">
            <History className="size-3.5" strokeWidth={2} />
            {t("attacks.title")}
          </Link>
        </div>
        <AttackTable attacks={(attacks ?? []).slice(0, 6)} loading={false} />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <OverviewContent />
    </Suspense>
  );
}

/* ============================================================
   Ambient load core — the bento grid's hero tile.
   ------------------------------------------------------------
   The scene is full-bleed behind the copy rather than parked in a
   corner, so the 3D is the tile instead of decorating it. The copy
   sits above the scene's own fade, and the tile is the same
   `ScenePanel` the landing hero uses — the two are the same object
   at two scales, so they should not be two designs.

   It renders no data of its own — it is driven by the same `running`
   array the slot counter shows, so it can never disagree with the
   numbers.
   ============================================================ */
function LoadCoreHero({
  running,
  className,
}: {
  running: Attack[];
  className?: string;
}) {
  const { t } = useTranslation();
  const active = running.length > 0;

  return (
    <ScenePanel
      edge="bottom"
      className={cn(
        "flex min-h-[300px] flex-col justify-between p-6 transition-colors duration-300 sm:p-7",
        active && "border-line-strong",
        className,
      )}
      sceneKey="load-core"
      label={t("dash.loadCore")}
      tone={active ? "live" : "idle"}
      scene={<LoadCoreScene count={running.length} />}
    >
      <div className="flex-1" />

      <div className="max-w-[320px]">
        <div
          className={cn(
            "text-xl font-semibold tracking-[-0.02em]",
            active ? "text-accent" : "text-fg",
          )}
        >
          {active
            ? t("dash.loadCoreActive", { count: running.length })
            : t("dash.loadCoreIdle")}
        </div>
        <p className="mt-2 text-xs leading-[1.65] text-fg-subtle">
          {t("dash.loadCoreHint")}
        </p>
        {active && running[0] && (
          <div className="mt-4 max-w-[260px] rounded-[11px] border border-line bg-surface/80 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2.5">
              <span className="tabular truncate text-2xs text-fg-muted">
                {running[0].target}
              </span>
              <StatusPill status={running[0].status} />
            </div>
            <CountdownRing attack={running[0]} compact className="mt-1.5" />
          </div>
        )}
      </div>
    </ScenePanel>
  );
}

/**
 * Chart shell. The surface and the grid wash sit on separate layers so the card
 * reads as a recessed panel rather than a flat box — depth without a ,
 * which would distort the SVG it holds.
 */
function ChartCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(" relative overflow-hidden rounded-[16px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export type { Attack };
