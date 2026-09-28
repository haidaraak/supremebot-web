/* Compact, locale-independent number formatting for telemetry.
 * Used by the dashboard charts so 12,400,000 packets reads as 12.4M without
 * a 40-char Intl string. */

export function compactNumber(n: number): string {
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) return `${trim(n / 1000)}K`;
  if (n < 1_000_000_000) return `${trim(n / 1_000_000)}M`;
  return `${trim(n / 1_000_000_000)}B`;
}

function trim(n: number): string {
  return n >= 100 ? String(Math.round(n)) : n.toFixed(1);
}

/** Bandwidth arrives in bytes from the backend. */
export function compactBandwidth(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 ** 2) return `${compactNumber(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${compactNumber(bytes / 1024 ** 2)} MB`;
  return `${compactNumber(bytes / 1024 ** 3)} GB`;
}

/** Local-day key, used to bucket tests onto a chart axis. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
