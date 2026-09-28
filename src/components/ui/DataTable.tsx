"use client";

/**
 * The product's one data table.
 *
 * Three places in the app render tabular data — the test log, the DNS record
 * viewer and the certificate-transparency list — and each had grown its own
 * table. They disagreed on almost everything: one had a bordered container, one
 * was a bare `<table>` inside a padded card, one used `border-collapse`, and all
 * three had a different idea of what a header row looked like. The result read
 * as three unrelated screens, and none of them behaved like a table.
 *
 * This is the shared answer, and the specific things it fixes:
 *
 *   · **A header that stays put.** `sticky top-0` on a surface background, so
 *     the column labels are still there when you have scrolled a hundred rows
 *     down. Every table in the product is taller than most viewports.
 *   · **Scanability.** Hairline row rules at 60% of the normal line colour,
 *     tabular figures in every numeric column, and a column-level text colour
 *     discipline — labels are `fg-subtle`, values are `fg`. Align numbers to the
 *     end, text to the start, so a column of values scans as an edge.
 *   · **A hover target that is a row, not a cell.** The whole `<tr>` lights up,
 *     so the eye is not chasing a highlight across eight separate rectangles.
 *   · **Honest state.** Skeleton rows while loading, a designed empty state
 *     rather than a blank area, and a row count in the footer — because "did
 *     that actually return anything?" is the first question a lookup raises and
 *     an unlabelled scroll region cannot answer it.
 *   · **Escape hatches on narrow screens.** Below `sm` the table scrolls
 *     horizontally with a minimum width per column, instead of collapsing
 *     columns until the values are unreadable. The alternative — hiding
 *     columns — hides exactly the value the user came for.
 *
 * Columns are declared as data rather than written out as `<th>`/`<td>` at each
 * call site, which is what lets one component own alignment, padding, hover and
 * header behaviour instead of leaving it to whoever writes the next table.
 */
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type DataTableAlign = "start" | "end";

export type DataTableColumn<Row> = {
  /** Stable key; also the default header label, so pass a real string. */
  key: string;
  header: string;
  align?: DataTableAlign;
  /**
   * Per-column minimum width in px. Below it the column scrolls rather than
   * squeezes — most important for the value column, which is the reason the
   * table is open.
   */
  minWidth?: number;
  /** Hide on very narrow screens. Reserve for secondary columns. */
  hideBelow?: "sm" | "md" | "lg";
  /** Monospace figures and glyphs. Right for ids, hosts, counts, durations. */
  numeric?: boolean;
  /** Rendered in `fg-subtle` at `2xs`, for values that are not the point. */
  quiet?: boolean;
  /** A short string or node for the row, when the row is a link or a button. */
  className?: string;
  cell: (row: Row, index: number) => ReactNode;
};

const HIDE_CLASS: Record<NonNullable<DataTableColumn<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

function alignClass(align: DataTableAlign = "start") {
  return align === "end" ? "text-end" : "text-start";
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  caption,
  loading,
  loadingRows = 5,
  empty,
  footer,
  containerClassName,
  maxHeight,
}: {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  /** Makes a row interactive. Omit for a read-only table. */
  onRowClick?: (row: Row) => void;
  /** Screen-reader caption. Also the source of the visible title if needed. */
  caption: string;
  loading?: boolean;
  loadingRows?: number;
  empty?: ReactNode;
  /** Right-hand slot in the footer, e.g. a copy-all action. */
  footer?: ReactNode;
  /** Applied to the outer panel, so callers can control the radius. */
  containerClassName?: string;
  /**
   * Caps the scrolling area, which is what makes the sticky header stick.
   *
   * `overflow-x` alone is not enough: setting it makes the element a scroll
   * container in both axes, but the element then grows to fit its content and
   * never scrolls vertically, so a `sticky` header has no scrollport to stick
   * to and simply travels away with the page. Bounding the height gives the
   * header a real scrollport to pin inside, and keeps a 400-row result from
   * pushing the controls it belongs to off the screen.
   */
  maxHeight?: number;
}) {
  const isEmpty = rows.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface",
        "transition-[border-color] duration-300 hover:border-line-strong",
        containerClassName,
      )}
    >
      <div
        className="min-w-0 overflow-auto"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className="w-full border-collapse">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line">
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                  className={cn(
                    "sticky top-0 z-10 bg-surface px-4 py-3 text-2xs font-semibold uppercase tracking-[0.1em] text-fg-subtle",
                    alignClass(col.align),
                    col.numeric && "tabular",
                    col.hideBelow && HIDE_CLASS[col.hideBelow],
                    i === 0 ? "ps-5" : "",
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && isEmpty
              ? Array.from({ length: loadingRows }, (_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-line/60 last:border-0">
                    {columns.map((col, j) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3.5",
                          alignClass(col.align),
                          col.hideBelow && HIDE_CLASS[col.hideBelow],
                          i === 0 && j === 0 ? "ps-5" : "",
                        )}                      >
                        <span className="skeleton block h-3 rounded-full" style={{ width: `${45 + ((i * 13 + j * 29) % 45)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : null}

            {!loading &&
              rows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "group border-b border-line/60 transition-colors last:border-0",
                    onRowClick ? "cursor-pointer hover:bg-surface-hover" : "hover:bg-surface-hover/60",
                  )}
                >
                  {columns.map((col, j) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3",
                        alignClass(col.align),
                        col.numeric && "tabular",
                        col.quiet && "text-2xs text-fg-subtle",
                        col.hideBelow && HIDE_CLASS[col.hideBelow],
                        col.className,
                        index === 0 && j === 0 ? "ps-5" : "",
                      )}
                    >
                      {col.cell(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && isEmpty && empty ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          {empty}
        </div>
      ) : null}

      {/* Row count, so a result set is legible as a number rather than as a
          scroll region the user has to measure by eye. */}
      {!loading && !isEmpty ? (
        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-2.5">
          <span className="tabular text-2xs text-fg-subtle">
            {rows.length} {caption}
          </span>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
