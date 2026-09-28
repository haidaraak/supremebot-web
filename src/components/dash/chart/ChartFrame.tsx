"use client";

/**
 * Shared chart frame.
 *
 * Every chart in the dashboard was a hand-rolled SVG with
 * `preserveAspectRatio="none"`, which stretches the viewBox non-uniformly to fit
 * the container. Geometry survives that; text does not — every axis label in the
 * product was horizontally distorted. The frame removes the distortion by
 * measuring its container and drawing the SVG at real pixel dimensions, so one
 * SVG unit is one CSS pixel and type is never scaled.
 *
 * It also supplies the three things a telemetry chart needs and none of the old
 * ones had: a properly ticked value axis, a hover crosshair with a value
 * readout, and a hit area large enough to aim at with a mouse.
 */

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { cn } from "@/lib/cn";

/* ── Measurement ───────────────────────────────────────────────── */

export type Size = { width: number; height: number };

/**
 * Tracks an element's content box. Charts need the real width to place a
 * pixel-accurate axis, and a ResizeObserver is the only way to get it without
 * re-rendering on every window resize event.
 */
export function useMeasure<T extends HTMLElement>(): [RefObject<T | null>, Size] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

/* ── Axis ticks ────────────────────────────────────────────────── */

/**
 * "Nice" axis steps — 1, 2, 2.5 or 5 times a power of ten — so a peak of 1.1M
 * reads 0 / 250K / 500K / 750K / 1M / 1.25M instead of 0 / 183420 / 366841.
 */
export function niceTicks(max: number, target = 4): { step: number; ticks: number[] } {
  if (!Number.isFinite(max) || max <= 0) return { step: 1, ticks: [0, 1] };

  const rough = max / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;

  const stepMultiple =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;

  const step = stepMultiple * magnitude;
  const ticks: number[] = [];
  // One tick past the peak, so the top gridline sits above the data rather than
  // cutting through the tallest bar.
  for (let v = 0; v <= max + step * 0.5; v += step) ticks.push(Number(v.toFixed(10)));
  return { step, ticks };
}

/* ── Frame ─────────────────────────────────────────────────────── */

export type Plot = { x: number; y: number; width: number; height: number };

export type FrameRender = (args: {
  plot: Plot;
  /** Value → y pixel, in SVG space. */
  yFor: (value: number) => number;
  /** Column index → x pixel, in SVG space. */
  xFor: (index: number) => number;
  /** The value the axis was scaled to. */
  axisMax: number;
  /** Currently hovered column, or null. */
  hover: number | null;
  values: number[];
}) => ReactNode;

type FrameProps = {
  /** One entry per x position. Drives the axis scale and the hover readout. */
  values: number[];
  /** Formats axis labels and the readout. */
  formatValue: (value: number) => string;
  /** Optional caption for the readout, e.g. the day key. */
  formatCaption?: (index: number) => string;
  /** Accessible description of the whole chart. */
  ariaLabel: string;
  height?: number;
  className?: string;
  children: FrameRender;
};

const PAD_L = 48;
const PAD_R = 8;
const PAD_T = 10;
const PAD_B = 20;

export function ChartFrame({
  values,
  formatValue,
  formatCaption,
  ariaLabel,
  height = 180,
  className,
  children,
}: FrameProps) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const columns = values.length;

  const max = useMemo(() => Math.max(0, ...values), [values]);
  const { ticks } = useMemo(() => niceTicks(max), [max]);
  const axisMax = Math.max(ticks[ticks.length - 1] ?? 1, 1);

  // Before the first measurement (and during SSR) fall back to a width that
  // matches the design's content column, so the first paint is close to final.
  const width = size.width || 560;
  const plot: Plot = {
    x: PAD_L,
    y: PAD_T,
    width: Math.max(0, width - PAD_L - PAD_R),
    height: Math.max(0, height - PAD_T - PAD_B),
  };

  const yFor = useCallback(
    (value: number) => plot.y + plot.height - (value / axisMax) * plot.height,
    [plot.y, plot.height, axisMax],
  );

  const columnWidth = columns > 0 ? plot.width / columns : plot.width;
  const xFor = useCallback(
    (index: number) => plot.x + columnWidth * index + columnWidth / 2,
    [plot.x, columnWidth],
  );

  /** Maps a client x to the nearest column, so the whole plot is the hit area. */
  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || columns === 0) return;
      const bounds = el.getBoundingClientRect();
      const rel = e.clientX - bounds.left - plot.x;
      const next =
        rel < -columnWidth || rel > plot.width + columnWidth
          ? null
          : Math.min(columns - 1, Math.max(0, Math.floor(rel / columnWidth)));
      setHover(next);
    },
    [columns, columnWidth, plot.x, plot.width],
  );

  const onLeave = useCallback(() => setHover(null), []);

  return (
    <div
      className={cn("relative", className)}
      style={{ height }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="block overflow-visible">
        {/* Gridlines plus a labelled value axis — the old charts had neither. */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={plot.x}
              y1={yFor(v)}
              x2={plot.x + plot.width}
              y2={yFor(v)}
              stroke="var(--grid-line)"
              strokeWidth="1"
            />
            <text
              x={plot.x - 8}
              y={yFor(v) + 3.5}
              textAnchor="end"
              className="tabular fill-fg-subtle"
              fontSize="10">
              {formatValue(v)}
            </text>
          </g>
        ))}

        {hover !== null && (
          <line
            x1={xFor(hover)}
            y1={plot.y}
            x2={xFor(hover)}
            y2={plot.y + plot.height}
            stroke="rgba(var(--rgb-accent),0.55)"
            strokeWidth="1"
          />
        )}

        {children({ plot, yFor, xFor, axisMax, hover, values })}
      </svg>

      {/* Readout is HTML rather than SVG, so it inherits type and theming. */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-line-strong bg-glass px-2.5 py-1.5 backdrop-blur-md"
          style={{ left: xFor(hover), top: 0 }}
        >
          {formatCaption && (
            <span className="block text-2xs text-fg-subtle">{formatCaption(hover)}</span>
          )}
          <span className="tabular block text-xs font-medium text-fg">
            {formatValue(values[hover] ?? 0)}
          </span>
        </div>
      )}
    </div>
  );
}
