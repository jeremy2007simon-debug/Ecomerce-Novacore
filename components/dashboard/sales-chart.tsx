'use client';

import * as m from 'motion/react-m';
import { useMemo, useState } from 'react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatMoneyCompact, formatMoneyRounded } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import type { SeriesPoint } from '@/types/dashboard';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SALES CHART — hand-rolled SVG, roughly 2 kB.
 *
 * A charting library was rejected for two reasons, and the second is the one
 * that matters: Recharts is ~100 kB gzipped, and it *looks like Recharts*.
 * Gridlines, a boxed legend and default tooltips are the fastest way to make a
 * bespoke dashboard read as a template with a chart dropped into it.
 *
 * What is here instead: a hairline baseline, an area fading to transparent, no
 * gridlines, mono axis labels, and a crosshair that appears on hover. The path
 * draws itself in on a range change, which makes the toggle feel like the chart
 * is responding rather than being replaced.
 *
 * The viewBox is a fixed coordinate space with preserveAspectRatio="none", so
 * the chart is fully responsive without any measurement, resize listener or
 * layout read.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const W = 1000;
const H = 300;
const PAD_TOP = 24;
const PAD_BOTTOM = 34;

function buildPath(points: SeriesPoint[], max: number) {
  if (points.length === 0) return { line: '', area: '', coords: [] as { x: number; y: number }[] };

  const step = points.length > 1 ? W / (points.length - 1) : W;
  const usableHeight = H - PAD_TOP - PAD_BOTTOM;

  const coords = points.map((point, i) => ({
    x: i * step,
    y: PAD_TOP + usableHeight * (1 - (max === 0 ? 0 : point.revenue / max)),
  }));

  // Catmull-Rom style smoothing via cubic segments. A polyline through daily
  // revenue is jagged enough to look like a heart monitor; smoothing reads as
  // a trend, which is what the chart is actually about.
  let line = `M${coords[0]!.x},${coords[0]!.y}`;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const current = coords[i]!;
    const next = coords[i + 1]!;
    const controlX = (current.x + next.x) / 2;
    line += ` C${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
  }

  const area = `${line} L${coords[coords.length - 1]!.x},${H - PAD_BOTTOM} L${coords[0]!.x},${H - PAD_BOTTOM} Z`;

  return { line, area, coords };
}

export function SalesChart({
  points,
  rangeKey,
  idleLabel,
}: {
  points: SeriesPoint[];
  rangeKey: string;
  /** Shown in the readout until a point is hovered. */
  idleLabel: string;
}) {
  const { locale } = useLocale();
  const [hover, setHover] = useState<number | null>(null);

  const max = useMemo(() => Math.max(...points.map((p) => p.revenue), 1), [points]);
  const { line, area, coords } = useMemo(() => buildPath(points, max), [points, max]);

  const isHourly = points[0]?.t.includes('T') ?? false;

  const labelFor = (point: SeriesPoint) => {
    const date = new Date(point.t);
    if (isHourly) {
      return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(date);
    }
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(date);
  };

  // Show at most five x labels, evenly spaced, whatever the range length.
  const labelIndices = useMemo(() => {
    if (points.length <= 5) return points.map((_, i) => i);
    const stride = (points.length - 1) / 4;
    return [0, 1, 2, 3, 4].map((i) => Math.round(i * stride));
  }, [points]);

  const active = hover !== null ? points[hover] : null;
  const activeCoord = hover !== null ? coords[hover] : null;

  return (
    <div className="relative">
      {/*
        Fixed-height readout so hovering cannot shift the chart.

        It deliberately does NOT repeat the period total when idle — that figure
        is already the revenue KPI directly above, and printing it twice in one
        viewport makes the panel look padded rather than dense.
      */}
      <div className="mb-4 flex h-10 items-baseline justify-between gap-4">
        <p className="micro-label text-ink-subtle">{active ? labelFor(active) : idleLabel}</p>
        {active ? (
          <p className="text-subtitle font-medium text-ink" data-numeric>
            {formatMoneyRounded({ amount: active.revenue, currencyCode: 'EUR' }, locale)}
            <span className="micro-label ml-3 text-ink-subtle">
              {active.orders} · {active.visitors}
            </span>
          </p>
        ) : null}
      </div>

      {/*
        Readable with a keyboard, not only with a mouse.

        The readout above was reachable exclusively through `onPointerMove`, so
        every figure in this chart — the entire point of the panel — was
        unavailable to anyone navigating by keyboard, and `touch-none` meant a
        touch device could not scrub it either. It is now a focusable slider:
        arrows step point by point, Home and End jump to the ends, Escape lets
        go. `role="slider"` with the value attributes means a screen reader
        announces the figure at each step rather than reading a bare image.

        The drawing itself is untouched — same paths, same animation, same
        gradient. This is only how the existing readout is reached.
      */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-56 w-full touch-none rounded-xs outline-none focus-visible:ring-1 focus-visible:ring-ember sm:h-72"
        role="slider"
        tabIndex={0}
        aria-label={`Revenue, ${rangeKey}`}
        aria-valuemin={0}
        aria-valuemax={points.length - 1}
        aria-valuenow={hover ?? 0}
        aria-valuetext={active ? `${labelFor(active)}: ${active.revenue}` : idleLabel}
        onFocus={() => setHover((current) => current ?? points.length - 1)}
        onBlur={() => setHover(null)}
        onKeyDown={(event) => {
          const last = points.length - 1;
          const step = (delta: number) =>
            setHover((current) =>
              Math.max(0, Math.min(last, (current ?? last) + delta)),
            );

          switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
              event.preventDefault();
              step(-1);
              break;
            case 'ArrowRight':
            case 'ArrowUp':
              event.preventDefault();
              step(1);
              break;
            case 'Home':
              event.preventDefault();
              setHover(0);
              break;
            case 'End':
              event.preventDefault();
              setHover(last);
              break;
            case 'Escape':
              setHover(null);
              break;
            default:
              break;
          }
        }}
        onPointerLeave={() => setHover(null)}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const index = Math.round(ratio * (points.length - 1));
          setHover(Math.max(0, Math.min(points.length - 1, index)));
        }}
      >
        <defs>
          <linearGradient id={`fill-${rangeKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6618 0.1523 47.8)" stopOpacity="0.28" />
            <stop offset="70%" stopColor="oklch(0.6618 0.1523 47.8)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="oklch(0.6618 0.1523 47.8)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Baseline only. No gridlines. */}
        <line
          x1="0"
          y1={H - PAD_BOTTOM}
          x2={W}
          y2={H - PAD_BOTTOM}
          stroke="oklch(1 0 0 / 12%)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Area + line, re-keyed on range so both animate on toggle. */}
        <m.path
          key={`area-${rangeKey}`}
          d={area}
          fill={`url(#fill-${rangeKey})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <m.path
          key={`line-${rangeKey}`}
          d={line}
          fill="none"
          stroke="oklch(0.6618 0.1523 47.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Crosshair */}
        {activeCoord ? (
          <g>
            <line
              x1={activeCoord.x}
              y1={PAD_TOP - 12}
              x2={activeCoord.x}
              y2={H - PAD_BOTTOM}
              stroke="oklch(1 0 0 / 22%)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={activeCoord.x}
              cy={activeCoord.y}
              r="4"
              fill="oklch(0.1183 0.0058 264.53)"
              stroke="oklch(0.6618 0.1523 47.8)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ) : null}
      </svg>

      {/* Axis labels, outside the SVG so they are not stretched by
          preserveAspectRatio="none". */}
      <div className="mt-3 flex justify-between">
        {labelIndices.map((index) => {
          const point = points[index];
          return point ? (
            <span key={index} className="micro-label text-ink-subtle" data-numeric>
              {labelFor(point)}
            </span>
          ) : null;
        })}
      </div>

      <p className="micro-label mt-6 text-ink-subtle" data-numeric>
        max {formatMoneyCompact({ amount: max, currencyCode: 'EUR' }, locale)}
      </p>
    </div>
  );
}

/**
 * TODAY / 7D / 30D / 90D toggle.
 *
 * The sliding indicator is one absolutely positioned element animated with
 * `left`/`width` percentages rather than Motion's `layoutId`. layoutId needs
 * the `domMax` feature set, and the provider deliberately loads `domAnimation`
 * (~15 kB vs ~30 kB) — doubling the global motion bundle for one pill would be
 * a bad trade. Percentages mean no measurement and no resize listener.
 */
export function RangeToggle({
  value,
  onChange,
  labels,
}: {
  value: string;
  onChange: (next: string) => void;
  labels: Record<string, string>;
}) {
  const keys = Object.keys(labels);
  const index = Math.max(0, keys.indexOf(value));
  const width = 100 / keys.length;

  return (
    <div className="relative flex items-center rounded-xs border border-hairline p-1">
      <m.span
        aria-hidden="true"
        className="absolute inset-y-1 rounded-xs bg-paper"
        initial={false}
        animate={{ left: `calc(${index * width}% + 0.25rem)` }}
        style={{ width: `calc(${width}% - 0.5rem)` }}
        transition={{ type: 'spring', stiffness: 480, damping: 40 }}
      />
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={cn(
            'micro-label relative flex-1 rounded-xs px-3 py-1.5 transition-colors',
            value === key ? 'text-void' : 'text-ink-subtle hover:text-ink',
          )}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  );
}
