import {
  connectorSchema,
  discoveredDatasetSchema,
  sourceListSchema,
} from '@/contracts'
import { z } from 'zod'
import type { ConnectorSchema, DiscoveredDataset, Source } from '@/contracts'
import { apiCommand, apiRequest, buildQuery, isLiveApi, NotFoundError } from '@/lib/api'
import { SOURCES, CONNECTORS, discoveredFor } from '@/mocks'
import { clone, mock } from './mock'

export interface SourceService {
  list(): Promise<Source[]>
  probe(id: string): Promise<void>
  remove(id: string): Promise<void>
  connectorSchema(type: string): Promise<ConnectorSchema>
  discover(type: string): Promise<DiscoveredDataset[]>
}

const discoveredListSchema = z.array(discoveredDatasetSchema)

/* ── mock ── */

const store: Source[] = clone([...SOURCES])

const mockSourceService: SourceService = {
  list: () => mock(clone(store)),
  probe: () => mock(undefined),
  remove: (id) => {
    const i = store.findIndex((s) => s.id === id)
    if (i >= 0) store.splice(i, 1)
    return mock(undefined)
  },
  connectorSchema: (type) => {
    const c = CONNECTORS.find((x) => x.type === type)
    if (!c) throw new NotFoundError(`Connector ${type} not found`)
    return mock(clone(c))
  },
  discover: (type) => mock(discoveredFor(type)),
}

/* ── real ── */

const realSourceService: SourceService = {
  list: () => apiRequest(sourceListSchema, '/api/sources'),
  probe: (id) => apiCommand(`/api/sources/${encodeURIComponent(id)}/probe`, { method: 'POST' }),
  remove: (id) => apiCommand(`/api/sources/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  connectorSchema: (type) =>
    apiRequest(connectorSchema, `/api/connectors/${encodeURIComponent(type)}/schema`),
  discover: (type) =>
    apiRequest(
      discoveredListSchema,
      `/api/connectors/${encodeURIComponent(type)}/discover${buildQuery({ limit: 500 })}`,
    ),
}

export const sourceService: SourceService = isLiveApi() ? realSourceService : mockSourceService
