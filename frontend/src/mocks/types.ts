import type { DatasetState } from '@/lib/state'

export type DatasetKind = 'table' | 'view' | 'topic' | 'prefix' | 'dbt model' | 'dag'

/** Overview card shape (spec §4 / Screen 2 DatasetSummary). */
export interface DatasetSummary {
  id: string
  key: string
  displayName: string
  sourceId: string
  sourceName: string
  sourceType: string
  sourceCode: string
  kind: DatasetKind
  tags: string[]
  state: DatasetState
  stateSince: string
  lastRowAt: string | null
  expectedEverySeconds: number | null
  warnAfterSeconds: number
  alertAfterSeconds: number
  rowsWindow: number | null
  volumeDeltaPct: number | null
  sparkline: number[]
  checkCount: number
  openIncidentCount: number
  paused: boolean
  pausedAt: string | null
}

/** Connected source (spec §4 / Screen 3 Source). */
export interface Source {
  id: string
  name: string
  type: string
  code: string
  host: string
  datasetCount: number
  state: Exclude<DatasetState, 'paused'>
  lastProbeAt: string | null
  readOnlyVerified: boolean
  createdAt: string
}

/* ── Dataset-detail fixtures (Screen 4) ─────────────────────────────────── */

export interface RowSeriesPoint {
  t: string
  value: number
  baselineMean: number | null
  baselineSd: number | null
}

export interface GapBucket {
  t: string
  gapMinutes: number
  /** Still waiting for the next arrival — renders as a hatched bar (§3.12). */
  openEnded?: boolean
}

export interface SchemaDiffEntry {
  name: string
  type: string
  oldType?: string
  change: 'added' | 'removed' | 'changed' | 'none'
  nullable: boolean
  note?: string
}

export interface DatasetCheck {
  id: string
  name: string
  description: string
  enabled: boolean
  state: DatasetState
}

export interface ProbeLogRow {
  t: string
  result: 'ok' | 'warn' | 'alert'
  durationMs: number
  rows: number | null
}

export interface DatasetDetail extends DatasetSummary {
  host: string
  owner: string
  timestampColumn: string | null
  schema: SchemaDiffEntry[]
  checks: DatasetCheck[]
  freshnessBuckets: GapBucket[]
  rowsSeries: RowSeriesPoint[]
  warnMinutes: number
  alertMinutes: number
  probeLog: ProbeLogRow[]
  /** True when the volume baseline is still learning (§3.11 / §9). */
  baselineLearning: boolean
  baselineHoursLeft: number
}
