import type { Method, MethodTier, User } from "./types";
import { tiersOf } from "./methodCategory";
import type { Layer } from "./layer";

/* ============================================================
   Access tiers — what the account is allowed to launch.
   ------------------------------------------------------------
   The commercial policy the launch form states out loud:

     free     exactly one method, FREE-TLS, on layer 7.
              Layer 4 has no free offering at all.
     basic    the full layer 7 and layer 4 catalogue.
     private  the private-tier methods, unlocked per account.

   This is a *presentation* of the policy, not an enforcement of
   it. The backend is the only thing that can refuse a launch, and
   it must — anything a browser can decide, a user can bypass by
   editing a request. What this module buys is that the form never
   offers a method the account cannot use, and never hides one it
   can: a locked method is shown, labelled, and priced, because an
   invisible method is an upsell that never happens.
   ============================================================ */

export type AccessTier = "free" | "basic" | "private";

const RANK: Record<AccessTier, number> = { free: 0, basic: 1, private: 2 };

/**
 * Plan tier strings the backend has used, mapped onto the access ladder.
 *
 * The one evidenced in the captured traffic is `"free"` (plan `Free`,
 * `maxDuration` 60, `maxConcurrent` 1). The rest are here so a plan added
 * under an older name still resolves rather than silently demoting a paying
 * account to the free ladder.
 *
 * An unrecognised tier resolves to `free`, not to `basic`. A gate that fails
 * closed can only ever show too few methods, which the user can report; a gate
 * that fails open shows methods the launch will be rejected for, which looks
 * like a broken product. Add a row here when a new plan is introduced.
 */
const PLAN_TIERS: Record<string, AccessTier> = {
  free: "free",
  trial: "free",
  guest: "free",

  basic: "basic",
  starter: "basic",
  standard: "basic",
  pro: "basic",
  business: "basic",
  premium: "basic",
  paid: "basic",

  private: "private",
  custom: "private",
};

/** The access tier an account currently holds. */
export function accessTierOf(user?: User | null): AccessTier {
  if (user?.role === "admin") return "private";

  const raw = (user?.plan?.tier ?? "").trim().toLowerCase();
  if (!raw) return "free";
  return PLAN_TIERS[raw] ?? "free";
}

/**
 * The cheapest tier that sells a method.
 *
 * A method sold in two tiers — FREE-TLS is both the free layer-7 method and a
 * paid-tier one — is reachable at the *cheapest* of them, otherwise the free
 * account would be locked out of the one method it is meant to have.
 */
export function minimumTierOf(method: Method): AccessTier {
  const tiers = tiersOf(method);
  let best: AccessTier = "private";
  for (const tier of tiers) {
    if (RANK[tier] < RANK[best]) best = tier;
  }
  return best;
}

/** The tier required to launch this method, or `null` when the account has it. */
export function requiredTierFor(
  method: Method,
  access: AccessTier,
): AccessTier | null {
  const required = minimumTierOf(method);
  return RANK[access] >= RANK[required] ? null : required;
}

export function canLaunch(method: Method, access: AccessTier): boolean {
  return method.available !== false && requiredTierFor(method, access) === null;
}

/**
 * Whether a layer offers anything at all to this account.
 *
 * Layer 4 is Basic and above. A free account still gets the layer-4 *tab* — an
 * empty tab is a dead end, whereas a tab showing the transport catalogue with
 * every method locked is the clearest possible statement of what upgrading
 * buys, and the tab is where the user already is when they look for it.
 */
export function layerAvailable(layer: Layer, access: AccessTier): boolean {
  if (layer === 4) return access !== "free";
  return true;
}

/** How many methods on this layer the account can actually launch. */
export function launchableCount(
  methods: Method[],
  access: AccessTier,
): number {
  return methods.filter((m) => canLaunch(m, access)).length;
}

/**
 * The single method a free account may launch.
 *
 * Named rather than derived from position in the list, so the free experience is
 * the same method on every account and does not shift when the catalogue is
 * reordered or the backend adds a name.
 */
export const FREE_METHOD = "FREE-TLS";

/** Re-exported so callers can label a lock without importing two modules. */
export type { MethodTier };
