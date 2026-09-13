import { apiCommand, isLiveApi } from '@/lib/api'
import { mock } from './mock'

/** Check mutations (§4 Screen 4 · Checks tab). Reads come via the dataset detail. */
export interface CheckService {
  toggle(datasetId: string, checkId: string, enabled: boolean): Promise<void>
  save(datasetId: string, checkId: string, fields: Record<string, unknown>): Promise<void>
  run(datasetId: string, checkId: string): Promise<void>
}

const enc = encodeURIComponent

const mockCheckService: CheckService = {
  toggle: () => mock(undefined),
  save: () => mock(undefined),
  run: () => mock(undefined),
}

const realCheckService: CheckService = {
  toggle: (datasetId, checkId, enabled) =>
    apiCommand(`/api/datasets/${enc(datasetId)}/checks/${enc(checkId)}`, { method: 'PATCH', body: { enabled } }),
  save: (datasetId, checkId, fields) =>
    apiCommand(`/api/datasets/${enc(datasetId)}/checks/${enc(checkId)}`, { method: 'PUT', body: fields }),
  run: (datasetId, checkId) =>
    apiCommand(`/api/datasets/${enc(datasetId)}/checks/${enc(checkId)}/run`, { method: 'POST' }),
}

export const checkService: CheckService = isLiveApi() ? realCheckService : mockCheckService
