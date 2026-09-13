import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { useNow } from '@/lib/clock'
import { EMPTY, formatAge, formatFullTs, formatVerboseAge } from '@/lib/format'
import type { DatasetState } from '@/lib/state'

export interface FreshnessPillProps {
  /** ISO timestamp of the newest row/message/object, or null (never probed). */
  since: string | null
  variant?: 'plain' | 'bordered'
  size?: 'metric' | 'metric-lg' | 'mono'
  /** Colours the text only when alert / paused (§3.3). */
  state?: DatasetState
  className?: string
}

const SIZE_CLASS = {
  metric: 'text-metric',
  'metric-lg': 'text-metric-lg',
  mono: 'text-mono',
} as const

const HOUR = 3_600_000
const DAY = 86_400_000

/**
 * The ticking age of the newest arrival (§3.3). Subscribes to the single shared
 * clock; the recompute cadence downshifts with age (every tick < 1h, every 10th
 * < 24h, every 60th ≥ 24h) via time-bucketing so the string is stable. No digit
 * flashing — tabular numerals keep it steady.
 */
export function FreshnessPill({
  since,
  variant = 'plain',
  size = 'mono',
  state,
  className,
}: FreshnessPillProps): React.JSX.Element {
  const liveNow = useNow()
  // Paused datasets freeze the age at first render (§3.3 / §4 paused card).
  const [frozenNow] = useState(liveNow)
  const now = state === 'paused' ? frozenNow : liveNow

  const ageMs = since === null ? 0 : now - Date.parse(since)
  const cadence = ageMs < HOUR ? 1_000 : ageMs < DAY ? 10_000 : 60_000
  const bucketed = Math.floor(now / cadence) * cadence

  const label = useMemo(() => formatAge(since, { now: bucketed }), [since, bucketed])

  const tone =
    state === 'alert' ? 'text-alert' : state === 'paused' ? 'text-paused' : undefined

  if (since === null) {
    return (
      <span
        aria-label="never probed"
        className={cn('font-mono tabular-nums text-ink-faint', SIZE_CLASS[size], className)}
      >
        {EMPTY}
      </span>
    )
  }

  return (
    <time
      dateTime={since}
      title={formatFullTs(since)}
      aria-label={`last row ${formatVerboseAge(since, { now: bucketed })} ago`}
      className={cn(
        'font-mono tabular-nums',
        SIZE_CLASS[size],
        variant === 'bordered' && 'rounded-md border border-hairline px-2 py-[2px]',
        tone,
        className,
      )}
    >
      {label}
    </time>
  )
}
