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

/* ── Incidents (Screen 5) ───────────────────────────────────────────────── */

export type IncidentSeverity = 'warn' | 'alert'
export type IncidentStatus = 'open' | 'acked' | 'snoozed' | 'resolved'

export interface IncidentEvidence {
  label: string
  before: string
  after: string
}

export interface IncidentTimelineEntry {
  at: string
  kind: 'opened' | 'notified' | 'acked' | 'snoozed' | 'resolved' | 'note'
  text: string
}

export interface Incident {
  id: string
  datasetId: string
  datasetKey: string
  sourceName: string
  severity: IncidentSeverity
  title: string
  check: string
  openedAt: string
  resolvedAt: string | null
  status: IncidentStatus
  snoozedUntil: string | null
  ackedBy: string | null
  notifiedVia: string[]
  evidence: IncidentEvidence[]
  timeline: IncidentTimelineEntry[]
  raw: string
}

/* ── Notifiers + routing (Screen 6) ─────────────────────────────────────── */

export interface Notifier {
  id: string
  kind: string
  code: string
  name: string
  target: string
  lastSentAt: string | null
  events7d: number
  enabled: boolean
  /** True when the last three deliveries failed (§4 edge). */
  failing?: boolean
}

export interface Route {
  id: string
  scope: 'global' | 'source' | 'tag'
  scopeRef: string | null
  scopeLabel: string
  notifierIds: string[]
  minSeverity: IncidentSeverity
}

/* ── Connector JSON Schema (Screen 3 add-source wizard, §3.18) ───────────── */

export type JsonSchemaType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'

export interface JsonSchemaProperty {
  type: JsonSchemaType
  title: string
  description?: string
  format?: 'uri' | 'password'
  writeOnly?: boolean
  enum?: string[]
  items?: { type: JsonSchemaType }
  minimum?: number
  maximum?: number
  multipleOf?: number
  maxLength?: number
  default?: string | number | boolean
  placeholder?: string
  properties?: Record<string, JsonSchemaProperty>
  'x-mono'?: boolean
  'x-span'?: number
  'x-order'?: number
  'x-format'?: 'duration'
  'x-widget'?: 'sql'
}

export interface ConnectorSchema {
  type: string
  code: string
  name: string
  kinds: string
  version: number
  required: string[]
  properties: Record<string, JsonSchemaProperty>
}

/** A dataset discovered during the wizard's discovery step (§3.20). */
export interface DiscoveredDataset {
  key: string
  rows: number | null
  tsColumn: string | null
  kind?: 'table' | 'view' | 'prefix' | 'topic'
}
