import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { incidentService } from '@/services'
import type { IncidentFilter } from '@/services'
import { notify } from '@/components/feedback/notify'
import type { Incident, SnoozeChoice } from '@/contracts'

export const incidentKeys = {
  all: ['incidents'] as const,
  list: (filter: IncidentFilter) => [...incidentKeys.all, 'list', filter] as const,
}

export function useIncidents(filter: IncidentFilter) {
  return useQuery({ queryKey: incidentKeys.list(filter), queryFn: () => incidentService.list(filter) })
}

type Snapshot = ReadonlyArray<readonly [readonly unknown[], Incident[] | undefined]>

/** Patch a single incident across every cached incident list (optimistic). */
async function optimistic(qc: QueryClient, id: string, patch: Partial<Incident>): Promise<Snapshot> {
  await qc.cancelQueries({ queryKey: incidentKeys.all })
  const snapshot = qc.getQueriesData<Incident[]>({ queryKey: incidentKeys.all })
  qc.setQueriesData<Incident[]>({ queryKey: incidentKeys.all }, (old) =>
    old?.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  )
  return snapshot
}

function restore(qc: QueryClient, snapshot: Snapshot): void {
  for (const [key, data] of snapshot) qc.setQueryData(key, data)
}

export function useAckIncident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => incidentService.ack(id),
    onMutate: (id) => optimistic(qc, id, { status: 'acked' }),
    onError: (_e, _id, ctx) => {
      if (ctx) restore(qc, ctx)
      notify('alert', 'Couldn’t acknowledge — please retry')
    },
    onSuccess: () => notify('ok', 'Acknowledged'),
    onSettled: () => qc.invalidateQueries({ queryKey: incidentKeys.all }),
  })
}

const SNOOZE_TOAST: Record<SnoozeChoice, string> = {
  '1h': 'Snoozed for 1h',
  '4h': 'Snoozed for 4h',
  tomorrow: 'Snoozed until tomorrow 09:00',
  resolved: 'Snoozed until resolved',
}

export function useSnoozeIncident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; choice: SnoozeChoice }) => incidentService.snooze(v.id, v.choice),
    onMutate: (v) => optimistic(qc, v.id, { status: 'snoozed' }),
    onError: (_e, _v, ctx) => {
      if (ctx) restore(qc, ctx)
      notify('alert', 'Couldn’t snooze — please retry')
    },
    onSuccess: (_d, v) => notify('ok', SNOOZE_TOAST[v.choice]),
    onSettled: () => qc.invalidateQueries({ queryKey: incidentKeys.all }),
  })
}

export function useResolveIncident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => incidentService.resolve(id),
    onMutate: (id) => optimistic(qc, id, { status: 'resolved', resolvedAt: new Date().toISOString() }),
    onError: (_e, _id, ctx) => {
      if (ctx) restore(qc, ctx)
      notify('alert', 'Couldn’t resolve — please retry')
    },
    onSuccess: () => notify('ok', 'Resolved — will reopen if it recurs'),
    onSettled: () => qc.invalidateQueries({ queryKey: incidentKeys.all }),
  })
}

export function useNotifyIncident() {
  return useMutation({
    mutationFn: (v: { id: string; via: string[] }) => incidentService.notify(v.id),
    onSuccess: (_d, v) => notify('info', `Re-sent to ${v.via.join(', ') || 'notifiers'}`),
    onError: () => notify('alert', 'Couldn’t notify — please retry'),
  })
}
