import { settingsSchema } from '@/contracts'
import type { RetentionConfig, Settings } from '@/contracts'
import { apiRequest, isLiveApi } from '@/lib/api'
import { SETTINGS } from '@/mocks/settings'
import { clone, mock } from './mock'

export interface SettingsPatch {
  email?: string
  retention?: RetentionConfig
  egressStrict?: boolean
}

export interface SettingsService {
  get(): Promise<Settings>
  patch(body: SettingsPatch): Promise<Settings>
}

/* ── mock (stateful) ── */

let store: Settings = clone(SETTINGS)

const mockSettingsService: SettingsService = {
  get: () => mock(clone(store)),
  patch: (body) => {
    store = {
      email: body.email ?? store.email,
      retention: body.retention ?? store.retention,
      egressStrict: body.egressStrict ?? store.egressStrict,
    }
    return mock(clone(store))
  },
}

/* ── real ── */

function toWire(body: SettingsPatch): Record<string, unknown> {
  const wire: Record<string, unknown> = {}
  if (body.email !== undefined) wire.email = body.email
  if (body.egressStrict !== undefined) wire.egress_strict = body.egressStrict
  if (body.retention !== undefined) {
    wire.retention = {
      raw_probes: body.retention.rawProbes,
      hourly_rollups: body.retention.hourlyRollups,
      schema_snapshots: body.retention.schemaSnapshots,
    }
  }
  return wire
}

const realSettingsService: SettingsService = {
  get: () => apiRequest(settingsSchema, '/api/settings'),
  patch: (body) => apiRequest(settingsSchema, '/api/settings', { method: 'PATCH', body: toWire(body) }),
}

export const settingsService: SettingsService = isLiveApi()
  ? realSettingsService
  : mockSettingsService
