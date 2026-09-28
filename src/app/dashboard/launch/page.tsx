"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  Rocket,
  Loader2,
  AlertCircle,
  Clock,
  Layers,
  Crosshair,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";

import { attackApi, methodApi } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { usePoll } from "@/lib/hooks";
import {
  maxConcurrentOf,
  maxDurationOf,
  type Attack,
  type Method,
  type MethodTier,
} from "@/lib/types";
import { layerOf, type Layer } from "@/lib/layer";
import { categoryOf } from "@/lib/methodCategory";
import {
  accessTierOf,
  canLaunch,
  layerAvailable,
  launchableCount,
  requiredTierFor,
  type AccessTier,
} from "@/lib/entitlements";
import { DEFAULT_METHODS } from "@/lib/methodCatalog";
import { Button } from "@/components/ui/Button";
import { MethodSelect } from "@/components/dash/MethodSelect";
import { CountdownRing, StatusPill } from "@/components/dash/CountdownRing";
import { cn } from "@/lib/cn";

/* The live /methods response wins; this catalogue only paints the picker when
 * the backend is silent. See lib/methodCatalog.ts for where the names come from. */
const FALLBACK_METHODS: Method[] = DEFAULT_METHODS;

/* ============================================================
   Local Presets — stored in localStorage, one per device.
   ------------------------------------------------------------
   The user can save their own attack configuration and reuse
   it later. Data never leaves the device.
   ============================================================ */
const PRESET_KEY = "supreme-presets";

interface LocalPreset {
  id: string;
  name: string;
  target: string;
  method: string;
  duration: number;
  concurrent: number;
}

function loadPresets(): LocalPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: LocalPreset[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  } catch {}
}

function generatePresetId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Fills the range track up to the thumb in the accent colour. Kept here next
 *  to the only two sliders that use it; the track itself is LTR regardless of
 *  the document direction because a duration is read left-to-right. */
