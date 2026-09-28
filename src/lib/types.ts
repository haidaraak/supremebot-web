/* ============================================================
   Domain types — mirror the backend payloads captured in the
   HAR (supremex.zip). The frontend consumes these verbatim; no
   backend code was modified.
   ============================================================ */

export type Role = "user" | "admin" | string;

/**
 * The three tiers a method is sold under.
 *
 * These mirror the plan ladder in `lib/entitlements.ts` — `free`, `basic`,
 * `private` — rather than being a separate vocabulary, so a method's tier and
 * the account's plan are the same words in the UI. (The middle tier was called
 * `vip` while the plan was called `Basic`, which meant the picker labelled a
 * lock with a word that appeared nowhere on the pricing page.)
 *
 * A method normally belongs to exactly one tier; `Method.tiers` exists because
 * a couple are deliberately sold in two at once (FREE-TLS is both the free
 * layer-7 method and a paid-tier one).
 */
export type MethodTier = "free" | "basic" | "private";

export interface Plan {
  id: number;
  name: string;
  price: string | number;
  tier?: string | null;
  billingType?: string | null;
  maxDuration: number;
  maxThreads: number;
  maxConcurrent: number;
  features?: string[] | null;
  createdAt?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  balance: string;
  apiKey: string | null;
  status: string;
  planId: number;
  apiAccess?: boolean;
  maxConcurrentOverride?: number | null;
  maxDurationOverride?: number | null;
  maxThreadsOverride?: number | null;
  createdAt?: string;
  lastLogin?: string;
  plan?: Plan;
}

export interface Attack {
  id: number;
  userId: number;
  externalAttackId: string;
  target: string;
  method: string;
  duration: number;
  threads: number;
  status: "running" | "stopped" | "completed" | "failed" | "queued" | string;
  packetsSent: number;
  bandwidthUsed: number;
  createdAt: string;
  endedAt: string | null;
}

/** /api/methods returns 304 cached in the HAR — normalize defensively. */
export interface Method {
  id?: number;
  name: string;
  description?: string | null;
  layer?: number | string | null;
  premium?: boolean;
  available?: boolean;
  /** Every tier this method is sold under. Defaults to the single derived tier. */
  tiers?: MethodTier[];
}

export interface Announcement {
  id: number;
  title: string;
  content?: string | null;
  createdAt?: string;
  active?: boolean;
}

export interface MaintenanceStatus {
  maintenance: boolean;
  is_under_maintenance?: boolean;
}

export interface AdminAnnouncement extends Announcement {
  active?: boolean;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers?: number;
  totalAttacks?: number;
  activeAttacks?: number;
  totalRevenue?: number;
  last24h?: Record<string, unknown>;
}

/* Derived helpers */

export function maxDurationOf(user?: User | null): number {
  if (!user) return 60;
  return user.maxDurationOverride ?? user.plan?.maxDuration ?? 60;
}

export function maxConcurrentOf(user?: User | null): number {
  if (!user) return 1;
  return user.maxConcurrentOverride ?? user.plan?.maxConcurrent ?? 1;
}

export function maxThreadsOf(user?: User | null): number {
  if (!user) return 100;
  return user.maxThreadsOverride ?? user.plan?.maxThreads ?? 100;
}
