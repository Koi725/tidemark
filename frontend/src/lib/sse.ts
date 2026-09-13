import { useEffect, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { API_BASE, isLiveApi } from './api'
import { datasetKeys } from '@/features/datasets'
import { incidentKeys } from '@/features/incidents'
import { sourceKeys } from '@/features/sources'
import { notify, dismissToast } from '@/components/feedback/notify'
import type { DatasetDetail, DatasetSummary, Incident, Source } from '@/contracts'
import type { DatasetState } from './state'

/*
 * SSE client (§8.3 lib/sse.ts, §5.8). EventSource with exponential backoff
 * 1s→30s that patches the query cache via setQueryData — it NEVER refetches a
 * whole list on a tick. Against mocks, a local simulator drives the same events
 * so the UI is exercisable with no server.
 */

export type LiveStatus = 'connected' | 'reconnecting' | 'offline'

/* ── status store (module-level pub/sub, read via useLiveStatus) ── */

let status: LiveStatus = 'offline'
const listeners = new Set<() => void>()

function setStatus(next: LiveStatus): void {
  if (status === next) return
  status = next
  for (const l of listeners) l()
}

export function useLiveStatus(): LiveStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => status,
    () => status,
  )
}

/* ── event shapes ── */

type LiveEvent =
  | { type: 'dataset.state'; id: string; state: DatasetState; stateSince: string }
  | { type: 'dataset.probe'; id: string; lastRowAt: string }
  | { type: 'incident.opened'; incident: Incident }
  | { type: 'incident.resolved'; id: string; resolvedAt: string }
  | { type: 'source.state'; id: string; state: Source['state'] }

/* ── cache patching (never refetch a list) ── */

function patch(qc: QueryClient, event: LiveEvent): void {
  switch (event.type) {
    case 'dataset.state': {
      qc.setQueryData<DatasetSummary[]>(datasetKeys.list(), (old) =>
        old?.map((d) => (d.id === event.id ? { ...d, state: event.state, stateSince: event.stateSince } : d)),
      )
      qc.setQueryData<DatasetDetail>(datasetKeys.detail(event.id), (old) =>
        old ? { ...old, state: event.state, stateSince: event.stateSince } : old,
      )
      break
    }
    case 'dataset.probe': {
      qc.setQueryData<DatasetSummary[]>(datasetKeys.list(), (old) =>
        old?.map((d) => (d.id === event.id ? { ...d, lastRowAt: event.lastRowAt } : d)),
      )
      qc.setQueryData<DatasetDetail>(datasetKeys.detail(event.id), (old) =>
        old ? { ...old, lastRowAt: event.lastRowAt } : old,
      )
      break
    }
    case 'incident.opened': {
      for (const filter of ['open', 'all'] as const) {
        qc.setQueryData<Incident[]>(incidentKeys.list(filter), (old) =>
          old ? [event.incident, ...old.filter((i) => i.id !== event.incident.id)] : old,
        )
      }
      break
    }
    case 'incident.resolved': {
      qc.setQueriesData<Incident[]>({ queryKey: incidentKeys.all }, (old) =>
        old?.map((i) => (i.id === event.id ? { ...i, status: 'resolved', resolvedAt: event.resolvedAt } : i)),
      )
      break
    }
    case 'source.state': {
      qc.setQueryData<Source[]>(sourceKeys.list(), (old) =>
        old?.map((s) => (s.id === event.id ? { ...s, state: event.state } : s)),
      )
      break
    }
  }
}

/* ── client ── */

const OFFLINE_TOAST_ID = 'live-offline'

interface LiveClient {
  start(): void
  stop(): void
}

function createRealClient(qc: QueryClient): LiveClient {
  let source: EventSource | null = null
  let backoff = 1000
  let firstFailureAt = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let stopped = false

  const connect = (): void => {
    if (stopped) return
    source = new EventSource(`${API_BASE ?? ''}/api/stream`)
    source.onopen = () => {
      backoff = 1000
      firstFailureAt = 0
      dismissToast(OFFLINE_TOAST_ID)
      setStatus('connected')
    }
    source.onmessage = (e: MessageEvent<string>) => {
      try {
        patch(qc, JSON.parse(e.data) as LiveEvent)
      } catch {
        /* ignore malformed frame */
      }
    }
    source.onerror = () => {
      source?.close()
      const now = Date.now()
      if (firstFailureAt === 0) firstFailureAt = now
      if (now - firstFailureAt > 60_000) {
        setStatus('offline')
        notify('warn', 'Live updates offline — showing last known state', {
          persistent: true,
          id: OFFLINE_TOAST_ID,
          action: { label: 'Retry', onClick: () => connect() },
        })
      } else {
        setStatus('reconnecting')
      }
      reconnectTimer = setTimeout(connect, backoff)
      backoff = Math.min(backoff * 2, 30_000)
    }
  }

  return {
    start: () => {
      stopped = false
      connect()
    },
    stop: () => {
      stopped = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      source?.close()
    },
  }
}

function createMockClient(qc: QueryClient): LiveClient {
  let timer: ReturnType<typeof setInterval> | null = null
  return {
    start: () => {
      setStatus('connected')
      // Emit a gentle probe tick so freshness pills advance and cards patch —
      // demonstrating cache-patching without a whole-list refetch.
      timer = setInterval(() => {
        const list = qc.getQueryData<DatasetSummary[]>(datasetKeys.list())
        const fresh = list?.find((d) => d.state === 'ok' && !d.paused)
        if (fresh) patch(qc, { type: 'dataset.probe', id: fresh.id, lastRowAt: new Date().toISOString() })
      }, 9000)
    },
    stop: () => {
      if (timer) clearInterval(timer)
    },
  }
}

/** Start the live connection for the app session. Mount once in the app layout. */
export function useLiveUpdates(): void {
  const qc = useQueryClient()
  useEffect(() => {
    const client = isLiveApi() ? createRealClient(qc) : createMockClient(qc)
    client.start()
    return () => client.stop()
  }, [qc])
}
