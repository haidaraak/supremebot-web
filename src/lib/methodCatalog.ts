import type { Method } from "./types";

/* ============================================================
   Default method catalogue.
   ------------------------------------------------------------
   /api/methods appears twice in the captured traffic and both
   responses are 304 with no body, so the backend never actually
   told us which methods it sells. The only two method names
   evidenced anywhere in the HAR are:

     FREE-TLS  — the method used in the real /api/attacks POST,
                 by an account on the `Free` plan
     UDP-PPS   — appears only as an example in the developer
                 console's own API documentation

   Everything else below is a fallback for the shape of catalogue
   a service of this class exposes. The live /methods response
   always wins — see normalizeMethods in the launch page — so
   this only paints the UI when the backend is silent.

   Every entry declares its tier explicitly rather than relying on
   the `premium` flag, because the access rules in
   `lib/entitlements.ts` are read off the tier list:

     free     exactly one method, FREE-TLS, on layer 7.
              Layer 4 has no free method at all — the whole
              layer starts at `basic`.
     basic    everything else that is not private-tier.
     private  the PRIV-* methods, unlocked per account.

   Deriving the tier from `premium` alone would classify every
   unflagged L7 method as free, which is the opposite of the
   policy: a free account would see six methods it cannot launch.
   ============================================================ */

const HAR_EVIDENCED = new Set(["FREE-TLS", "UDP-PPS"]);

/** Shorthand for the three shapes of entry, so the table below stays readable. */
const free = (
  name: string,
  layer: 4 | 7,
  description: string,
  tiers?: Method["tiers"],
): Method => ({ name, layer, description, tiers });

const basic = (name: string, layer: 4 | 7, description: string): Method => ({
  name,
  layer,
  description,
  premium: true,
  tiers: ["basic"],
});

const priv = (name: string, layer: 4 | 7, description: string): Method => ({
  name,
  layer,
  description,
  premium: true,
  tiers: ["private"],
});

export const DEFAULT_METHODS: Method[] = [
  /* ── Layer 7 · application ───────────────────────────── */

  // The one method a free account can launch. Also sold on Basic, where it
  // remains the cheapest way to saturate a TLS terminator — so it is listed
  // under both tiers and `minimumTierOf` resolves it to `free`.
  free("FREE-TLS", 7, "TLS handshake exhaustion", ["free", "basic"]),

  basic("HTTP-GET", 7, "Plain GET request flood"),
  basic("HTTP-POST", 7, "POST body flood"),
  basic("HTTP-HEAD", 7, "Lightweight HEAD flood"),
  basic("HTTPS-GET", 7, "Encrypted GET flood"),
  basic("HTTPS-POST", 7, "Encrypted POST flood"),
  basic("HTTP-RAW", 7, "Raw HTTP/1.1 writer"),
  basic("SLOWLORIS", 7, "Slow header keep-alive"),

  priv("PRIV-HTTP-SOCKET", 7, "Long-lived socket drain"),
  priv("PRIV-CF-BYPASS", 7, "Edge protection bypass"),
  priv("PRIV-WS-FLOOD", 7, "WebSocket connection flood"),
  // Anything that spins up a real browser engine is private-tier only — it is
  // the most capable method in the catalogue and is unlocked per account, so
  // it closes the layer-7 list.
  priv("PRIV-BROWSER", 7, "Full browser-engine bypass"),

  /* ── Layer 4 · transport ──────────────────────────────
     No free entry exists in this list, and none should be added:
     the transport layer is a paid feature as a whole. `layerAvailable`
     in lib/entitlements.ts hides the tab from free accounts on the
     strength of that rule. */

  basic("TCP-RAW", 4, "Raw TCP stream flood"),
  basic("UDP-RAW", 4, "Raw UDP datagram flood"),
  basic("TCP-PPS", 4, "High packet-rate TCP"),
  basic("UDP-PPS", 4, "High packet-rate UDP"),

  basic("SYN-FLOOD", 4, "Half-open connection flood"),
  basic("ACK-FLOOD", 4, "ACK packet flood"),
  basic("GRE-FLOOD", 4, "GRE tunnel flood"),
  basic("UDP-FRAG", 4, "Fragmented UDP flood"),

  priv("PRIV-TCP-CONNECT", 4, "Full connection exhaustion"),
  priv("PRIV-ICMP-FLOOD", 4, "ICMP echo flood"),
  priv("PRIV-UDP-SRCPORT", 4, "Source-port rotation flood"),
];

/** True for the two names that actually occur in the captured traffic. */
export function isHarEvidenced(name: string): boolean {
  return HAR_EVIDENCED.has(name);
}
