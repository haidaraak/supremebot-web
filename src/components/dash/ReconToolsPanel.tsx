"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Network,
  ShieldCheck,
  Search,
  Loader2,
  AlertCircle,
  CircleSlash,
  Check,
  Copy,
  Server,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { cn } from "@/lib/cn";

/**
 * Free recon utilities. Each tool talks to a public no-signup source through
 * the scoped /api/tools bridge — never to a user-supplied URL — so the panel
 * cannot be aimed at anything the operator has not vetted.
 *
 * Framed for reconnaissance of infrastructure the user owns or is authorised to
 * assess: enumerating your own certificate footprint, probing your own host.
 *
 * All three results render through the shared `DataTable`. They used to be three
 * different things — a wall of wrapping chips, a two-column definition list, and
 * a bare `<table>` with `border-collapse` — which meant the same panel changed
 * shape every time the tab changed, and none of the three let you read a value
 * you had to compare against a column of others. A lookup's output is a table;
 * it is now always a table, with a pinned header, aligned numeric columns, a
 * row count and a copy action.
 *
 * The panel itself is chrome-free so it can sit in a landing section or a
 * dashboard tile; the surrounding page supplies the framing.
 */

type Tab = "subdomains" | "host" | "headers";

type SubResult = {
  host: string;
  count: number;
  subdomains: string[];
  wildcards: string[];
  tookMs: number;
};
type HeadResult = {
  host: string;
  url: string;
  redirected: boolean;
  status: number;
  ok: boolean;
  contentType: string | null;
  server: string | null;
  security: Array<{ name: string; value: string | null }>;
  tookMs: number;
};

type DnsResult = {
  host: string;
  nxdomain: boolean;
  records: Array<{ type: string; name: string; ttl: number; value: string }>;
  cdnHint: string | null;
  tookMs: number;
};

const TABS: Array<{ key: Tab; icon: typeof Globe }> = [
  { key: "subdomains", icon: Globe },
  { key: "host", icon: Network },
  { key: "headers", icon: ShieldCheck },
];

