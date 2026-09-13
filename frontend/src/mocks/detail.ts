import type {
  DatasetCheck,
  DatasetDetail,
  DatasetSummary,
  GapBucket,
  ProbeLogRow,
  RowSeriesPoint,
  SchemaDiffEntry,
} from './types'

export type TimeRange = '1h' | '24h' | '7d' | '30d'

const NOW = Date.now()

function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedOf(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const RANGE_MS: Record<TimeRange, number> = {
  '1h': 3_600_000,
  '24h': 86_400_000,
  '7d': 604_800_000,
  '30d': 2_592_000_000,
}

const FRESHNESS_BUCKETS: Record<TimeRange, number> = { '1h': 12, '24h': 48, '7d': 42, '30d': 30 }
const ROW_POINTS: Record<TimeRange, number> = { '1h': 12, '24h': 24, '7d': 28, '30d': 30 }

function freshnessBuckets(
  summary: DatasetSummary,
  range: TimeRange,
): GapBucket[] {
  const n = FRESHNESS_BUCKETS[range]
  const next = rng(seedOf(summary.id) + 11)
  const span = RANGE_MS[range]
  const out: GapBucket[] = []
  for (let i = 0; i < n; i += 1) {
    const t = new Date(NOW - span + (i / n) * span).toISOString()
    let gap = 3 + next() * 8
    if (summary.state === 'warn' && i > n - 6) gap = 16 + next() * 8
    if (summary.state === 'alert' && i > n - 4) gap = 32 + next() * 20
    const openEnded = summary.state === 'alert' && i === n - 1
    out.push({ t, gapMinutes: Math.round(gap), openEnded })
  }
  return out
}

function rowsSeries(
  summary: DatasetSummary,
  range: TimeRange,
  learning: boolean,
): RowSeriesPoint[] {
  const n = ROW_POINTS[range]
  const next = rng(seedOf(summary.id) + 29)
  const span = RANGE_MS[range]
  const mean = summary.rowsWindow ? Math.max(20, Math.round(summary.rowsWindow / 24)) : 180
  const sd = Math.max(4, Math.round(mean * 0.18))
  const out: RowSeriesPoint[] = []
  for (let i = 0; i < n; i += 1) {
    const t = new Date(NOW - span + (i / n) * span).toISOString()
    let value = mean + (next() - 0.5) * sd * 2
    if (summary.state === 'alert' && i > n - 4) value *= 0.05
    if (summary.state === 'warn' && i > n - 5) value *= 0.5
    if (i === Math.floor(n * 0.4)) value = mean + sd * 3.4 // an outlier
    out.push({
      t,
      value: Math.max(0, Math.round(value)),
      baselineMean: learning ? null : mean,
      baselineSd: learning ? null : sd,
    })
  }
  return out
}

function schemaFor(summary: DatasetSummary): SchemaDiffEntry[] {
  const drift = summary.state === 'warn' || summary.tags.includes('gold')
  const base: SchemaDiffEntry[] = [
    { name: 'id', type: 'bigint', change: 'none', nullable: false },
    { name: 'created_at', type: 'timestamptz', change: 'none', nullable: false },
    { name: 'updated_at', type: 'timestamptz', change: 'none', nullable: true },
    { name: 'status', type: 'text', change: 'none', nullable: false },
    { name: 'amount', type: 'numeric(12,2)', change: 'none', nullable: true },
  ]
  if (!drift) return base
  return [
    ...base,
    { name: 'plan', type: 'text', change: 'added', nullable: true, note: 'added · nullable' },
    {
      name: 'currency',
      type: 'text',
      oldType: 'varchar(3)',
      change: 'changed',
      nullable: false,
      note: 'widened',
    },
    { name: 'legacy_ref', type: 'text', change: 'removed', nullable: true, note: 'removed' },
  ]
}

const CHECKS_BY_KIND: Record<string, Array<[string, string]>> = {
  topic: [
    ['Freshness', 'Warn after 15m, alert after 30m'],
    ['Kafka lag', 'Warn above 10k, alert above 100k'],
    ['Volume', 'Baseline ±2σ, min 100 rows'],
  ],
  prefix: [
    ['Freshness', 'Warn after 6h, alert after 24h'],
    ['Volume', 'Object count vs baseline'],
  ],
  default: [
    ['Freshness', 'Warn after 15m, alert after 30m'],
    ['Volume', 'Baseline ±2σ, min 50 rows'],
    ['Schema drift', 'Alert on removed columns'],
  ],
}

function checksFor(summary: DatasetSummary): DatasetCheck[] {
  const catalogue = CHECKS_BY_KIND[summary.kind] ?? CHECKS_BY_KIND.default ?? []
  return catalogue.map(([name, description], i) => ({
    id: `${summary.id}-check-${i}`,
    name,
    description,
    enabled: true,
    state:
      i === 0 && summary.state !== 'ok' && summary.state !== 'paused'
        ? summary.state
        : 'ok',
  }))
}

function probeLog(summary: DatasetSummary): ProbeLogRow[] {
  const next = rng(seedOf(summary.id) + 71)
  const out: ProbeLogRow[] = []
  for (let i = 0; i < 10; i += 1) {
    const t = new Date(NOW - i * 3_600_000).toISOString()
    const result: ProbeLogRow['result'] =
      i === 0 && summary.state === 'alert'
        ? 'alert'
        : i < 2 && summary.state === 'warn'
          ? 'warn'
          : 'ok'
    out.push({
      t,
      result,
      durationMs: 20 + Math.round(next() * 60),
      rows: summary.rowsWindow === null ? null : Math.round(180 + next() * 60),
    })
  }
  return out
}

/** Expand an Overview summary into the full detail fixture (Screen 4). */
export function getDatasetDetail(
  summary: DatasetSummary,
  range: TimeRange = '24h',
): DatasetDetail {
  const learning = summary.state === 'unknown'
  return {
    ...summary,
    host:
      summary.sourceCode === 'S3'
        ? 'garage.internal'
        : summary.sourceCode === 'KF'
          ? 'redpanda.internal:9092'
          : summary.sourceCode === 'CH'
            ? 'clickhouse.internal:8123'
            : 'pg.internal:5432',
    owner: 'data-platform@acme.dev',
    timestampColumn: summary.state === 'unknown' ? null : 'created_at',
    schema: schemaFor(summary),
    checks: checksFor(summary),
    freshnessBuckets: freshnessBuckets(summary, range),
    rowsSeries: rowsSeries(summary, range, learning),
    warnMinutes: 15,
    alertMinutes: 30,
    probeLog: probeLog(summary),
    baselineLearning: learning,
    baselineHoursLeft: learning ? 14 : 0,
  }
}
