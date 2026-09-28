"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Megaphone, Users, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";
import { MaintenanceManager } from "@/components/admin/MaintenanceManager";
import { UserManager } from "@/components/admin/UserManager";

type Tab = "users" | "announcements" | "maintenance" | "stats";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("users");

  if (user?.role !== "admin") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Shield className="size-12 text-fg-subtle" />
        <h1 className="text-xl font-semibold text-fg">{t("admin.accessDenied")}</h1>
        <p className="text-fg-muted">{t("admin.accessDeniedDesc")}</p>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "users", label: t("admin.tabUsers"), icon: Users },
    { key: "announcements", label: t("admin.tabAnnouncements"), icon: Megaphone },
    { key: "maintenance", label: t("admin.tabMaintenance"), icon: Shield },
    { key: "stats", label: t("admin.tabStats"), icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-fg">{t("admin.title")}</h1>
        <p className="mt-2 text-base text-fg-muted">{t("admin.subtitle")}</p>
      </header>

      <div className="inline-flex rounded-[10px] border border-line bg-input p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${activeTab === key ? "bg-accent text-on-accent" : "text-fg-muted hover:text-fg"}`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "users" && <UserManager />}
        {activeTab === "announcements" && <AnnouncementManager />}
        {activeTab === "maintenance" && <MaintenanceManager />}
        {activeTab === "stats" && (
          <div className="rounded-[12px] border border-line bg-surface p-6 text-center">
            <p className="text-fg-muted">{t("admin.stats.comingSoon")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
