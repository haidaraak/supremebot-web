"use client";

import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { attackApi } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { usePoll } from "@/lib/hooks";
import type { Attack } from "@/lib/types";
import { compactNumber, compactBandwidth } from "@/lib/format";
import { AttackTable } from "@/components/dash/AttackTable";
import { StatCard } from "@/components/dash/StatCard";

export default function AttacksPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { data, loading, error } = usePoll(() => attackApi.list(), 4000, !!user);

  const stats = useMemo(() => {
    const list = data ?? [];
    const running = list.filter((a) => a.status === "running").length;
    const done = list.filter((a) => a.status === "completed").length;
    const packets = list.reduce((sum, a) => sum + (a.packetsSent ?? 0), 0);
    const bytes = list.reduce((sum, a) => sum + (a.bandwidthUsed ?? 0), 0);
    return { running, done, packets, bytes };
  }, [data]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-fg sm:text-3xl">
          {t("attacks.title")}
        </h1>
        <p className="mt-2 text-base text-fg-muted">
          {t("attacks.subtitle")}
        </p>
      </header>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("attacks.statRunning")}
          value={String(stats.running)}
          accent
          highlight={stats.running > 0}
        />
        <StatCard label={t("attacks.statCompleted")} value={String(stats.done)} />
        <StatCard
          label={t("attacks.statPackets")}
          value={compactNumber(stats.packets)}
          sub={t("attacks.statPacketsSub")}
        />
        <StatCard
          label={t("attacks.statBandwidth")}
          value={compactBandwidth(stats.bytes)}
        />
      </div>

      {error && (
        <div className="rounded-[12px] border border-bad/25 bg-bad/8 px-4 py-3 text-xs text-bad">
          {error.message}
        </div>
      )}

      <AttackTable
        attacks={data ?? []}
        loading={loading}
        onReattack={(attack) => {
          router.push(
            `/dashboard/launch?target=${encodeURIComponent(attack.target)}&method=${encodeURIComponent(attack.method)}&duration=${attack.duration}&concurrent=${attack.threads}`,
          );
        }}
      />
    </div>
  );
}
