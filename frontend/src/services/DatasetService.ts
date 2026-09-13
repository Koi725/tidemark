import {
  datasetDetailSchema,
  datasetSummaryListSchema,
  gapSeriesSchema,
  incidentListSchema,
  rowSeriesSchema,
  schemaDiffSchema,
} from '@/contracts'
import type {
  DatasetDetail,
  DatasetSummary,
  GapBucket,
  Incident,
  RowSeriesPoint,
  SchemaDiffEntry,
  TimeRange,
} from '@/contracts'
import { apiCommand, apiRequest, buildQuery, isLiveApi, NotFoundError } from '@/lib/api'
import { DATASETS, getDatasetDetail } from '@/mocks'
import { INCIDENTS } from '@/mocks/incidents'
import { clone, mock } from './mock'

export interface DatasetPatch {
  displayName?: string
  tags?: string[]
  timestampColumn?: string | null
  expectedEverySeconds?: number | null
  owner?: string
}

export interface DatasetService {
  list(): Promise<DatasetSummary[]>
  get(id: string): Promise<DatasetDetail>
  rowsSeries(id: string, range: TimeRange): Promise<RowSeriesPoint[]>
  freshnessSeries(id: string, range: TimeRange): Promise<GapBucket[]>
  schemaDiff(id: string, from: string, to: string): Promise<SchemaDiffEntry[]>
  incidents(id: string): Promise<Incident[]>
  patch(id: string, body: DatasetPatch): Promise<DatasetDetail>
  probe(id: string): Promise<void>
  pause(id: string): Promise<void>
  resume(id: string): Promise<void>
  stopMonitoring(id: string): Promise<void>
}

/* ── mock (stateful in-memory store) ── */

const store: DatasetSummary[] = clone([...DATASETS])
const nowIso = (): string => new Date().toISOString()

function find(id: string): DatasetSummary {
  const d = store.find((x) => x.id === id)
  if (!d) throw new NotFoundError(`Dataset ${id} not found`)
  return d
}

const mockDatasetService: DatasetService = {
  list: () => mock(clone(store)),
  get: (id) => mock(getDatasetDetail(find(id))),
  rowsSeries: (id, range) => mock(getDatasetDetail(find(id), range).rowsSeries),
  freshnessSeries: (id, range) => mock(getDatasetDetail(find(id), range).freshnessBuckets),
  schemaDiff: (id) => mock(getDatasetDetail(find(id)).schema),
  incidents: (id) => mock(clone(INCIDENTS.filter((i) => i.datasetId === id))),
  patch: (id, body) => {
    const d = find(id)
    if (body.displayName !== undefined) d.displayName = body.displayName
    if (body.tags !== undefined) d.tags = body.tags
    if (body.expectedEverySeconds !== undefined) d.expectedEverySeconds = body.expectedEverySeconds
    return mock(getDatasetDetail(d))
  },
  probe: (id) => {
    const d = find(id)
    d.lastRowAt = nowIso()
    return mock(undefined)
  },
  pause: (id) => {
    const d = find(id)
    d.paused = true
    d.pausedAt = nowIso()
    d.state = 'paused'
    return mock(undefined)
  },
  resume: (id) => {
    const d = find(id)
    d.paused = false
    d.pausedAt = null
    d.state = 'ok'
    return mock(undefined)
  },
  stopMonitoring: (id) => {
    const i = store.findIndex((x) => x.id === id)
    if (i >= 0) store.splice(i, 1)
    return mock(undefined)
  },
}

/* ── real ── */

const realDatasetService: DatasetService = {
  list: () => apiRequest(datasetSummaryListSchema, `/api/datasets${buildQuery({ view: 'summary' })}`),
  get: (id) => apiRequest(datasetDetailSchema, `/api/datasets/${encodeURIComponent(id)}`),
  rowsSeries: (id, range) =>
    apiRequest(
      rowSeriesSchema,
      `/api/datasets/${encodeURIComponent(id)}/series${buildQuery({ range, metric: 'rows' })}`,
    ),
  freshnessSeries: (id, range) =>
    apiRequest(
      gapSeriesSchema,
      `/api/datasets/${encodeURIComponent(id)}/series${buildQuery({ range, metric: 'freshness' })}`,
    ),
  schemaDiff: (id, from, to) =>
    apiRequest(
      schemaDiffSchema,
      `/api/datasets/${encodeURIComponent(id)}/schema/diff${buildQuery({ from, to })}`,
    ),
  incidents: (id) => apiRequest(incidentListSchema, `/api/datasets/${encodeURIComponent(id)}/incidents`),
  patch: (id, body) =>
    apiRequest(datasetDetailSchema, `/api/datasets/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  probe: (id) => apiCommand(`/api/datasets/${encodeURIComponent(id)}/probe`, { method: 'POST' }),
  pause: (id) => apiCommand(`/api/datasets/${encodeURIComponent(id)}/pause`, { method: 'POST' }),
  resume: (id) => apiCommand(`/api/datasets/${encodeURIComponent(id)}/resume`, { method: 'POST' }),
  stopMonitoring: (id) => apiCommand(`/api/datasets/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export const datasetService: DatasetService = isLiveApi() ? realDatasetService : mockDatasetService
