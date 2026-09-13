import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { TriangleAlert } from 'lucide-react'
import { Corner } from '@/components/primitives'
import type { CornerPosition } from '@/components/primitives'
import { Sparkline } from '@/components/data/Sparkline'
import { FreshnessPill } from '@/components/status/FreshnessPill'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Tag } from '@/components/primitives'
import { cn } from '@/lib/cn'
import { easeTuples, useReducedMotion } from '@/lib/motion'
import { formatAge, formatDelta, formatPct } from '@/lib/format'
import { useNow } from '@/lib/clock'
import type { DatasetSummary } from '@/contracts'

export interface DatasetCardProps {
  dataset: DatasetSummary
  index: number
  /** Play the one-time entrance rise (§5.2 — first paint per session only). */
  animateIn: boolean
}

const ALL_CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

function deltaTone(dataset: DatasetSummary): 'text-alert' | 'text-warn' | 'text-ink-muted' {
  if (dataset.state === 'alert') return 'text-alert'
  if (dataset.state === 'warn') return 'text-warn'
  return 'text-ink-muted'
}

/** The atom of the Overview grid (§3.6). Rendered as a real <a> for middle-click. */
export function DatasetCard({ dataset, index, animateIn }: DatasetCardProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const now = useNow()
  const paused = dataset.paused
  const unknown = dataset.state === 'unknown'

  const note =
    unknown
      ? 'never probed'
      : paused && dataset.pausedAt
        ? `paused ${formatAge(dataset.pausedAt, { now })} ago`
        : null

  const delta =
    paused || unknown || dataset.volumeDeltaPct === null
      ? '—'
      : formatDelta(dataset.volumeDeltaPct, { format: (v) => formatPct(v, { decimals: 1 }) })

  const stateLabel = dataset.state.toUpperCase()

  return (
    <motion.div
      layout
      initial={animateIn && !reduced ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: easeTuples.out,
        delay: animateIn && !reduced ? Math.min(index, 11) * 0.04 : 0,
      }}
    >
      <Link
        to="/datasets/$datasetId"
        params={{ datasetId: dataset.id }}
        search={{ tab: 'timeline', range: '24h' }}
        aria-label={`${dataset.key}, ${stateLabel}, last row ${formatAge(dataset.lastRowAt, { now })}`}
        className={cn(
          'relative flex min-h-[var(--tm-card-min)] flex-col gap-[10px] border bg-transparent p-[var(--tm-pad)] text-left no-underline transition-[background,border-color] duration-fast ease-out hover:border-strong hover:bg-faint active:translate-y-px active:bg-fainter',
          dataset.state === 'alert' ? 'border-alert-border' : 'border-hairline',
          // Paused reads via the hollow dot, PAUSED badge and note — not a dim
          // container, which would drop the secondary text below AA contrast.
          paused && 'bg-fainter',
        )}
      >
        <div className="flex w-full items-start gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate font-mono text-mono text-ink" title={dataset.key}>
              {dataset.displayName}
            </span>
            {dataset.state === 'alert' ? (
              <TriangleAlert size={12} strokeWidth={1.8} className="shrink-0 text-alert" aria-hidden="true" />
            ) : null}
          </span>
          <StatusBadge state={dataset.state} />
        </div>

        <div className="flex w-full items-baseline gap-3">
          <FreshnessPill since={dataset.lastRowAt} size="metric" state={dataset.state} />
          {note ? <span className="text-caption text-ink-muted">{note}</span> : null}
          <span className={cn('ml-auto font-mono text-mono-sm', deltaTone(dataset))}>{delta}</span>
        </div>

        <Sparkline points={dataset.sparkline} state={dataset.state} />

        <div className="flex w-full items-center gap-2 text-caption text-ink-muted">
          {dataset.tags[0] ? <Tag variant="accent">{dataset.tags[0]}</Tag> : null}
          <span>{dataset.kind}</span>
          <span className="ml-auto font-mono text-mono-sm">{dataset.checkCount} checks</span>
        </div>

        {ALL_CORNERS.map((position) => (
          <Corner key={position} position={position} />
        ))}
      </Link>
    </motion.div>
  )
}
