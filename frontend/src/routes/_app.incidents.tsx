import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LayoutGroup } from 'motion/react'
import { IncidentRow } from '@/components/cards/IncidentRow'
import type { SnoozeChoice } from '@/components/cards/IncidentRow'
import { IncidentDrawer } from '@/components/overlays/IncidentDrawer'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Segmented } from '@/components/primitives'
import { notify } from '@/components/feedback/notify'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { useNow } from '@/lib/clock'
import { formatDayHeader } from '@/lib/format'
import { getDataset, INCIDENTS } from '@/mocks'
import type { Incident } from '@/mocks'

type FilterId = 'open' | 'resolved' | 'all'

interface IncidentsSearch {
  filter: FilterId
  incident?: string
  mock?: string
}

const FILTERS: readonly FilterId[] = ['open', 'resolved', 'all']
const DAY = 86_400_000
const WEEK = 7 * DAY

export const Route = createFileRoute('/_app/incidents')({
  component: IncidentsRoute,
  validateSearch: (search: Record<string, unknown>): IncidentsSearch => ({
    filter: FILTERS.includes(search.filter as FilterId) ? (search.filter as FilterId) : 'open',
    incident: typeof search.incident === 'string' ? search.incident : undefined,
    mock: typeof search.mock === 'string' ? search.mock : undefined,
  }),
})

const SNOOZE_TOAST: Record<SnoozeChoice, string> = {
  '1h': 'Snoozed for 1h',
  '4h': 'Snoozed for 4h',
  tomorrow: 'Snoozed until tomorrow 09:00',
  resolved: 'Snoozed until resolved',
}

function IncidentsRoute() {
  const { filter, incident: incidentId, mock } = Route.useSearch()
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<Incident[]>(() => INCIDENTS.map((i) => ({ ...i })))
  const now = useNow()

  const setFilter = (next: FilterId): void => {
    void navigate({ to: '/incidents', search: { filter: next, incident: incidentId } })
  }
  const openDrawer = (id: string): void => {
    void navigate({ to: '/incidents', search: { filter, incident: id } })
  }
  const closeDrawer = (): void => {
    void navigate({ to: '/incidents', search: { filter, incident: undefined } })
  }

  const patch = (id: string, changes: Partial<Incident>): void =>
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)))

  const ack = (id: string): void => {
    patch(id, { status: 'acked', ackedBy: 'advicemicro@gmail.com' })
    notify('ok', 'Acknowledged')
  }
  const snooze = (id: string, choice: SnoozeChoice): void => {
    patch(id, { status: 'snoozed' })
    notify('ok', SNOOZE_TOAST[choice])
  }
  const resolve = (id: string): void => {
    patch(id, { status: 'resolved', resolvedAt: new Date().toISOString() })
    notify('ok', 'Resolved — will reopen if it recurs')
    if (incidentId === id) closeDrawer()
  }
  const renotify = (id: string): void => {
    const inc = incidents.find((i) => i.id === id)
    notify('info', `Re-sent to ${inc?.notifiedVia.join(', ') || 'notifiers'}`)
  }

  const filtered = useMemo(() => {
    const list = incidents.filter((i) =>
      filter === 'open' ? i.status !== 'resolved' : filter === 'resolved' ? i.status === 'resolved' : true,
    )
    return [...list].sort((a, b) => Date.parse(b.openedAt) - Date.parse(a.openedAt))
  }, [incidents, filter])

  const groups = useMemo(() => {
    const map = new Map<number, Incident[]>()
    for (const inc of filtered) {
      const key = Math.floor(Date.parse(inc.openedAt) / DAY)
      const arr = map.get(key) ?? []
      arr.push(inc)
      map.set(key, arr)
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0])
  }, [filtered])

  const openCount = incidents.filter((i) => i.status !== 'resolved').length
  const resolvedWeek = incidents.filter(
    (i) => i.status === 'resolved' && i.resolvedAt && now - Date.parse(i.resolvedAt) < WEEK,
  ).length

  const drawerIncident = incidentId ? incidents.find((i) => i.id === incidentId) : undefined

  return (
    <>
      <HeaderStrip
        title="Incidents"
        meta={<span>{openCount} open · {resolvedWeek} resolved this week</span>}
      >
        <Segmented
          ariaLabel="Filter incidents"
          value={filter}
          onValueChange={(v) => setFilter(v as FilterId)}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'all', label: 'All' },
          ]}
        />
      </HeaderStrip>

      <div className="p-[var(--tm-pad)]">
        {mock === 'loading' ? (
          <div aria-busy="true" aria-label="Loading incidents" className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="row" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          filter === 'open' ? (
            <EmptyState
              title="Nothing open"
              body="Every dataset is inside its thresholds. Incidents open here the moment one isn't."
              action={{ label: 'Show resolved', onClick: () => setFilter('resolved') }}
            />
          ) : (
            <EmptyState
              title="No incidents in 90 days"
              body="Either things are healthy or nothing is being checked yet."
            />
          )
        ) : (
          <LayoutGroup>
            <div className="flex flex-col gap-4">
              {groups.map(([dayKey, rows]) => (
                <section key={dayKey} className="flex flex-col gap-2">
                  <h2 className="sticky top-0 z-[4] bg-canvas/95 py-1 font-display text-h4 uppercase tracking-[.04em] text-ink-muted backdrop-blur-[4px]">
                    {formatDayHeader(rows[0]!.openedAt, { now })}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {rows.map((inc) => (
                      <IncidentRow
                        key={inc.id}
                        incident={inc}
                        datasetDeleted={getDataset(inc.datasetId) === undefined}
                        onOpen={openDrawer}
                        onAck={ack}
                        onSnooze={snooze}
                        onResolve={resolve}
                        onNotify={renotify}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </LayoutGroup>
        )}
      </div>

      <IncidentDrawer
        open={incidentId !== undefined}
        incident={drawerIncident}
        onClose={closeDrawer}
        onAck={ack}
        onSnooze={(id) => snooze(id, '1h')}
        onResolve={resolve}
        onNotify={renotify}
      />
    </>
  )
}
