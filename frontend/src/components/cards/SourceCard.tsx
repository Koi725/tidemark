import { Link } from '@tanstack/react-router'
import { CircleCheck, CircleHelp, OctagonAlert, Trash2, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, Frame } from '@/components/primitives'
import { SourceIcon } from '@/components/status/SourceIcon'
import { cn } from '@/lib/cn'
import { useNow } from '@/lib/clock'
import { formatAgo } from '@/lib/format'
import type { Source } from '@/mocks'

export interface SourceCardProps {
  source: Source
  onProbe: (source: Source) => void
  onDelete: (source: Source) => void
  probing?: boolean
}

const ROLLUP: Record<Source['state'], { icon: LucideIcon; word: string; className: string }> = {
  ok: { icon: CircleCheck, word: 'healthy', className: 'text-ok' },
  warn: { icon: TriangleAlert, word: 'warn', className: 'text-warn' },
  alert: { icon: OctagonAlert, word: 'alert', className: 'text-alert' },
  unknown: { icon: CircleHelp, word: 'unknown', className: 'text-unknown' },
}

/** One connected source (§3.7): a row ≥768px, a Frame card below. */
export function SourceCard({ source, onProbe, onDelete, probing = false }: SourceCardProps): React.JSX.Element {
  const now = useNow()
  const rollup = ROLLUP[source.state]
  const RollupIcon = rollup.icon
  const lost = source.state === 'unknown'

  const name = (
    <Link to="/" className="text-body font-medium text-ink no-underline hover:text-tide">
      {source.name}
    </Link>
  )
  const host = (
    <span className={cn('block truncate font-mono text-mono-sm', lost ? 'text-alert' : 'text-ink-muted')}>
      {source.host}
    </span>
  )
  const rollupCell = (
    <span className={cn('inline-flex items-center gap-1.5', rollup.className)}>
      <RollupIcon size={16} strokeWidth={1.8} aria-hidden="true" />
      {rollup.word}
    </span>
  )
  const probeBtn = (
    <Button variant="ghost" loading={probing} onClick={() => onProbe(source)}>
      {probing ? 'Probing…' : 'Probe now'}
    </Button>
  )
  const deleteBtn = (
    <Button variant="icon" aria-label={`Delete source ${source.name}`} onClick={() => onDelete(source)}>
      <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
    </Button>
  )

  return (
    <>
      {/* ≥768 row */}
      <div className="hidden items-center gap-3 border-b border-hairline px-[var(--tm-pad)] py-3 hover:bg-faint md:flex">
        <SourceIcon code={source.code} size={34} decorative />
        <div className="min-w-0 flex-1">
          {name}
          {host}
        </div>
        <span className="w-[90px] text-caption text-ink-muted">{source.type}</span>
        <span className="w-[80px] text-caption text-ink-muted">{source.datasetCount} datasets</span>
        <span className="w-[110px] text-caption">{rollupCell}</span>
        <span className="w-[80px] font-mono text-mono-sm text-ink-muted">probed {formatAgo(source.lastProbeAt, { now })}</span>
        {probeBtn}
        {deleteBtn}
      </div>

      {/* <768 card */}
      <Frame className="flex flex-col gap-3 p-[var(--tm-pad)] md:hidden">
        <div className="flex items-center gap-3">
          <SourceIcon code={source.code} size={34} decorative />
          <div className="min-w-0 flex-1">
            {name}
            {host}
          </div>
          <span className="text-caption">{rollupCell}</span>
        </div>
        <div className="flex items-center gap-3 text-caption text-ink-muted">
          <span>{source.type}</span>
          <span>· {source.datasetCount} datasets</span>
          <span>· probed {formatAgo(source.lastProbeAt, { now })}</span>
        </div>
        <div className="flex items-center gap-2">
          {probeBtn}
          <span className="ml-auto">{deleteBtn}</span>
        </div>
      </Frame>
    </>
  )
}