function rangeStyle(min: number, max: number, value: number): React.CSSProperties {
  const span = Math.max(1, max - min);
  const pct = Math.min(100, Math.max(0, ((value - min) / span) * 100));
  return {
    background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-surface-3) ${pct}%)`,
  };
}

/**
 * Tiers the backend may label a method with.
 *
 * `vip` is accepted and folded into `basic`: the middle tier was renamed from
 * VIP to Basic so it matches the plan names on the pricing page, but a
 * catalogue already in the database still says `vip`, and dropping those labels
 * would silently collapse every `vip` method into the free tier — handing a
 * free account the whole catalogue.
 */
const TIER_ALIASES: Record<string, MethodTier> = {
  free: "free",
  trial: "free",
  vip: "basic",
  basic: "basic",
  premium: "basic",
  paid: "basic",
  private: "private",
};

function normalizeTier(v: unknown): MethodTier | null {
  if (typeof v !== "string") return null;
  return TIER_ALIASES[v.trim().toLowerCase()] ?? null;
}

function normalizeMethods(data: unknown): Method[] {
  if (!Array.isArray(data)) return FALLBACK_METHODS;
  return data
    .map((m) => {
      if (typeof m === "string") return { name: m };
      if (m && typeof m === "object") {
        const obj = m as Record<string, unknown>;
        const name = String(obj.name ?? obj.method ?? obj.id ?? "").trim();
        if (!name) return null;
        const explicit = obj.layer ?? obj.type;
        const rawTiers = Array.isArray(obj.tiers) ? obj.tiers : [];
        const tiers = rawTiers
          .map(normalizeTier)
          .filter((t): t is MethodTier => t !== null);
        return {
          name,
          id: typeof obj.id === "number" ? obj.id : undefined,
          description: typeof obj.description === "string" ? obj.description : null,
          layer: typeof explicit === "string" || typeof explicit === "number" ? (explicit as number | string) : null,
          premium: Boolean(obj.premium ?? obj.isPremium),
          available: obj.available !== false,
          // Preserve the backend's own tier list. A method sold in two tiers —
          // FREE-TLS is both the free and the Basic L7 method — keeps that
          // grouping instead of collapsing to the single derived tier.
          tiers: tiers.length > 0 ? tiers : undefined,
        } as Method;
      }
      return null;
    })
    .filter((m): m is Method => m !== null);
}

export default function LaunchPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const [layer, setLayer] = useState<Layer>(7);
  const [target, setTarget] = useState("");
  const [method, setMethod] = useState("");
  const [duration, setDuration] = useState(60);
  const [concurrent, setConcurrent] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<LocalPreset[]>([]);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [presetName, setPresetName] = useState("");

  const { data: methodsRaw } = usePoll(() => methodApi.list(), 60000, !!user);
  const { data: attacks, refresh } = usePoll(() => attackApi.list(), 4000, !!user);

  const access: AccessTier = accessTierOf(user);

  const methods = useMemo(() => normalizeMethods(methodsRaw), [methodsRaw]);
  const byLayer = useMemo(
    () => ({
      4: methods.filter((m) => layerOf(m) === 4),
      7: methods.filter((m) => layerOf(m) === 7),
    }),
    [methods],
  );

  // Every layer, including the ones this account cannot launch on. The tab is
  // hidden for a locked layer only when the account is free on layer 4, where
  // an empty tab would be a dead end rather than an invitation.
  const layerOpen = layerAvailable(layer, access);

  const visible = layerOpen ? byLayer[layer] : [];

  const launchable = useMemo(
    () => visible.filter((m) => canLaunch(m, access)),
    [visible, access],
  );

  const selectedMethod = useMemo(
    () => visible.find((m) => m.name === method) ?? null,
    [visible, method],
  );

  /** The tier the currently selected method needs, if it is not the account's. */
  const selectedLock = selectedMethod ? requiredTierFor(selectedMethod, access) : null;

  const maxDuration = maxDurationOf(user);
  const maxConcurrent = maxConcurrentOf(user);
  const running = (attacks ?? []).filter((a) => a.status === "running");
  const slotsFree = Math.max(0, maxConcurrent - running.length);

  // Keep a launchable method selected whenever the layer tab changes. A locked
  // selection is not left standing, because the submit button would then
  // describe a method the account cannot run.
  useEffect(() => {
    if (visible.length === 0) {
      if (method) setMethod("");
      return;
    }
    if (visible.some((m) => m.name === method && canLaunch(m, access))) return;
    setMethod(launchable[0]?.name ?? "");
  }, [visible, launchable, method, access]);

  useEffect(() => {
    if (duration > maxDuration) setDuration(maxDuration);
    if (concurrent > maxConcurrent) setConcurrent(Math.max(1, maxConcurrent));
  }, [maxDuration, maxConcurrent, duration, concurrent]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const savePreset = () => {
    if (!target.trim() || !method) return;
    const newPreset: LocalPreset = {
      id: generatePresetId(),
      name: presetName || `${method} on ${target}`,
      target: target.trim(),
      method,
      duration,
      concurrent,
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    savePresets(updated);
    setPresetName("");
    setShowPresetForm(false);
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    savePresets(updated);
  };

  const loadPreset = (preset: LocalPreset) => {
    setTarget(preset.target);
    setMethod(preset.method);
    setDuration(preset.duration);
    setConcurrent(preset.concurrent);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = target.trim();
    if (!cleaned) {
      setError(t("launch.needTarget"));
      return;
    }
    // Re-checked here rather than trusted from the picker: this is the last
    // point before the request, and the state it reads can be stale if the
    // account changed tier while the form was open.
    const chosen = methods.find((m) => m.name === method);
    if (!chosen) {
      setError(t("launch.needMethod"));
      return;
    }
    const required = requiredTierFor(chosen, access);
    if (required) {
      setError(
        t(required === "private" ? "launch.errorPrivateTier" : "launch.errorBasicTier"),
      );
      return;
    }
    if (!layerOpen) {
      setError(t("launch.errorLayerLocked"));
      return;
    }
    if (slotsFree < 1) {
      setError(t("launch.errorSlots"));
      return;
    }

    setSubmitting(true);
    try {
      await attackApi.create({
        target: cleaned,
        method,
        duration: Number(duration),
        concurrent: Number(concurrent),
      });
      await refresh();
      void router.push("/dashboard?launched=1");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t("auth.errorGeneric"),
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-fg sm:text-3xl">
            {t("launch.title")}
          </h1>
          <p className="mt-2 text-base text-fg-muted">
            {t("launch.subtitle")}
          </p>
        </div>
        {/* The account's standing, stated once, above the form. Every gate in
            the form below is an instance of this line, so having it here means
            the locked tabs and locked rows are never a surprise. */}
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-2xs font-medium text-fg-muted">
          {access === "private" ? (
            <Sparkles className="size-3 text-violet" strokeWidth={2.2} />
          ) : access === "basic" ? (
            <Sparkles className="size-3" strokeWidth={2.2} />
          ) : (
            <Lock className="size-3" strokeWidth={2.2} />
          )}
          {t(`launch.plan_${access}`)}
          {user?.plan?.name ? (
            <span className="text-fg-subtle">· {user.plan.name}</span>
          ) : null}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form
          onSubmit={onSubmit}
          className="relative overflow-hidden rounded-[18px] border border-line-strong bg-surface p-6 sm:p-7">
          <div className="pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative flex flex-col gap-5">
            {/* L4 / L7 — the two families the backend distinguishes. Each tab
                carries its own count and, for a tier that cannot use it, a
                lock. The counts are the whole catalogue rather than the
                launchable subset: a tab reading "0" for a free account would
                be a dead end, and "12 🔒" is the argument for upgrading. */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-fg-muted">
                {t("launch.layer")}
              </span>
              <div
                role="tablist"
                aria-label={t("launch.layer")}
                className="inline-flex w-full rounded-[12px] border border-line bg-input p-1">
                {([7, 4] as const).map((l) => {
                  const open = layerAvailable(l, access);
                  return (
                    <button
                      key={l}
                      type="button"
                      role="tab"
                      aria-selected={layer === l}
                      onClick={() => setLayer(l)}
                      className={cn("flex flex-1 items-center justify-center gap-2 rounded-[9px] py-2.5 text-sm font-semibold transition-all duration-200",
                        layer === l
                          ? "bg-accent text-on-accent "
                          : "text-fg-muted hover:text-fg",
                      )}
                    >
                      <Layers className="size-3.5" strokeWidth={2} />
                      {t(`launch.layer${l}`)}
                      {!open && <Lock className="size-3" strokeWidth={2.2} />}
                      <span
                        className={cn("tabular rounded-full px-1.5 py-px text-2xs font-medium",
                          layer === l
                            ? "bg-white/20 text-on-accent"
                            : "bg-surface-3 text-fg-subtle",
                        )}
                      >
                        {open ? launchableCount(byLayer[l], access) : byLayer[l].length}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-2xs leading-[1.55] text-fg-subtle">
                {!layerOpen
                  ? t("launch.layerLockedHint")
                  : layer === 7
                    ? t("launch.layer7Hint")
                    : t("launch.layer4Hint")}
              </p>
            </div>

            <Field label={t("launch.target")} icon={Crosshair}>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={
                  layer === 7 ? t("launch.targetPlaceholder7") : t("launch.targetPlaceholder4")
                }
                autoComplete="off"
                spellCheck={false}
                className="tabular h-12 w-full rounded-[12px] border border-line-strong bg-input px-4 text-base text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!layerOpen}
                required
              />
            </Field>

            <Field label={t("launch.method")} icon={Layers}>
              {!layerOpen ? (
                /* A locked layer gets a panel rather than an empty picker, so
                   the reason and the way out are both in the place the user
                   already is looking. */
                <LockedLayerPanel />
              ) : visible.length === 0 ? (
                <span className="text-xs text-fg-subtle">
                  {t("common.loading")}
                </span>
              ) : (
                <>
                  <MethodSelect
                    methods={visible}
                    value={method}
                    onChange={setMethod}
                    access={access}
                    disabled={submitting}
                  />
                  {selectedMethod && (
                    <p className="mt-2 flex items-start gap-1.5 text-2xs leading-[1.55] text-fg-subtle">
                      <span
                        className={cn("mt-px shrink-0 rounded-full px-1.5 py-px text-2xs font-semibold uppercase tracking-wide",
                          selectedLock
                            ? "bg-fg-subtle/12 text-fg-muted"
                            : categoryOf(selectedMethod) === "private"
                              ? "bg-violet/12 text-violet"
                              : categoryOf(selectedMethod) === "basic"
                                ? "bg-accent/12 text-accent"
                                : "bg-surface-3 text-fg-subtle",
                        )}
                      >
                        {t(`launch.cat_${categoryOf(selectedMethod)}`)}
                      </span>
                      <span className="min-w-0">
                        {selectedMethod.description ??
                          t(`launch.cat_${categoryOf(selectedMethod)}Hint`)}
                      </span>
                    </p>
                  )}
                </>
              )}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("launch.duration")} icon={Clock}>
                <input
                  type="range"
                  dir="ltr"
                  min={10}
                  max={maxDuration}
                  step={10}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="supreme-range mt-3 w-full"
                  style={rangeStyle(10, maxDuration, duration)}
                />
                <div dir="ltr" className="flex items-center justify-between">
                  <span className="tabular text-xl font-medium text-fg">
                    {duration}s
                  </span>
                  <span className="text-2xs text-fg-subtle">
                    {t("launch.limitDuration", { n: maxDuration })}
                  </span>
                </div>
              </Field>

              <Field label={t("launch.concurrent")} icon={Layers}>
                <input
                  type="range"
                  dir="ltr"
                  min={1}
                  max={Math.max(1, maxConcurrent)}
                  step={1}
                  value={concurrent}
                  onChange={(e) => setConcurrent(Number(e.target.value))}
                  className="supreme-range mt-3 w-full"
                  style={rangeStyle(1, Math.max(1, maxConcurrent), concurrent)}
                />
                <div dir="ltr" className="flex items-center justify-between">
                  <span className="tabular text-xl font-medium text-fg">
                    {concurrent}
                  </span>
                  <span className="text-2xs text-fg-subtle">
                    {t("launch.limitConcurrent", { n: maxConcurrent })}
                  </span>
                </div>
              </Field>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-[11px] border border-bad/25 bg-bad/8 px-3.5 py-2.5 text-xs text-bad">
                <AlertCircle className="size-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}

            {/* The button states the gate rather than failing after the click.
                A submit that is guaranteed to be refused is worse than a submit
                that is visibly unavailable with the reason attached. */}
            {layerOpen ? (
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                disabled={!method || selectedLock !== null}
                className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                    {t("launch.launching")}
                  </>
                ) : (
                  <>
                    <Rocket className="size-4" strokeWidth={2} />
                    {t("launch.submit")}
                  </>
                )}
              </Button>
            ) : (
              <Link
                href="/dashboard/plans"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:bg-accent-strong"
              >
                <Sparkles className="size-4" strokeWidth={2} />
                {t("launch.upgradeCta")}
              </Link>
            )}

            <p className="text-center text-2xs leading-[1.6] text-fg-subtle">
              {t("launch.disclaimer")}
            </p>
          </div>
        </form>

        <aside className="flex flex-col gap-4">
          {/* Local Presets */}
          <div className="relative overflow-hidden rounded-[16px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong">
            <div className="relative mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-fg">
                Local Presets
              </h3>
              <button
                type="button"
                onClick={() => setShowPresetForm((s) => !s)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-surface-2 px-2 text-xs font-medium text-fg-muted transition-colors hover:border-accent/35 hover:text-accent"
              >
                <Plus className="size-3.5" strokeWidth={2.2} />
                New
              </button>
            </div>

            {showPresetForm && (
              <div className="relative mb-4 flex flex-col gap-3 rounded-[12px] border border-line bg-surface-2 p-4">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name (optional)"
                  className="h-10 w-full rounded-lg border border-line bg-input px-3 text-sm text-fg outline-none focus:border-accent/60"
                />
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" onClick={savePreset} disabled={!target.trim() || !method}>
                    <Save className="size-3.5" strokeWidth={2.2} />
                    Save
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowPresetForm(false)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-surface-2 px-2 text-xs font-medium text-fg-muted transition-colors hover:text-fg"
                  >
                    <X className="size-3.5" strokeWidth={2.2} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {presets.length === 0 ? (
              <p className="text-xs text-fg-subtle">No local presets yet. Click "New" to create one.</p>
            ) : (
              <ul className="relative mt-4 flex flex-col gap-2.5">
                {presets.map((preset) => (
                  <li
                    key={preset.id}
                    className="rounded-[11px] border border-line bg-surface-2 px-3.5 py-3 transition-colors duration-200 hover:border-accent/35"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-fg">{preset.name}</div>
                        <div className="text-2xs text-fg-subtle">
                          {preset.target} • {preset.method} • {preset.concurrent}x • {preset.duration}s
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreset(preset)}
                        >
                          Load
                        </Button>
                        <button
                          type="button"
                          onClick={() => deletePreset(preset.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-bad/25 bg-bad/6 text-bad transition-colors hover:bg-bad/12"
                          title="Delete preset"
                        >
                          <Trash2 className="size-4" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* What this account can launch, on each layer, stated as numbers.
              A free account seeing "1 of 12" on layer 7 and "0 of 12" on layer 4
              understands the offer without being told to. */}
          <div className="relative overflow-hidden rounded-[16px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong">
            <h3 className="relative text-sm font-semibold text-fg">
              {t("launch.accessTitle")}
            </h3>
            <ul className="relative mt-4 flex flex-col gap-2.5">
              {([7, 4] as const).map((l) => {
                const open = layerAvailable(l, access);
                const total = byLayer[l].length;
                const free = launchableCount(byLayer[l], access);
                return (
                  <li
                    key={l}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="flex items-center gap-2 text-fg-muted">
                      {!open && <Lock className="size-3 shrink-0" strokeWidth={2.2} />}
                      {t(`launch.layer${l}`)}
                    </span>
                    <span className="tabular shrink-0 text-fg-subtle">
                      {open
                        ? t("launch.accessCount", { free, total })
                        : t("launch.accessLocked")}
                    </span>
                  </li>
                );
              })}
            </ul>
            {access !== "private" && (
              <Link
                href="/dashboard/plans"
                className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-fg transition-colors hover:text-fg-muted"
              >
                <Sparkles className="size-3.5 shrink-0" strokeWidth={2.2} />
                {t("launch.upgradeCta")}
              </Link>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[16px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong">
            <h3 className="relative text-sm font-semibold text-fg">
              {t("dash.slots")}
            </h3>
            <div className="relative mt-4 flex items-end gap-2">
              <span className="tabular text-3xl font-medium text-fg drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]">
                {running.length}
              </span>
              <span className="mb-1.5 text-sm text-fg-muted">
                / {maxConcurrent} {t("dash.slotsDesc")}
              </span>
            </div>
            <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-surface-3 shadow-[var(--shadow-inset)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fg-subtle to-fg transition-all duration-500"
                style={{
                  width: `${maxConcurrent ? (running.length / maxConcurrent) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="relative mt-3 text-2xs leading-[1.6] text-fg-subtle">
              {slotsFree < 1 ? t("launch.errorSlots") : t("launch.slotsFree", { n: slotsFree })}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[16px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong">
            <h3 className="relative mb-3 text-sm font-semibold text-fg">
              {t("attacks.running")}
            </h3>
            {running.length === 0 ? (
              <p className="relative text-xs text-fg-subtle">
                {t("dash.noTests")}
              </p>
            ) : (
              <ul className="relative flex flex-col gap-2.5">
                {running.map((a: Attack) => (
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
        </aside>
      </div>

    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className="size-3.5 text-fg-subtle" strokeWidth={1.8} />
        <label className="text-xs font-medium text-fg-muted">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

/**
 * Stands in for the method picker when the selected layer is not on the
 * account's plan.
 *
 * A picker full of locked rows would also work, and arguably shows more. This
 * is the smaller promise: the whole layer is one thing, it costs one tier, and
 * the tier is named. The per-method locks still exist on the layer-7 tab, where
 * only some methods are gated, so a free account can see exactly what Basic adds
 * method by method.
 */
function LockedLayerPanel() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-dashed border-line-strong bg-surface-2 px-4 py-5">
      <div className="flex items-center gap-2">
        <Lock className="size-4 shrink-0 text-fg-subtle" strokeWidth={2} />
        <span className="text-sm font-medium text-fg">
          {t("launch.layer4LockedTitle")}
        </span>
      </div>
      <p className="text-xs leading-[1.6] text-fg-muted">
        {t("launch.layer4LockedBody")}
      </p>
      <Link
        href="/dashboard/plans"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-fg transition-colors hover:text-fg-muted"
      >
        <Sparkles className="size-3.5 shrink-0" strokeWidth={2.2} />
        {t("launch.upgradeCta")}
      </Link>
    </div>
  );
}
