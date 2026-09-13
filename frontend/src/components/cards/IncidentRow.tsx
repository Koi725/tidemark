import {
  Content,
  Item,
  Portal,
  Root,
  Trigger,
} from '@radix-ui/react-dropdown-menu'
import { motion } from 'motion/react'
import { BellOff, MoreVertical, OctagonAlert, TriangleAlert } from 'lucide-react'
import { Button, Tag } from '@/components/primitives'
import { cn } from '@/lib/cn'
import { useNow } from '@/lib/clock'
import { formatAgo, formatDuration } from '@/lib/format'
import type { Incident } from '@/mocks'

export type SnoozeChoice = '1h' | '4h' | 'tomorrow' | 'resolved'

export interface IncidentRowProps {
  incident: Incident
  datasetDeleted?: boolean
  onOpen: (id: string) => void
  onAck: (id: string) => void
  onSnooze: (id: string, choice: SnoozeChoice) => void
  onResolve: (id: string) => void
  onNotify: (id: string) => void
}

const SNOOZE_OPTIONS: Array<[SnoozeChoice, string]> = [
  ['1h', '1 hour'],
  ['4h', '4 hours'],
  ['tomorrow', 'Until tomorrow 09:00'],
  ['resolved', 'Until resolved'],
]

const menuItemClass =
  'flex min-h-9 cursor-pointer items-center px-2.5 text-body-sm text-ink outline-none data-[highlighted]:bg-faint'

const menuContentClass =
  'z-[30] min-w-[180px] border border-hairline bg-overlay p-1 shadow-md data-[state=open]:animate-[tw-pop_160ms_var(--ease-out)]'

export function IncidentRow({
  incident,
  datasetDeleted = false,
  onOpen,
  onAck,
  onSnooze,
  onResolve,
  onNotify,
}: IncidentRowProps): React.JSX.Element {
  const now = useNow()
  const SevIcon = incident.severity === 'alert' ? OctagonAlert : TriangleAlert
  const sevColor = incident.severity === 'alert' ? 'text-alert' : 'text-warn'
  const resolved = incident.status === 'resolved'
  const acked = incident.status === 'acked'
  const snoozed = incident.status === 'snoozed'

  const severity = (
    <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium', sevColor)}>
      <SevIcon size={16} strokeWidth={1.8} aria-hidden="true" />
      {incident.severity.toUpperCase()}
    </span>
  )

  const title = (
    <button
      type="button"
      onClick={() => onOpen(incident.id)}
      aria-haspopup="dialog"
      className="flex min-w-0 flex-col items-start text-left"
    >
      <span className="line-clamp-2 text-body font-medium text-ink">{incident.title}</span>
      <span className={cn('truncate font-mono text-mono-sm', datasetDeleted ? 'text-ink-faint' : 'text-ink-muted')}>
        <span title={datasetDeleted ? 'dataset no longer monitored' : undefined}>{incident.datasetKey}</span> · {incident.check}
      </span>
    </button>
  )

  const time = (
    <span className="flex items-center gap-1 font-mono text-mono-sm text-ink-muted">
      {snoozed ? <BellOff size={13} strokeWidth={1.5} aria-hidden="true" /> : null}
      {formatAgo(incident.openedAt, { now })}
    </span>
  )

  const resolvedTag = resolved ? (
    <Tag variant="neutral">
      resolved · {formatDuration((incident.resolvedAt ? Date.parse(incident.resolvedAt) : now) - Date.parse(incident.openedAt))}
    </Tag>
  ) : null

  const desktopActions = resolved ? (
    resolvedTag
  ) : (
    <div className="flex items-center gap-1">
      <Button variant="ghost" disabled={acked} onClick={() => onAck(incident.id)} aria-label={`Acknowledge incident ${incident.title}`}>
        {acked ? <span className="text-ok">Acked ✓</span> : 'Ack'}
      </Button>
      <Root>
        <Trigger asChild>
          <Button variant="ghost" aria-label={`Snooze incident ${incident.title}`}>
            {snoozed ? 'Snoozed 1h' : 'Snooze'}
          </Button>
        </Trigger>
        <Portal>
          <Content align="end" className={menuContentClass}>
            {SNOOZE_OPTIONS.map(([choice, label]) => (
              <Item key={choice} className={menuItemClass} onSelect={() => onSnooze(incident.id, choice)}>
                {label}
              </Item>
            ))}
          </Content>
        </Portal>
      </Root>
      <Button variant="secondary" onClick={() => onResolve(incident.id)} aria-label={`Resolve incident ${incident.title}`}>
        Resolve
      </Button>
    </div>
  )

  const mobileMenu = (
    <Root>
      <Trigger asChild>
        <Button variant="icon" aria-label={`Actions for ${incident.title}`}>
          <MoreVertical size={16} strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </Trigger>
      <Portal>
        <Content align="end" className={menuContentClass}>
          {!resolved ? (
            <>
              <Item className={menuItemClass} onSelect={() => onAck(incident.id)}>
                Ack
              </Item>
              <Item className={menuItemClass} onSelect={() => onSnooze(incident.id, '1h')}>
                Snooze 1h
              </Item>
              <Item className={menuItemClass} onSelect={() => onResolve(incident.id)}>
                Resolve
              </Item>
            </>
          ) : null}
          <Item className={menuItemClass} onSelect={() => onNotify(incident.id)}>
            Notify again
          </Item>
        </Content>
      </Portal>
    </Root>
  )

  return (
    <motion.div
      layout
      transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        'border border-hairline hover:bg-faint',
        snoozed && 'opacity-80',
        resolved && 'opacity-60',
      )}
    >
      {/* desktop */}
      <div className="hidden grid-cols-[84px_minmax(0,1fr)_80px_auto] items-center gap-3 px-3 py-2.5 md:grid">
        {severity}
        {title}
        {time}
        {desktopActions}
      </div>
      {/* mobile */}
      <div className="grid grid-cols-[70px_1fr_auto] items-center gap-3 px-3 py-2.5 md:hidden">
        <div className="flex flex-col gap-1">
          {severity}
          {time}
        </div>
        {title}
        {resolved ? resolvedTag : mobileMenu}
      </div>
    </motion.div>
  )
}
