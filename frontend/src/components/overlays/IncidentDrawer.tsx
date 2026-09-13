import { Link } from '@tanstack/react-router'
import {
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
} from '@radix-ui/react-dialog'
import { Terminal, X } from 'lucide-react'
import { Button, Tag } from '@/components/primitives'
import { ErrorState } from '@/components/feedback/ErrorState'
import { StatusBadge } from '@/components/status/StatusBadge'
import { cn } from '@/lib/cn'
import { formatDuration, formatTime } from '@/lib/format'
import type { Incident } from '@/contracts'

export interface IncidentDrawerProps {
  open: boolean
  incident: Incident | undefined
  /** Whether the incident's dataset is no longer monitored (route computes it). */
  datasetDeleted?: boolean
  onClose: () => void
  onAck: (id: string) => void
  onSnooze: (id: string, choice: '1h') => void
  onResolve: (id: string) => void
  onNotify: (id: string) => void
}

const CONTENT_CLASS = cn(
  'fixed z-30 flex flex-col bg-overlay shadow-lg',
  // mobile bottom sheet
  'inset-x-0 bottom-0 h-[88vh] border-t border-hairline',
  'data-[state=open]:animate-[tw-sheet-in_240ms_var(--ease-out)] data-[state=closed]:animate-[tw-sheet-in_200ms_var(--ease-out)_reverse]',
  // desktop right panel
  'md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[460px] md:border-l md:border-t-0',
  'md:data-[state=open]:animate-[tw-drawer-in_240ms_var(--ease-out)] md:data-[state=closed]:animate-[tw-drawer-in_200ms_var(--ease-out)_reverse]',
)

export function IncidentDrawer({
  open,
  incident,
  datasetDeleted = false,
  onClose,
  onAck,
  onSnooze,
  onResolve,
  onNotify,
}: IncidentDrawerProps): React.JSX.Element {
  const resolved = incident?.status === 'resolved'
  const deleted = datasetDeleted

  return (
    <Root open={open} onOpenChange={(o) => (o ? undefined : onClose())}>
      <Portal>
        <Overlay className="fixed inset-0 z-30 bg-scrim data-[state=open]:animate-[tw-fade_160ms_var(--ease-out)] data-[state=closed]:animate-[tw-fade_160ms_var(--ease-out)_reverse]" />
        <Content className={CONTENT_CLASS} aria-describedby={undefined}>
          {!incident ? (
            <div className="flex flex-col gap-3 p-[var(--tm-pad)]">
              <Title className="font-display text-h2 text-ink">Incident not found</Title>
              <ErrorState
                headline="Incident not found"
                raw="incident_id not found\nendpoint=GET /api/incidents/:id"
              />
              <Button variant="secondary" className="w-fit" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 border-b border-hairline p-[var(--tm-pad)]">
                <div className="flex items-center gap-2">
                  <StatusBadge state={incident.severity} />
                  <Tag variant="neutral">{incident.status}</Tag>
                  <Button variant="icon" aria-label="Close" className="ml-auto" onClick={onClose}>
                    <X size={16} strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                </div>
                <Title className="font-display text-h2 text-ink">{incident.title}</Title>
                {deleted ? (
                  <span className="font-mono text-mono text-ink-faint" title="dataset no longer monitored">
                    {incident.datasetKey}
                  </span>
                ) : (
                  <Link
                    to="/datasets/$datasetId"
                    params={{ datasetId: incident.datasetId }}
                    search={{ tab: 'timeline', range: '24h' }}
                    className="font-mono text-mono text-tide no-underline hover:underline"
                  >
                    {incident.datasetKey} ↗
                  </Link>
                )}
                <div className="flex flex-wrap gap-x-[18px] gap-y-1 font-mono text-caption text-ink-muted">
                  <span>opened {formatTime(incident.openedAt)}</span>
                  <span>check · {incident.check}</span>
                  {incident.notifiedVia.length ? <span>notified · {incident.notifiedVia.join(', ')}</span> : null}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-[var(--tm-pad)]">
                <section className="flex flex-col gap-2">
                  <h3 className="text-label font-display uppercase tracking-[.1em] text-ink-muted">What changed</h3>
                  {incident.evidence.length === 0 ? (
                    <p className="text-body-sm text-ink-muted">No evidence captured for this incident.</p>
                  ) : (
                    <div className="border border-hairline">
                      {incident.evidence.map((e) => (
                        <div key={e.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-hairline px-3 py-2 text-body-sm last:border-b-0">
                          <span className="text-ink-muted">{e.label}</span>
                          <span className="font-mono text-mono-sm text-ink-faint line-through">{e.before}</span>
                          <span className="font-mono text-mono-sm font-medium text-ink">{e.after}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-2">
                  <h3 className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Timeline</h3>
                  <Description className="sr-only">Incident timeline</Description>
                  <div className="flex flex-col">
                    {incident.timeline.map((t, i) => (
                      <div key={i} className="grid grid-cols-[70px_12px_1fr] items-start gap-2 py-1.5">
                        <span className="font-mono text-mono-sm text-ink-muted">{formatTime(t.at)}</span>
                        <span className="mt-1 size-2 rounded-full bg-tide" aria-hidden="true" />
                        <span className="text-body-sm text-ink">{t.text}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <details>
                  <summary className="flex cursor-pointer items-center gap-1.5 text-body-sm text-ink-muted">
                    <Terminal size={13} strokeWidth={1.5} aria-hidden="true" /> Raw probe output
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap border border-hairline bg-sunken p-2.5 font-mono text-mono-xs text-ink-2">
                    {incident.raw}
                  </pre>
                </details>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-hairline p-[var(--tm-pad)]">
                <Button variant="secondary" onClick={() => onNotify(incident.id)}>
                  Notify again
                </Button>
                {resolved ? (
                  <Tag variant="neutral">
                    resolved ·{' '}
                    {formatDuration(
                      Date.parse(incident.resolvedAt ?? incident.openedAt) -
                        Date.parse(incident.openedAt),
                    )}
                  </Tag>
                ) : (
                  <>
                    <Button variant="ghost" disabled={incident.status === 'acked'} onClick={() => onAck(incident.id)}>
                      {incident.status === 'acked' ? 'Acked ✓' : 'Ack'}
                    </Button>
                    <Button variant="ghost" onClick={() => onSnooze(incident.id, '1h')}>
                      Snooze
                    </Button>
                    <Button variant="primary" className="ml-auto" onClick={() => onResolve(incident.id)}>
                      Resolve
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </Content>
      </Portal>
    </Root>
  )
}
