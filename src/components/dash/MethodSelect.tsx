"use client";

import { useId, useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ChevronsUpDown, Check, Search, Lock, Sparkles } from "lucide-react";

import type { Method } from "@/lib/types";
import {
  categoryOf,
  groupByCategory,
  selectableMethods,
  CATEGORY_ORDER,
  type MethodCategory,
} from "@/lib/methodCategory";
import {
  canLaunch,
  requiredTierFor,
  type AccessTier,
} from "@/lib/entitlements";
import { layerOf } from "@/lib/layer";
import { cn } from "@/lib/cn";

/**
 * Categorized method picker, gated by what the account actually holds.
 *
 * Methods are grouped into the Free / Basic / Private tiers the backend labels
 * them with, filterable by name so a long list stays usable. Keyboard behaves
 * like a standard combobox.
 *
 * The gate is a display decision, and the important part is what it *shows*.
 * A method the account cannot launch is still in the list: greyed, badged with
 * the tier that unlocks it, and excluded from the roving tab order. Two reasons.
 * Hiding it makes the catalogue look smaller than it is and leaves the user with
 * no idea what they are missing; showing it with a price attached is the only
 * thing that makes the upgrade legible. The one method a free account gets is
 * the same method on every account, so the free experience is predictable.
 */
export function MethodSelect({
  methods,
  value,
  onChange,
  access,
  disabled,
}: {
  methods: Method[];
  value: string;
  onChange: (name: string) => void;
  /** What the account holds. Drives which rows are live and which are locked. */
  access: AccessTier;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const selectable = useMemo(() => selectableMethods(methods), [methods]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return selectable;
    return selectable.filter((m) => m.name.toLowerCase().includes(q));
  }, [selectable, query]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  /**
   * Flat view of what's actually rendered, so arrow keys match the DOM order.
   * A method sold in two tiers appears under both headings above, but here it
   * is kept once — otherwise arrow keys would land on the same row twice and
   * the match count would overstate the real number of methods.
   *
   * Locked methods are in this list too, so they are reachable by keyboard and
   * their tier is announced; `choose()` is simply a no-op for them.
   */
  const flat = useMemo(() => {
    const seen = new Set<string>();
    const out: { method: Method; category: MethodCategory }[] = [];
    for (const cat of CATEGORY_ORDER) {
      for (const m of grouped[cat]) {
        if (seen.has(m.name)) continue;
        seen.add(m.name);
        out.push({ method: m, category: cat });
      }
    }
    return out;
  }, [grouped]);

  const selected = useMemo(
    () => selectable.find((m) => m.name === value) ?? null,
    [selectable, value],
  );

  const lockedCount = useMemo(
    () => filtered.filter((m) => !canLaunch(m, access)).length,
    [filtered, access],
  );

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keep the highlighted row inside the list when it changes.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const reset = useCallback(() => {
    setQuery("");
    setActive(0);
  }, []);

  function choose(name: string) {
    const method = selectable.find((m) => m.name === name);
    // A locked method closes the list and changes nothing. It does not throw
    // and it does not silently select — the row's badge and the note under the
    // field are where the upgrade is offered.
    if (!method || !canLaunch(method, access)) {
      setOpen(false);
      return;
    }
    onChange(name);
    setOpen(false);
    reset();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (flat[active]) choose(flat[active].method.name);
        break;
    }
  }

  const total = flat.length;
  const placeholder = t("launch.methodPlaceholder");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={inputId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-[12px] border border-line-strong bg-input px-4 text-left text-base transition-colors",
          "focus:border-accent/60 focus:outline-none",
          disabled ? "cursor-not-allowed opacity-60" : "hover:border-accent/40",
          open && "border-accent/60",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected ? (
            <>
              <CategoryDot category={categoryOf(selected)} />
              <span className="truncate font-medium text-fg">
                {selected.name}
              </span>
              <LayerTag layer={layerOf(selected)} />
            </>
          ) : (
            <span className="text-fg-subtle">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-fg-subtle"
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          id={inputId}
          role="listbox"
          aria-label={t("launch.method")}
          className="float absolute z-50 mt-2 w-full overflow-hidden rounded-[14px] border border-line-strong bg-surface-3 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
            <Search className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={2} />
            <input
              type="text"
              value={query}
              autoFocus
              placeholder={t("launch.methodSearch")}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
            />
            {query && (
              <span className="tabular shrink-0 text-2xs text-fg-subtle">
                {total}/{selectable.length}
              </span>
            )}
          </div>

          {/* Availability summary, so a free account can tell at a glance that
              the list is one row deep and the rest is not for them — rather
              than discovering it by clicking through locked rows. */}
          {lockedCount > 0 && (
            <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3.5 py-2 text-2xs text-fg-subtle">
              <Lock className="size-3 shrink-0" strokeWidth={2.2} />
              <span className="tabular">
                {t("launch.methodAvailability", {
                  open: total - lockedCount,
                  locked: lockedCount,
                })}
              </span>
            </div>
          )}

          <div ref={listRef} className="max-h-[260px] overflow-y-auto py-1.5">
            {total === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-fg-subtle">
                {t("launch.methodNoMatch")}
              </div>
            ) : (
              CATEGORY_ORDER.map((cat) => {
                const items = grouped[cat];
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 px-3.5 pb-1 pt-2.5">
                      <CategoryIcon category={cat} />
                      <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                        {t(`launch.cat_${cat}`)}
                      </span>
                      <span className="tabular text-2xs text-fg-subtle">
                        {items.length}
                      </span>
                    </div>
                    {items.map((m) => {
                      const idx = flat.findIndex((f) => f.method.name === m.name);
                      const isActive = idx === active;
                      const isSelected = m.name === value;
                      const locked = requiredTierFor(m, access) ?? null;
                      return (
                        <button
                          key={m.name}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={locked !== null}
                          data-idx={idx}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => choose(m.name)}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-3.5 py-2 text-start transition-colors",
                            isActive && "bg-surface-2",
                            locked && "opacity-55 hover:opacity-80",
                          )}
                        >
                          <span className="tabular min-w-0 flex-1 truncate text-sm font-medium text-fg">
                            {m.name}
                          </span>
                          {m.description && (
                            <span className="hidden truncate text-2xs text-fg-subtle xl:block">
                              {m.description}
                            </span>
                          )}
                          <LayerTag layer={layerOf(m)} />
                          {locked ? (
                            // The badge is the whole upsell: the tier that
                            // unlocks this row, in the tier's own word.
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-2xs font-medium text-fg-subtle">
                              <Lock className="size-2.5" strokeWidth={2.4} />
                              {t(`launch.cat_${locked}`)}
                            </span>
                          ) : isSelected ? (
                            <Check
                              className="size-3.5 shrink-0 text-accent"
                              strokeWidth={2.4}
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* One upgrade path, at the bottom of the list, instead of a lock on
              every row the user has to interpret one at a time. */}
          {lockedCount > 0 && (
            <div className="border-t border-line bg-surface-2 px-3.5 py-2.5">
              <Link
                href="/dashboard/plans"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 text-2xs font-medium text-fg transition-colors hover:text-fg-muted"
              >
                <Sparkles className="size-3 shrink-0" strokeWidth={2.2} />
                {t("launch.upgradeCta")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryDot({ category }: { category: MethodCategory }) {
  const color =
    category === "private"
      ? "bg-violet"
      : category === "basic"
        ? "bg-accent"
        : "bg-fg-subtle";
  return <span className={cn("size-1.5 shrink-0 rounded-full", color)} />;
}

function CategoryIcon({ category }: { category: MethodCategory }) {
  if (category === "private")
    return <Lock className="size-3 text-violet" strokeWidth={2.2} />;
  if (category === "basic")
    return <Sparkles className="size-3 text-accent" strokeWidth={2.2} />;
  return <span className="ms-px size-1.5 rounded-full bg-fg-subtle" />;
}

function LayerTag({ layer }: { layer: 4 | 7 }) {
  return (
    <span
      className={cn(
        "tabular shrink-0 rounded-full px-1.5 py-px text-2xs font-semibold",
        layer === 4
          ? "bg-info/12 text-info"
          : "bg-accent/12 text-accent",
      )}
    >
      L{layer}
    </span>
  );
}
