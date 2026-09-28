import type { Method } from "@/lib/types";

export type Layer = 4 | 7;

/* /api/methods came back 304-cached in the HAR, so we cannot rely on the
 * backend telling us which layer a method belongs to. Prefer an explicit
 * field when present, otherwise classify by name — the vocabulary these
 * platforms use is small and consistent. */
const L7_HINTS = [
  "http", "https", "tls", "ssl", "cf-", "cloudflare", "browser",
  "slow", "head", "get", "post", "flood",
];
const L4_HINTS = [
  "tcp", "udp", "syn", "icmp", "amp", "dns", "ntp", "memcached",
  "cldap", "rdp", "snmp", "wsd",
];

export function inferLayerByName(name: string): Layer {
  const lower = name.toLowerCase();
  if (L7_HINTS.some((h) => lower.includes(h))) return 7;
  if (L4_HINTS.some((h) => lower.includes(h))) return 4;
  return 7;
}

export function layerOf(method: Method): Layer {
  const raw = method.layer;
  if (raw === 4 || raw === "4" || raw === "L4") return 4;
  if (raw === 7 || raw === "7" || raw === "L7") return 7;
  return inferLayerByName(method.name);
}
