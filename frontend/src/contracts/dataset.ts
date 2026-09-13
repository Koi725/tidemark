import { z } from 'zod'
import { DATASET_STATES } from '@/lib/state'
import { datasetCheckSchema } from './check'

/*
 * Dataset contracts (§4 Screens 2 & 4). Wire is snake_case; every schema crosses
 * to camelCase with an explicit .transform.
 */

const datasetStateSchema = z.enum(DATASET_STATES)

export const datasetKindSchema = z.enum(['table', 'view', 'topic', 'prefix', 'dbt model', 'dag'])
export type DatasetKind = z.infer<typeof datasetKindSchema>

export const timeRangeSchema = z.enum(['1h', '24h', '7d', '30d'])
export type TimeRange = z.infer<typeof timeRangeSchema>

export const seriesMetricSchema = z.enum(['freshness', 'rows'])
export type SeriesMetric = z.infer<typeof seriesMetricSchema>

/* ── summary ── */

const datasetSummaryWire = z.object({
  id: z.string(),
  key: z.string(),
  display_name: z.string(),
  source_id: z.string(),
  source_name: z.string(),
  source_type: z.string(),
  source_code: z.string(),
  kind: datasetKindSchema,
  tags: z.array(z.string()),
  state: datasetStateSchema,
  state_since: z.string(),
  last_row_at: z.string().nullable(),
  expected_every_seconds: z.number().nullable(),
  warn_after_seconds: z.number(),
  alert_after_seconds: z.number(),
  rows_window: z.number().nullable(),
  volume_delta_pct: z.number().nullable(),
  sparkline: z.array(z.number()),
  check_count: z.number(),
  open_incident_count: z.number(),
  paused: z.boolean(),
  paused_at: z.string().nullable(),
})

type DatasetSummaryWire = z.infer<typeof datasetSummaryWire>

function toSummary(w: DatasetSummaryWire) {
  return {
    id: w.id,
    key: w.key,
    displayName: w.display_name,
    sourceId: w.source_id,
    sourceName: w.source_name,
    sourceType: w.source_type,
    sourceCode: w.source_code,
    kind: w.kind,
    tags: w.tags,
    state: w.state,
    stateSince: w.state_since,
    lastRowAt: w.last_row_at,
    expectedEverySeconds: w.expected_every_seconds,
    warnAfterSeconds: w.warn_after_seconds,
    alertAfterSeconds: w.alert_after_seconds,
    rowsWindow: w.rows_window,
    volumeDeltaPct: w.volume_delta_pct,
    sparkline: w.sparkline,
    checkCount: w.check_count,
    openIncidentCount: w.open_incident_count,
    paused: w.paused,
    pausedAt: w.paused_at,
  }
}

export const datasetSummarySchema = datasetSummaryWire.transform(toSummary)
export type DatasetSummary = z.infer<typeof datasetSummarySchema>

/* ── nested detail pieces ── */

export const rowSeriesPointSchema = z
  .object({
    t: z.string(),
    value: z.number(),
    baseline_mean: z.number().nullable(),
    baseline_sd: z.number().nullable(),
  })
  .transform((w) => ({ t: w.t, value: w.value, baselineMean: w.baseline_mean, baselineSd: w.baseline_sd }))
export type RowSeriesPoint = z.infer<typeof rowSeriesPointSchema>

export interface GapBucket {
  t: string
  gapMinutes: number
  openEnded?: boolean
}
export const gapBucketSchema = z
  .object({
    t: z.string(),
    gap_minutes: z.number(),
    open_ended: z.boolean().optional(),
  })
  .transform((w): GapBucket => ({ t: w.t, gapMinutes: w.gap_minutes, openEnded: w.open_ended }))

export interface SchemaDiffEntry {
  name: string
  type: string
  oldType?: string
  change: 'added' | 'removed' | 'changed' | 'none'
  nullable: boolean
  note?: string
}
export const schemaDiffEntrySchema = z
  .object({
    name: z.string(),
    type: z.string(),
    old_type: z.string().optional(),
    change: z.enum(['added', 'removed', 'changed', 'none']),
    nullable: z.boolean(),
    note: z.string().optional(),
  })
  .transform(
    (w): SchemaDiffEntry => ({
      name: w.name,
      type: w.type,
      oldType: w.old_type,
      change: w.change,
      nullable: w.nullable,
      note: w.note,
    }),
  )

export const probeLogRowSchema = z
  .object({
    t: z.string(),
    result: z.enum(['ok', 'warn', 'alert']),
    duration_ms: z.number(),
    rows: z.number().nullable(),
  })
  .transform((w) => ({ t: w.t, result: w.result, durationMs: w.duration_ms, rows: w.rows }))
export type ProbeLogRow = z.infer<typeof probeLogRowSchema>

/* ── detail ── */

const datasetDetailWire = datasetSummaryWire.extend({
  host: z.string(),
  owner: z.string(),
  timestamp_column: z.string().nullable(),
  schema: z.array(schemaDiffEntrySchema),
  checks: z.array(datasetCheckSchema),
  freshness_buckets: z.array(gapBucketSchema),
  rows_series: z.array(rowSeriesPointSchema),
  warn_minutes: z.number(),
  alert_minutes: z.number(),
  probe_log: z.array(probeLogRowSchema),
  baseline_learning: z.boolean(),
  baseline_hours_left: z.number(),
})

export const datasetDetailSchema = datasetDetailWire.transform((w) => ({
  ...toSummary(w),
  host: w.host,
  owner: w.owner,
  timestampColumn: w.timestamp_column,
  schema: w.schema,
  checks: w.checks,
  freshnessBuckets: w.freshness_buckets,
  rowsSeries: w.rows_series,
  warnMinutes: w.warn_minutes,
  alertMinutes: w.alert_minutes,
  probeLog: w.probe_log,
  baselineLearning: w.baseline_learning,
  baselineHoursLeft: w.baseline_hours_left,
}))
export type DatasetDetail = z.infer<typeof datasetDetailSchema>

export const datasetSummaryListSchema = z.array(datasetSummarySchema)
export const rowSeriesSchema = z.array(rowSeriesPointSchema)
export const gapSeriesSchema = z.array(gapBucketSchema)
export const schemaDiffSchema = z.array(schemaDiffEntrySchema)
