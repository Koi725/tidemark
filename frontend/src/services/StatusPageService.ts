import { publicDatasetListSchema, publicStatusSchema, statusPageConfigSchema } from '@/contracts'
import type { PublicDataset, PublicStatus, StatusPageConfig } from '@/contracts'
import { apiRequest, isLiveApi, NotFoundError } from '@/lib/api'
import { STATUS_PAGE, getPublicStatus, previewDatasets } from '@/mocks'
import { clone, mock } from './mock'

export interface StatusPageService {
  get(): Promise<StatusPageConfig>
  put(config: StatusPageConfig): Promise<StatusPageConfig>
  /** Live editor preview for the selected dataset ids. */
  preview(datasetIds: string[]): Promise<PublicDataset[]>
  /** Unauthenticated public read; null when the slug is unknown/unpublished. */
  publicStatus(slug: string): Promise<PublicStatus | null>
}

/* ── mock (stateful) ── */

let config: StatusPageConfig = clone(STATUS_PAGE)

const mockStatusPageService: StatusPageService = {
  get: () => mock(clone(config)),
  put: (next) => {
    config = clone(next)
    return mock(clone(config))
  },
  preview: (datasetIds) => mock(previewDatasets(datasetIds)),
  publicStatus: (slug) => mock(getPublicStatus(slug)),
}

/* ── real ── */

function toWire(c: StatusPageConfig): Record<string, unknown> {
  return {
    title: c.title,
    slug: c.slug,
    theme: c.theme,
    dataset_ids: c.datasetIds,
    show_incidents: c.showIncidents,
    published: c.published,
    published_at: c.publishedAt,
  }
}

const realStatusPageService: StatusPageService = {
  get: () => apiRequest(statusPageConfigSchema, '/api/status-page'),
  put: (config) =>
    apiRequest(statusPageConfigSchema, '/api/status-page', { method: 'PUT', body: toWire(config) }),
  preview: (datasetIds) =>
    apiRequest(publicDatasetListSchema, '/api/status-page/preview', {
      method: 'POST',
      body: { dataset_ids: datasetIds },
    }),
  publicStatus: async (slug) => {
    try {
      return await apiRequest(publicStatusSchema, `/api/public/status/${encodeURIComponent(slug)}`)
    } catch (err) {
      if (err instanceof NotFoundError) return null
      throw err
    }
  },
}

export const statusPageService: StatusPageService = isLiveApi()
  ? realStatusPageService
  : mockStatusPageService