export function ReconToolsPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("subdomains");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subs, setSubs] = useState<SubResult | null>(null);
  const [heads, setHeads] = useState<HeadResult | null>(null);
  const [dns, setDns] = useState<DnsResult | null>(null);

  const result = tab === "subdomains" ? subs : tab === "headers" ? heads : dns;

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const host = query.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!host || !/\./.test(host)) {
      setError(t("tools.errorHost"));
      return;
    }
    setLoading(true);
    setError(null);
    setSubs(null);
    setHeads(null);
    setDns(null);
    try {
      const res = await fetch(`/api/tools/${tab}?host=${encodeURIComponent(host)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(String(data?.error ?? "lookup failed"));
      if (tab === "subdomains") setSubs(data as SubResult);
      else if (tab === "headers") setHeads(data as HeadResult);
      else setDns(data as DnsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("tools.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Control rail */}
      <div className="relative overflow-hidden rounded-[18px] border border-line bg-surface p-6">
        <div className="relative mb-5 flex gap-2 rounded-[12px] border border-line bg-input p-1">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setError(null);
              }}
              aria-pressed={tab === key}
              className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-2 text-xs font-semibold transition-all duration-200",
                tab === key
                  ? "bg-accent text-on-accent "
                  : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon className="size-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">{t(`tools.tab_${key}`)}</span>
            </button>
          ))}
        </div>

        <form onSubmit={onSearch} className="relative flex flex-col gap-3">
          <label className="text-xs font-medium text-fg-muted">
            {t(`tools.label_${tab}`)}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(`tools.placeholder_${tab}`)}
              autoComplete="off"
              spellCheck={false}
              className="tabular h-11 flex-1 rounded-[11px] border border-line-strong bg-input px-3.5 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent/60"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-accent text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
              aria-label={t("tools.search")}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.2} />
              ) : (
                <Search className="size-4" strokeWidth={2.2} />
              )}
            </button>
          </div>
          <p className="text-2xs leading-[1.55] text-fg-subtle">
            {t("tools.scopeNote")}
          </p>
        </form>

        {error && (
          <div className="relative mt-4 flex items-start gap-2 rounded-[10px] border border-bad/25 bg-bad/8 px-3 py-2.5 text-xs text-bad">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}
      </div>

      {/* Result pane */}
      <div className="relative min-h-[280px] overflow-hidden rounded-[18px] border border-line bg-surface p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-0 opacity-25" />
        {loading ? (
          <div className="relative flex h-full min-h-[230px] flex-col items-center justify-center gap-3 text-fg-subtle">
            <Loader2 className="size-6 animate-spin text-accent" strokeWidth={1.8} />
            <span className="text-sm">{t("tools.querying")}</span>
          </div>
        ) : result ? (
          tab === "subdomains" && subs ? (
            <SubdomainResults result={subs} t={t} />
          ) : tab === "headers" && heads ? (
            <HeaderResults result={heads} t={t} />
          ) : dns ? (
            <DnsResults result={dns} t={t} />
          ) : null
        ) : (
          <div className="relative flex h-full min-h-[230px] flex-col items-center justify-center gap-3 text-center">
            <Network className="size-7 text-fg-subtle" strokeWidth={1.4} />
            <p className="max-w-[320px] text-sm leading-[1.6] text-fg-subtle">
              {t("tools.empty")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type TFunc = (k: string, o?: Record<string, unknown>) => string;

/* ── Copy affordance ───────────────────────────────────────────── */

/**
 * A copy action that reports what it did.
 *
 * The two things worth knowing about a copied result are that it happened and
 * that it is now on the clipboard, and a button that changes neither leaves the
 * user clicking it again to check. The label swaps to a tick for two seconds and
 * then restores itself.
 */
function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 2000);
        });
      }}
      aria-label={done ? t("tools.copied") : label}
      className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2 py-1 text-2xs font-medium text-fg-subtle transition-colors hover:border-line-strong hover:text-fg"
    >
      {done ? (
        <Check className="size-3" strokeWidth={2.4} />
      ) : (
        <Copy className="size-3" strokeWidth={2.2} />
      )}
      {done ? t("tools.copied") : label}
    </button>
  );
}

/** Shared empty state, so all three lookups fail the same way. */
function ResultEmpty({ message }: { message: string }) {
  return (
    <>
      <CircleSlash className="size-7 text-fg-subtle" strokeWidth={1.4} />
      <p className="max-w-[340px] text-sm leading-[1.6] text-fg-subtle">{message}</p>
    </>
  );
}

/* ── Subdomains ────────────────────────────────────────────────── */

function SubdomainResults({ result, t }: { result: SubResult; t: TFunc }) {
  const list = result.subdomains.slice(0, 200);

  const columns: DataTableColumn<string>[] = [
    {
      key: "name",
      header: t("tools.colName"),
      minWidth: 260,
      cell: (name) => (
        <span className="block truncate text-xs text-fg" title={name}>
          {name}
        </span>
      ),
    },
    {
      key: "depth",
      header: t("tools.colDepth"),
      minWidth: 110,
      align: "end",
      numeric: true,
      cell: (name) => (
        <span className="text-2xs text-fg-subtle">
          {name.split(".").length - (result.host.split(".").length - 1)}
        </span>
      ),
    },
  ];

  return (
    <div className="relative flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ResultHeader title={t("tools.foundTitle", { host: result.host })} />
        <div className="flex items-center gap-2.5">
          <span className="tabular text-2xs text-fg-subtle">
            {result.tookMs}ms
          </span>
          {result.count > 0 && (
            <CopyButton value={list.join("\n")} label={t("tools.copyAll")} />
          )}
        </div>
      </div>

      {result.count === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <ResultEmpty message={t("tools.noneFound")} />
        </div>
      ) : (
        <>
          <DataTable<string>
            columns={columns}
            rows={list}
            rowKey={(name) => name}
            caption={t("tools.subdomainCaption")}
            // Bounded so the panel's controls stay on screen, and so the pinned
            // header has a scrollport to pin to.
            maxHeight={340}
          />
          {result.count > list.length && (
            <p className="text-2xs text-fg-subtle">
              {t("tools.truncated", { shown: list.length, total: result.count })}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ── Headers ───────────────────────────────────────────────────── */

function HeaderResults({ result, t }: { result: HeadResult; t: TFunc }) {
  const rows = [
    { key: "server", label: t("tools.rowServer"), value: result.server ?? "—", mono: true },
    { key: "type", label: t("tools.rowType"), value: result.contentType ?? "—", mono: true },
    {
      key: "redirect",
      label: t("tools.rowRedirect"),
      value: result.redirected ? t("common.yes") : t("common.no"),
      mono: false,
    },
    {
      key: "tls",
      label: t("tools.rowTls"),
      value: result.url.startsWith("https") ? t("common.yes") : t("common.no"),
      mono: false,
    },
    {
      key: "status",
      label: t("tools.rowStatus"),
      value: String(result.status),
      mono: true,
    },
  ];

  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    {
      key: "label",
      header: t("tools.colField"),
      minWidth: 160,
      cell: (r) => <span className="text-xs text-fg-muted">{r.label}</span>,
    },
    {
      key: "value",
      header: t("tools.colValue"),
      minWidth: 220,
      align: "end",
      cell: (r) => (
        <span
          className={cn(
            "block truncate text-xs text-fg",
            r.mono && "tabular",
          )}
          title={r.value}
        >
          {r.value}
        </span>
      ),
    },
  ];

  return (
    <div className="relative flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "tabular inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
              result.ok ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                result.ok ? "bg-current pulse-dot" : "bg-current",
              )}
            />
            {result.status}
          </span>
          <span className="tabular min-w-0 truncate text-xs text-fg-muted" title={result.url}>
            {result.url}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="tabular text-2xs text-fg-subtle">
            {result.tookMs}ms
          </span>
          <CopyButton value={result.url} label={t("tools.copyUrl")} />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.key}
        caption={t("tools.responseCaption")}
      />

      <div>
        <h4 className="text-2xs font-semibold uppercase tracking-[0.1em] text-fg-subtle">
          {t("tools.securityHeaders")}
        </h4>

        {result.security.length === 0 ? (
          <p className="mt-3 text-xs text-fg-subtle">{t("tools.noHeaders")}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1.5">
            {result.security.map((h) => (
              <li
                key={h.name}
                className="flex items-center justify-between gap-3 border-b border-line/60 pb-1.5 text-xs last:border-0">
                <span className="tabular shrink-0 text-fg-muted">{h.name}</span>
                {h.value ? (
                  <span className="tabular flex min-w-0 items-center gap-2 text-ok">
                    <ShieldCheck className="size-3.5 shrink-0" strokeWidth={2.2} />
                    <span className="truncate text-fg" title={h.value}>
                      {h.value}
                    </span>
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-2 text-fg-subtle">
                    <span className="size-3.5 rounded-full border border-current" />
                    {t("tools.absent")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ── DNS ───────────────────────────────────────────────────────── */

function DnsResults({ result, t }: { result: DnsResult; t: TFunc }) {
  const columns: DataTableColumn<DnsResult["records"][number]>[] = [
    {
      key: "type",
      header: t("tools.colType"),
      minWidth: 92,
      cell: (r) => (
        <span
          className={cn(
            "tabular inline-flex rounded-[6px] px-2 py-0.5 text-2xs font-semibold",
            RECORD_TONE[r.type.toUpperCase()] ?? "border border-line bg-surface-2 text-fg-muted",
          )}
        >
          {r.type}
        </span>
      ),
    },
    {
      key: "name",
      header: t("tools.colName"),
      minWidth: 200,
      cell: (r) => (
        <span className="tabular block truncate text-xs text-fg-muted" title={r.name}>
          {r.name}
        </span>
      ),
    },
    {
      key: "ttl",
      header: t("tools.colTtl"),
      minWidth: 92,
      align: "end",
      numeric: true,
      cell: (r) => <span className="text-2xs text-fg-subtle">{r.ttl}</span>,
    },
    {
      key: "value",
      header: t("tools.colValue"),
      minWidth: 280,
      hideBelow: "md",
      cell: (r) => (
        <span className="tabular block truncate text-xs text-fg" title={r.value}>
          {r.value}
        </span>
      ),
    },
  ];

  return (
    <div className="relative flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ResultHeader title={t("tools.dnsTitle", { host: result.host })} />
        <div className="flex items-center gap-2.5">
          <span className="tabular text-2xs text-fg-subtle">
            {result.tookMs}ms
          </span>
          {result.records.length > 0 && (
            <CopyButton
              value={result.records.map((r) => `${r.name}\t${r.ttl}\t${r.type}\t${r.value}`).join("\n")}
              label={t("tools.copyZone")}
            />
          )}
        </div>
      </div>

      {result.nxdomain || result.records.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <ResultEmpty
            message={
              result.nxdomain
                ? t("tools.nxdomain", { host: result.host })
                : t("tools.noRecords")
            }
          />
        </div>
      ) : (
        <>
          {result.cdnHint && (
            <div className="flex items-start gap-2.5 rounded-[12px] border border-line bg-surface-2 px-3.5 py-3">
              <Globe className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.9} />
              <p className="text-xs leading-[1.6] text-fg-muted">
                <span className="font-semibold text-fg">
                  {t("tools.cdnHintLabel")}{" "}
                </span>
                <span className="tabular">{result.cdnHint}</span>
                <span className="mt-1 block text-2xs text-fg-subtle">
                  {t("tools.cdnHintNote")}
                </span>
              </p>
            </div>
          )}

          <DataTable
            columns={columns}
            rows={result.records}
            rowKey={(r, i) => `${r.type}-${r.name}-${i}`}
            caption={t("tools.recordCaption")}
            maxHeight={360}
          />
        </>
      )}
    </div>
  );
}

/**
 * Record types get a shape rather than a colour.
 *
 * The design system reserves hue for state that needs attention, and a DNS
 * record type is not state — it is a fact about a zone. So A/AAAA/CNAME and
 * friends are distinguished by border weight alone, which survives both themes
 * and does not imply that a TXT record is more important than an NS one.
 */
const RECORD_TONE: Record<string, string> = {
  A: "border border-line-strong bg-surface-2 text-fg",
  AAAA: "border border-line-strong bg-surface-2 text-fg",
  CNAME: "border border-line bg-transparent text-fg-muted",
  NS: "border border-line bg-transparent text-fg-muted",
  TXT: "border border-dashed border-line bg-transparent text-fg-subtle",
  MX: "border border-dashed border-line bg-transparent text-fg-subtle",
  SOA: "border border-dashed border-line bg-transparent text-fg-subtle",
  SRV: "border border-dashed border-line bg-transparent text-fg-subtle",
  CAA: "border border-dashed border-line bg-transparent text-fg-subtle",
};

/** Title row shared by the two result sets that name their subject. */
function ResultHeader({ title }: { title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Server className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.9} />
      <h3 className="truncate text-sm font-semibold text-fg" title={title}>
        {title}
      </h3>
    </div>
  );
}
