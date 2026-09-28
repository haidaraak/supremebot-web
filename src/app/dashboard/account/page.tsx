"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { maxDurationOf, maxConcurrentOf } from "@/lib/types";
import { cn } from "@/lib/cn";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AccountPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const onCopy = async () => {
    if (!user?.apiKey) return;
    try {
      await navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  const limits = [
    { label: t("dash.slots"), value: `${maxConcurrentOf(user)}` },
    { label: t("dash.maxDuration"), value: `${Math.round(maxDurationOf(user) / 60)} min` },
  ];

  const rows = [
    { label: t("account.email"), value: user?.email, mono: false },
    { label: t("dash.role"), value: user?.role, mono: false },
    {
      label: t("dash.status"),
      value: user?.status === "active" ? t("dash.active") : user?.status,
      mono: false,
    },
    { label: t("account.memberSince"), value: fmtDate(user?.createdAt), mono: false },
    { label: t("account.lastLogin"), value: fmtDate(user?.lastLogin), mono: false },
  ];

  const planBadge =
    user?.plan?.tier === "private"
      ? { text: "Private", icon: Sparkles, color: "text-violet" }
      : user?.plan?.tier === "basic"
        ? { text: "Basic", icon: Zap, color: "text-accent" }
        : { text: "Free", icon: ShieldCheck, color: "text-fg-subtle" };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-fg">
            {t("common.greeting", { defaultValue: "Account" })}
          </h1>
          <p className="mt-2 max-w-[560px] text-base text-fg-muted">
            <span className="font-medium text-fg">{user?.username}</span>
            {" • "}
            {user?.plan?.name ?? "—"}
          </p>
        </div>
        {user?.apiAccess && (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-fg-muted">
            <ShieldCheck className="size-3.5" strokeWidth={2} />
            {t("account.apiAccess", { defaultValue: "API enabled" })}
          </span>
        )}
      </header>

      {/* 3D Profile Card */}
      <section className="relative overflow-hidden rounded-[20px] border border-line bg-gradient-to-br from-surface to-surface-2 p-6 sm:p-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'4\\' height=\\'4\\'%3E%3Crect width=\\'4\\' height=\\'4\\' fill=\\'%23ffffff\\'/%3E%3C/svg%3E')" }} />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative flex size-20 items-center justify-center rounded-[20px] border border-line bg-surface">
            <Sparkles className={`size-10 ${planBadge.color}`} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-fg">{user?.username}</h2>
            <div className="mt-1 inline-flex items-center gap-2 text-sm text-fg-muted">
              <planBadge.icon className="size-3.5" />
              <span>{planBadge.text}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm">Settings</Button>
            <Button variant="ghost" size="sm">Help</Button>
          </div>
        </div>
      </section>

      {/* Limits */}
      <section className="grid grid-cols-1 gap-4 rounded-[14px] border border-line bg-surface p-6 sm:grid-cols-2">
        {limits.map((l) => (
          <div key={l.label} className="relative overflow-hidden rounded-[12px] border border-line bg-surface-2 p-4">
            <div className="text-2xs uppercase tracking-[0.12em] text-fg-subtle">{l.label}</div>
            <div className="tabular mt-2 text-2xl font-medium text-fg">{l.value}</div>
          </div>
        ))}
      </section>

      {/* API key */}
      <section className="rounded-[14px] border border-line bg-surface p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-2.5">
          <KeyRound className="size-4 text-fg-muted" strokeWidth={1.8} />
          <h2 className="text-sm font-semibold text-fg">{t("account.apiKey")}</h2>
        </div>

        {user?.apiKey ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code
              className={cn(
                "flex-1 truncate rounded-[10px] border border-line bg-input px-4 py-3 text-xs",
                revealed ? "font-mono text-fg" : "text-fg-muted",
              )}
            >
              {revealed ? user.apiKey : "••••••••••••••••••••••••••••••••••••••••••••"}
            </code>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRevealed((v) => !v)}
                className="shrink-0"
              >
                {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button type="button" variant="outline" onClick={onCopy} className="shrink-0">
                {copied ? (
                  <>
                    <Check className="size-4 text-ok" />
                    {t("account.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    {t("account.copy")}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-fg-subtle">{t("account.apiKeyNone")}</p>
        )}
      </section>

      {/* Profile */}
      <section className="rounded-[14px] border border-line bg-surface">
        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-2 transition-colors">
              <dt className="text-sm text-fg-muted">{row.label}</dt>
              <dd
                className={cn(
                  "text-right text-sm font-medium text-fg",
                  row.mono && "font-mono",
                )}
              >
                {row.value || t("common.notAvailable")}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
