import type { Method, MethodTier } from "./types";

/* ============================================================
   Method tiers. The backend exposes `premium` and `available`
   flags; the three tiers the platform sells map onto them like
   this. Private methods are named as such by the backend.

   A handful of methods are deliberately sold in two tiers at
   once — FREE-TLS is the free-tier L7 method *and* a paid-tier
   one — so `Method.tiers` can list several. The badge on a
   selected method still shows one tier (`categoryOf`, the most
   generous), but the picker lists the method under every tier
   it belongs to.
   ============================================================ */

export type MethodCategory = MethodTier;

export const CATEGORY_ORDER: MethodCategory[] = ["free", "basic", "private"];

/** The single tier a badge or label should show — the most generous one. */
export function categoryOf(method: Method): MethodCategory {
  const name = method.name.toLowerCase();
  if (name.startsWith("priv") || name.includes("private")) return "private";
  if (method.premium) return "basic";
  return "free";
}

/** Every tier the method is sold under. Falls back to the derived tier. */
export function tiersOf(method: Method): MethodCategory[] {
  if (method.tiers && method.tiers.length > 0) {
    // Keep the documented order so a method always lands in the same place.
    const seen = new Set(method.tiers);
    return CATEGORY_ORDER.filter((c) => seen.has(c));
  }
  return [categoryOf(method)];
}

/** True when the method appears in more than one tier. */
export function isMultiTier(method: Method): boolean {
  return tiersOf(method).length > 1;
}

/**
 * Group a flat method list into ordered tiers. A method sold in two tiers
 * appears under both, so a user scanning either tier finds it — but each
 * group keeps it exactly once.
 */
export function groupByCategory(methods: Method[]): Record<MethodCategory, Method[]> {
  const out: Record<MethodCategory, Method[]> = {
    free: [],
    basic: [],
    private: [],
  };
  for (const m of methods) {
    for (const tier of tiersOf(m)) {
      if (!out[tier].includes(m)) out[tier].push(m);
    }
  }
  return out;
}

/** Methods the backend has not marked unavailable. */
export function selectableMethods(methods: Method[]): Method[] {
  return methods.filter((m) => m.available !== false);
}
