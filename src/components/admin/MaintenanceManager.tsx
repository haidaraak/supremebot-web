"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { maintenanceApi } from "@/lib/endpoints";
import { Button } from "@/components/ui/Button";

export function MaintenanceManager() {
  const { t } = useTranslation();
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await maintenanceApi.status();
      setIsUnderMaintenance(data.is_under_maintenance ?? data.maintenance ?? false);
    } catch {
      // Use default
    }
  };

  useEffect(() => {
    void fetchStatus();
  }, []);

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      await maintenanceApi.toggle(enabled);
      setIsUnderMaintenance(enabled);
    } catch {
      alert(t("admin.maintenance.toggleFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-fg">{t("admin.maintenance.title")}</h2>
          <p className="text-sm text-fg-muted">{t("admin.maintenance.description")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${!isUnderMaintenance ? "bg-ok/12 text-ok" : "bg-surface-3 text-fg-subtle hover:bg-surface-2"}`}
          >
            <CheckCircle className="size-4" />
            {t("admin.maintenance.enabled")}
          </button>
          <button
            type="button"
            onClick={() => handleToggle(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${isUnderMaintenance ? "bg-bad/12 text-bad" : "bg-surface-3 text-fg-subtle hover:bg-surface-2"}`}
          >
            <AlertTriangle className="size-4" />
            {t("admin.maintenance.disabled")}
          </button>
        </div>
      </div>

      <div className={`rounded-[12px] border p-4 ${isUnderMaintenance ? "border-bad/30 bg-bad/8" : "border-ok/30 bg-ok/8"}`}>
        <div className="flex items-start gap-3">
          {isUnderMaintenance ? (
            <AlertTriangle className="size-5 text-bad shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="size-5 text-ok shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-fg">
              {isUnderMaintenance ? t("admin.maintenance.statusActive") : t("admin.maintenance.statusInactive")}
            </p>
            <p className="mt-1 text-xs text-fg-muted">{t("admin.maintenance.statusBody")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}



