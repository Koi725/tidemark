import { cn } from '@/lib/cn'
import { EMPTY } from '@/lib/format'

export type MetricTone = 'ink' | 'ok' | 'warn' | 'alert' | 'muted'

export interface MetricNumberProps {
  value: string | null
  label?: string
  note?: string
  unit?: string
  size?: 'metric' | 'metric-lg'
  tone?: MetricTone
  className?: string
}

const TONE_CLASS: Record<MetricTone, string> = {
  ink: 'text-ink',
  ok: 'text-ok',
  warn: 'text-warn',
  alert: 'text-alert',
  muted: 'text-ink-muted',
}

/** The big mono number (§3.5): age, rows, delta. No count-up on change. */
export function MetricNumber({
  value,
  label,
  note,
  unit,
  size = 'metric',
  tone = 'ink',
  className,
}: MetricNumberProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {label ? (
        <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">
          {label}
        </span>
      ) : null}
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-mono font-medium leading-none tabular-nums',
            size === 'metric-lg' ? 'text-metric-lg' : 'text-metric',
            value === null ? 'text-ink-faint' : TONE_CLASS[tone],
          )}
        >
          {value ?? EMPTY}
        </span>
        {unit ? <span className="text-caption text-ink-muted">{unit}</span> : null}
      </div>
      {note ? <span className="text-caption text-ink-muted">{note}</span> : null}
    </div>
  )
}
