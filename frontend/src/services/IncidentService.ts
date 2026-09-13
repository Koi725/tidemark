import { incidentListSchema, incidentSchema } from '@/contracts'
import type { Incident, SnoozeChoice } from '@/contracts'
import { apiCommand, apiRequest, buildQuery, isLiveApi, NotFoundError } from '@/lib/api'
import { INCIDENTS } from '@/mocks/incidents'
import { clone, mock } from './mock'

export type IncidentFilter = 'open' | 'resolved' | 'all'

export interface IncidentService {
  list(filter: IncidentFilter): Promise<Incident[]>
  ack(id: string): Promise<Incident>
  snooze(id: string, choice: SnoozeChoice): Promise<Incident>
  resolve(id: string): Promise<Incident>
  notify(id: string): Promise<void>
}

/* ── mock (stateful) ── */

const store: Incident[] = clone([...INCIDENTS])

function find(id: string): Incident {
  const inc = store.find((x) => x.id === id)
  if (!inc) throw new NotFoundError(`Incident ${id} not found`)
  return inc
}

function applyFilter(list: Incident[], filter: IncidentFilter): Incident[] {
  if (filter === 'open') return list.filter((i) => i.status !== 'resolved')
  if (filter === 'resolved') return list.filter((i) => i.status === 'resolved')
  return list
}

const mockIncidentService: IncidentService = {
  list: (filter) => mock(clone(applyFilter(store, filter))),
  ack: (id) => {
    const inc = find(id)
    inc.status = 'acked'
    inc.ackedBy = 'advicemicro@gmail.com'
    return mock(clone(inc))
  },
  snooze: (id) => {
    const inc = find(id)
    inc.status = 'snoozed'
    return mock(clone(inc))
  },
  resolve: (id) => {
    const inc = find(id)
    inc.status = 'resolved'
    inc.resolvedAt = new Date().toISOString()
    return mock(clone(inc))
  },
  notify: () => mock(undefined),
}

/* ── real ── */

const realIncidentService: IncidentService = {
  list: (filter) => apiRequest(incidentListSchema, `/api/incidents${buildQuery({ filter })}`),
  ack: (id) => apiRequest(incidentSchema, `/api/incidents/${encodeURIComponent(id)}/ack`, { method: 'POST' }),
  snooze: (id, choice) =>
    apiRequest(incidentSchema, `/api/incidents/${encodeURIComponent(id)}/snooze`, {
      method: 'POST',
      body: { choice },
    }),
  resolve: (id) =>
    apiRequest(incidentSchema, `/api/incidents/${encodeURIComponent(id)}/resolve`, { method: 'POST' }),
  notify: (id) => apiCommand(`/api/incidents/${encodeURIComponent(id)}/notify`, { method: 'POST' }),
}

export const incidentService: IncidentService = isLiveApi()
  ? realIncidentService
  : mockIncidentService
