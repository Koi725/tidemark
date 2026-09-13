import { useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LayoutGroup } from 'motion/react'
import { IncidentRow } from '@/components/cards/IncidentRow'
import type { SnoozeChoice } from '@/components/cards/IncidentRow'
import { IncidentDrawer } from '@/components/overlays/IncidentDrawer'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Segmented } from '@/components/primitives'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { useNow } from '@/lib/clock'
import { formatDayHeader } from '@/lib/format'
import { useDatasets } from '@/features/datasets'
import {
  useIncidents,
  useAckIncident,
  useSnoozeIncident,
  useResolveIncident,
  useNotifyIncident,
} from '@/features/incidents'
import type { Incident } from '@/contracts'

type FilterId = 'open' | 'resolved' | 'all'

interface IncidentsSearch {
  filter: FilterId
  incident?: string
}

const FILTERS: readonly FilterId[] = ['open', 'resolved', 'all']
const DAY = 86_400_000
const WEEK = 7 * DAY

export const Route = createFileRoute('/_app/incidents')({
  component: IncidentsRoute,
  validateSearch: (search: Record<string, unknown>): IncidentsSearch => ({
    filter: FILTERS.includes(search.filter as FilterId) ? (search.filter as FilterId) : 'open',
    incident: typeof search.incident === 'string' ? search.incident : undefined,
  }),
})

function IncidentsRoute() {
  const { filter, incident: incidentId } = Route.useSearch()
  const navigate = useNavigate()
  const now = useNow()

  const incidentsQuery = useIncidents(filter)
  // The 'all' list drives the header counts + the deep-linked drawer.
  const allQuery = useIncidents('all')
  const datasetsQuery = useDatasets()

  const ack = useAckIncident()
  const snoozeM = useSnoozeIncident()
  const resolveM = useResolveIncident()
  const notifyM = useNotifyIncident()

  const setFilter = (next: FilterId): void => {
    void navigate({ to: '/incidents', search: { filter: next, incident: incidentId } })
  }
  const openDrawer = (id: string): void => {
    void navigate({ to: '/incidents', search: { filter, incident: id } })
  }
  const closeDrawer = (): void => {
    void navigate({ to: '/incidents', search: { filter, incident: undefined } })
  }

  const incidents = useMemo(() => incidentsQuery.data ?? [], [incidentsQuery.data])
  const all = allQuery.data ?? []
  const datasetIds = useMemo(() => new Set((datasetsQuery.data ?? []).map((d) => d.id)), [datasetsQuery.data])

  const filtered = useMemo(
    () => [...incidents].sort((a, b) => Date.parse(b.openedAt) - Date.parse(a.openedAt)),
    [incidents],
  )

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

  const openCount = all.filter((i) => i.status !== 'resolved').length
  const resolvedWeek = all.filter(
    (i) => i.status === 'resolved' && i.resolvedAt && now - Date.parse(i.resolvedAt) < WEEK,
  ).length

  const drawerIncident = incidentId ? all.find((i) => i.id === incidentId) : undefined

  const snooze = (id: string, choice: SnoozeChoice): void => snoozeM.mutate({ id, choice })
  const resolve = (id: string): void => {
    resolveM.mutate(id)
    if (incidentId === id) closeDrawer()
  }
  const renotify = (id: string): void => {
    const inc = all.find((i) => i.id === id)
    notifyM.mutate({ id, via: inc?.notifiedVia ?? [] })
  }

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
        {incidentsQuery.isPending ? (
          <div aria-busy="true" aria-label="Loading incidents" className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="row" />
            ))}
          </div>
        ) : incidentsQuery.isError ? (
          <ErrorState
            variant="page"
            headline="Couldn't load incidents"
            raw={'GET /api/incidents failed\nprobe_id=inc-1 attempt=1/3 next_retry=4s'}
            onRetry={() => void incidentsQuery.refetch()}
          />
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
                        datasetDeleted={!datasetIds.has(inc.datasetId)}
                        onOpen={openDrawer}
                        onAck={(id) => ack.mutate(id)}
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
        datasetDeleted={drawerIncident ? !datasetIds.has(drawerIncident.datasetId) : false}
        onClose={closeDrawer}
        onAck={(id) => ack.mutate(id)}
        onSnooze={(id) => snooze(id, '1h')}
        onResolve={resolve}
        onNotify={renotify}
      />
    </>
  )
}
