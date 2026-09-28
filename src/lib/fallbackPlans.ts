import type { Plan } from "./types";

/**
 * The plan ladder the product sells, used when `/api/plans` is unreachable or
 * empty.
 *
 * This used to be duplicated verbatim in the landing pricing section and the
 * dashboard plans page, which meant the two could — and did — drift, and a
 * change to the ladder had to be made twice. It lives here so there is one list
 * and the launch form's access gate can be reasoned about against it.
 *
 * The rungs map onto the access ladder in `lib/entitlements.ts`:
 *
 *   Free      tier `free`     one method, FREE-TLS, on layer 7.
 *   Basic     tier `basic`    the full layer 7 and layer 4 catalogue.
 *   Business  tier `business` the same method catalogue, far larger limits.
 *
 * There is deliberately no paid rung between Free and Basic, and no free
 * transport-layer entry anywhere, because the launch form states both out loud
 * and a pricing page that disagreed with it would be the more expensive bug.
 *
 * The free plan's shape — $1.00, 60s, 100 threads, one slot — is the plan the
 * captured `/api/user/me` response actually returned, so it is evidence rather
 * than invention. The paid prices are the ones these files already carried.
 *
 * `features` holds translation *keys*, not copy. `planPerks` resolves them
 * through `pricing.perk_*` and falls back to the raw string, so a feature the
 * backend sends in prose still renders as prose.
 */
export const FALLBACK_PLANS: Plan[] = [
  {
    id: 1,
    name: "Free",
    price: "1.00",
    tier: "free",
    maxDuration: 60,
    maxThreads: 100,
    maxConcurrent: 1,
    features: ["freeMethod"],
  },
  {
    id: 2,
    name: "Basic",
    price: "30.00",
    tier: "basic",
    maxDuration: 600,
    maxThreads: 1_000,
    maxConcurrent: 1,
    features: ["fullCatalogue", "apiAccess"],
  },
  {
    id: 3,
    name: "Business",
    price: "3000.00",
    tier: "business",
    maxDuration: 86_400,
    maxThreads: 10_000,
    maxConcurrent: 100,
    features: ["fullCatalogue", "apiAccess", "support", "privateOnRequest"],
  },
];

/**
 * The rung worth marking as the recommended one.
 *
 * `Basic` rather than the top tier: it is the plan that changes what the product
 * can do — it is the one that opens the transport layer and the rest of the
 * catalogue — so it is the decision, and the decision should be the obvious one.
 */
export function featuredPlanIndex(plans: Plan[]): number {
  const basic = plans.findIndex((p) => p.tier === "basic");
  if (basic >= 0) return basic;
  // No Basic rung in the live catalogue: fall back to the second card, which is
  // the cheapest paid one on any ladder that has a free rung first.
  return Math.min(1, Math.max(0, plans.length - 1));
}
