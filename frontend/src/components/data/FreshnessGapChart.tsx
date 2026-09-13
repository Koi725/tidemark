import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { Frame } from '@/components/primitives'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDateTime } from '@/lib/format'
import type { GapBucket, TimeRange } from '@/contracts'

export interface FreshnessGapChartProps {
  buckets: GapBucket[]
  warnMinutes: number
  alertMinutes: number
  range: TimeRange
  loading?: boolean
  animate?: boolean
}

function barFill(bucket: GapBucket, warn: number, alert: number): string {
  if (bucket.openEnded) return 'url(#tw-hatch-alert)'
  if (bucket.gapMinutes >= alert) return 'var(--tm-alert-fg)'
  if (bucket.gapMinutes >= warn) return 'var(--tm-warn-fg)'
  return 'var(--tm-accent)'
}

function GapTooltip({ active, payload }: TooltipProps<number, string>): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null
  const d = payload[0]?.payload as GapBucket | undefined
  if (!d) return null
  return (
    <div className="border border-hairline bg-overlay p-2 font-mono text-mono-sm text-ink shadow-md">
      {formatDateTime(d.t)} · {d.openEnded ? 'still waiting' : `${d.gapMinutes}m gap`}
    </div>
  )
}

/** Minutes between arrivals per bucket vs warn/alert thresholds (§3.12). */
export function FreshnessGapChart({
  buckets,
  warnMinutes,
  alertMinutes,
  range,
  loading = false,
  animate = false,
}: FreshnessGapChartProps): React.JSX.Element {
  return (
    <Frame className="flex flex-col gap-2 p-[var(--tm-pad)]">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-h3 text-ink">Freshness gap</h3>
        <span className="text-caption text-ink-muted">minutes between arrivals · {range}</span>
      </div>

      {loading ? (
        <Skeleton variant="chart" height={140} />
      ) : buckets.length === 0 ? (
        <EmptyState size="sm" title="Nothing probed" body="Nothing probed yet." />
      ) : (
        <>
          <div
            role="img"
            aria-label={`Freshness gap over ${range}, warn at ${warnMinutes}m, alert at ${alertMinutes}m`}
          >
            {/* Hide Recharts' unlabelled internal SVGs; the wrapper is the image. */}
            <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={buckets} margin={{ top: 6, right: 4, bottom: 0, left: 4 }} barCategoryGap={3}>
                <defs>
                  <pattern
                    id="tw-hatch-alert"
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="4" height="4" fill="var(--tm-alert-bg)" />
                    <line x1="0" y1="0" x2="0" y2="4" stroke="var(--tm-alert-fg)" strokeWidth="2" />
                  </pattern>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={[0, (max: number) => Math.max(max, alertMinutes + 6)]} />
                <Tooltip content={<GapTooltip />} cursor={{ fill: 'var(--tm-bg-faint)' }} />
                <ReferenceLine y={warnMinutes} stroke="var(--tm-warn-fg)" strokeDasharray="3 4" strokeWidth={1} />
                <ReferenceLine y={alertMinutes} stroke="var(--tm-alert-fg)" strokeDasharray="3 4" strokeWidth={1} />
                <Bar dataKey="gapMinutes" isAnimationActive={animate} animationDuration={700}>
                  {buckets.map((bucket, i) => (
                    <Cell key={i} fill={barFill(bucket, warnMinutes, alertMinutes)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-between font-mono text-mono-xs text-ink-muted">
            <span>−{range}</span>
            <span>
              warn {warnMinutes}m · alert {alertMinutes}m
            </span>
            <span>now</span>
          </div>
        </>
      )}
    </Frame>
  )
}
