import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { Frame } from '@/components/primitives'
import { Skeleton } from '@/components/feedback/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatCount, formatDateTime } from '@/lib/format'
import type { RowSeriesPoint, TimeRange } from '@/contracts'

export interface BaselineBandChartProps {
  series: RowSeriesPoint[]
  range: TimeRange
  animate?: boolean
  loading?: boolean
  baselineLearning?: boolean
  baselineHoursLeft?: number
  onWiden?: () => void
}

interface Datum {
  t: string
  value: number
  baseline: number | null
  band: [number, number] | null
  outlierAlert: number | null
  outlierWarn: number | null
  mean: number | null
  sd: number | null
}

function toData(series: RowSeriesPoint[]): { data: Datum[]; below: number } {
  let below = 0
  const data = series.map((p) => {
    const mean = p.baselineMean
    const sd = p.baselineSd
    const z = mean !== null && sd ? (p.value - mean) / sd : 0
    if (mean !== null && sd && p.value < mean - 2 * sd) below += 1
    return {
      t: p.t,
      value: p.value,
      baseline: mean,
      band: mean !== null && sd !== null ? ([mean - 2 * sd, mean + 2 * sd] as [number, number]) : null,
      outlierAlert: Math.abs(z) >= 3 ? p.value : null,
      outlierWarn: Math.abs(z) >= 2 && Math.abs(z) < 3 ? p.value : null,
      mean,
      sd,
    }
  })
  return { data, below }
}

function BandTooltip({ active, payload }: TooltipProps<number, string>): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null
  const d = payload[0]?.payload as Datum | undefined
  if (!d) return null
  const baseline =
    d.mean !== null && d.sd !== null
      ? ` · baseline ${formatCount(Math.round(d.mean))} ±${formatCount(Math.round(2 * d.sd))}`
      : ''
  return (
    <div className="border border-hairline bg-overlay p-2 font-mono text-mono-sm text-ink shadow-md">
      {formatDateTime(d.t)} · {formatCount(d.value)} rows{baseline}
    </div>
  )
}

/** Volume per bucket against a learned ±2σ band (§3.11). */
export function BaselineBandChart({
  series,
  range,
  animate = false,
  loading = false,
  baselineLearning = false,
  baselineHoursLeft = 0,
  onWiden,
}: BaselineBandChartProps): React.JSX.Element {
  const { data, below } = toData(series)

  return (
    <Frame className="flex flex-col gap-2 p-[var(--tm-pad)]">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-h3 text-ink">Row count</h3>
        <span className="text-caption text-ink-muted">
          {baselineLearning
            ? `baseline learning · ${baselineHoursLeft}h left`
            : 'per hour · baseline ±2σ'}
        </span>
      </div>

      {loading ? (
        <Skeleton variant="chart" height={140} />
      ) : data.length === 0 ? (
        <EmptyState
          size="sm"
          title="No probes"
          body="No probes in this range."
          action={onWiden ? { label: 'Widen the range', onClick: onWiden } : undefined}
        />
      ) : (
        <>
          <div
            role="img"
            aria-label={`Row count over ${range}, ${below} point${below === 1 ? '' : 's'} below the baseline band`}
          >
            {/* Recharts' internal SVGs carry no alt text; the wrapper above is the
                labelled image, so hide the chart internals from AT + axe. */}
            <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={140}>
              <ComposedChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={[0, 'dataMax']} />
                <Tooltip content={<BandTooltip />} cursor={{ stroke: 'var(--tm-border-strong)' }} />
                {!baselineLearning ? (
                  <Area
                    dataKey="band"
                    stroke="none"
                    fill="var(--tm-accent)"
                    fillOpacity={0.14}
                    isAnimationActive={animate}
                    animationDuration={400}
                  />
                ) : null}
                {!baselineLearning ? (
                  <Line
                    dataKey="baseline"
                    stroke="var(--tm-accent)"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                ) : null}
                <Line
                  dataKey="value"
                  stroke="var(--tm-text-primary)"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={animate}
                  animationDuration={800}
                />
                <Scatter dataKey="outlierWarn" fill="var(--tm-warn-fg)" isAnimationActive={animate} />
                <Scatter dataKey="outlierAlert" fill="var(--tm-alert-fg)" isAnimationActive={animate} />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-between font-mono text-mono-xs text-ink-muted">
            <span>{data[0] ? formatDateTime(data[0].t) : ''}</span>
            <span>now</span>
          </div>
        </>
      )}
    </Frame>
  )
}
