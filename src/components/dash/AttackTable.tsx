"use client";

import { useTranslation } from "react-i18next";
import { Rocket } from "lucide-react";

import type { Attack } from "@/lib/types";
import { useCountdown, fmtCountdown } from "@/lib/useCountdown";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<string, string> = {
  running: "text-ok bg-ok/12",
  queued: "text-info bg-info/12",
  stopped: "text-warn bg-warn/12",
  completed: "text-fg-muted bg-surface-3",
  failed: "text-bad bg-bad/12",
};

function fmtBandwidth(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 2 : 0)} ${units[i]}`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ============================================================
   Per-row countdown.
   ------------------------------------------------------------
   The table's own status readout. A finished test shows nothing
   here but a dash — the status pill already says how it ended.
   A live one shows the remaining window as a small ring plus a
   ticking readout, driven by the same wall-clock math the
   dashboard's CountdownRing uses, so the two never drift.
   ============================================================ */

const ROW_R = 9;
const ROW_CIRC = 2 * Math.PI * ROW_R;

function RemainingCell({ attack }: { attack: Attack }) {
  const live = attack.status === "running" || attack.status === "queued";
  const c = useCountdown(attack.createdAt, attack.duration, attack.endedAt, live);

  if (!live) {
    return <span className="text-xs text-fg-subtle">–</span>;
  }

  const dash = c.duration > 0 ? ROW_CIRC * c.progress : 0;
  const finishing = c.remaining <= 10 && !c.finished;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex size-6">
        <svg viewBox="0 0 24 24" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="12" cy="12" r={ROW_R} fill="none" stroke="var(--color-line-strong)" strokeWidth="2.5" />
          <circle
            cx="12"
            cy="12"
            r={ROW_R}
            fill="none"
            stroke={finishing ? "var(--color-fg-subtle)" : "var(--color-state)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${ROW_CIRC}`}
            className="transition-[stroke-dasharray] duration-1000 ease-linear"
          />
        </svg>
        <span
          className={cn("absolute inset-0 grid place-items-center",
            finishing && "animate-pulse",
          )}
        >
          <span
            className={cn("size-1.5 rounded-full",
              finishing ? "bg-warn" : "bg-accent",
            )}
          />
        </span>
      </span>
      <span
        className={cn("text-xs font-medium",
          finishing ? "text-warn" : "text-fg",
          c.finished && "text-fg-subtle",
        )}
      >
        {c.finished ? "00:00" : fmtCountdown(c.remaining)}
      </span>
    </span>
  );
}

/**
 * The test log.
 *
 * Now a set of column declarations over the shared `DataTable`, so it gets the
 * same pinned header, row hover, alignment and empty state as every other table
 * in the product — the log was the one table that had its own idea of all four.
 */
export function AttackTable({
  attacks,
  loading,
  emptyHint,
  onReattack,
}: {
  attacks: Attack[];
  loading: boolean;
  emptyHint?: string;
  onReattack?: (attack: Attack) => void;
}) {
  const { t } = useTranslation();

  const columns: DataTableColumn<Attack>[] = [
    {
      key: "id",
      header: t("attacks.id"),
      minWidth: 64,
      numeric: true,
      quiet: true,
      cell: (a) => <span className="text-xs text-fg-subtle">#{a.id}</span>,
    },
    {
      key: "target",
      header: t("attacks.target"),
      minWidth: 200,
      cell: (a) => (
        <span className="block truncate text-xs font-medium text-fg" title={a.target}>
          {a.target}
        </span>
      ),
    },
    {
      key: "method",
      header: t("attacks.method"),
      minWidth: 130,
      cell: (a) => (
        <span className="inline-block rounded-md bg-surface-3 px-2 py-0.5 text-2xs text-fg-muted">
          {a.method}
        </span>
      ),
    },
    {
      key: "duration",
      header: t("attacks.duration"),
      minWidth: 92,
      numeric: true,
      align: "end",
      cell: (a) => <span className="text-xs text-fg-muted">{a.duration}s</span>,
    },
    {
      key: "remaining",
      header: t("attacks.remaining"),
      minWidth: 132,
      align: "end",
      cell: (a) => <RemainingCell attack={a} />,
    },
    {
      key: "status",
      header: t("attacks.status"),
      minWidth: 118,
      cell: (a) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-medium",
            STATUS_STYLES[a.status] ?? STATUS_STYLES.completed,
          )}
        >
          {a.status === "running" && (
            <span className="pulse-dot size-1.5 rounded-full bg-current text-current" />
          )}
          {t(`attacks.${a.status}`, { defaultValue: a.status })}
        </span>
      ),
    },
    {
      key: "packets",
      header: t("attacks.packets"),
      minWidth: 168,
      align: "end",
      numeric: true,
      cell: (a) => (
        <>
          {a.packetsSent.toLocaleString()}
          <span className="ms-1.5 text-2xs text-fg-subtle">
            {fmtBandwidth(a.bandwidthUsed)}
          </span>
        </>
      ),
    },
     {
      key: "started",
      header: t("attacks.started"),
      minWidth: 150,
      align: "end",
      numeric: true,
      quiet: true,
      hideBelow: "lg",
      cell: (a) => fmtDate(a.createdAt),
    },
    ...(onReattack
      ? [
          {
            key: "reattack",
            header: "",
            minWidth: 80,
            cell: (a: Attack) => (
              <button
                type="button"
                onClick={() => onReattack(a)}
                disabled={a.status === "running" || a.status === "queued"}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-surface-2 px-2 text-xs font-medium text-fg-muted transition-colors hover:border-accent/35 hover:text-accent disabled:opacity-40"
                title="Use this attack as a preset"
              >
                <Rocket className="size-3.5" strokeWidth={2.2} />
                Use
              </button>
            ),
          },
        ]
      : []),
  ];

  if (loading && attacks.length === 0) {
    return <DataTable<Attack> columns={columns} rows={[]} rowKey={(a) => String(a.id)} caption={t("attacks.title")} loading />;
  }

  if (attacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-line-strong bg-surface/40 py-14 text-center">
        <div className="flex size-11 items-center justify-center rounded-[12px] border border-line bg-surface-2 text-fg-subtle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h4.5l1.5 -6l4 12l2 -9l1.5 3h4.5" />
          </svg>
        </div>
        <p className="text-sm text-fg-muted">
          {emptyHint ?? t("attacks.empty")}
        </p>
      </div>
    );
  }

  return (
    <DataTable<Attack>
      columns={columns}
      rows={attacks}
      rowKey={(a) => String(a.id)}
      caption={t("attacks.tableCaption")}
      maxHeight={520}
    />
  );
}
