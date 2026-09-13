import type { DatasetState } from '@/lib/state'
import type { DatasetKind, DatasetSummary } from './types'

const NOW = Date.now()
const iso = (secondsAgo: number): string => new Date(NOW - secondsAgo * 1000).toISOString()

/** Deterministic PRNG so fixtures render identically across reloads. */
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

/** 24-bucket sparkline shaped by state (§3.4). */
function sparkline(seed: number, state: DatasetState): number[] {
  if (state === 'unknown') return new Array(24).fill(0)
  const next = rng(seed)
  const base = 60 + Math.floor(next() * 40)
  const out: number[] = []
  for (let i = 0; i < 24; i += 1) {
    const wobble = (next() - 0.5) * base * 0.35
    let v = base + wobble
    if (state === 'warn' && i > 16) v *= 0.55
    if (state === 'alert' && i > 14) v *= Math.max(0.05, 1 - (i - 14) * 0.12)
    if (state === 'paused') v = base * 0.4
    out.push(Math.max(0, Math.round(v)))
  }
  return out
}

interface Seed {
  key: string
  displayName?: string
  source: 'src-pg' | 'src-kafka' | 'src-s3' | 'src-ch'
  kind?: DatasetKind
  tags?: string[]
  state: DatasetState
  rows?: number | null
  delta?: number | null
  checks?: number
  incidents?: number
  expected?: number | null
}

const SOURCE_META: Record<
  Seed['source'],
  { name: string; type: string; code: string }
> = {
  'src-pg': { name: 'warehouse-pg', type: 'Postgres', code: 'PG' },
  'src-kafka': { name: 'events-redpanda', type: 'Kafka / Redpanda', code: 'KF' },
  'src-s3': { name: 'lake-garage', type: 'S3 / Garage', code: 'S3' },
  'src-ch': { name: 'analytics-ch', type: 'ClickHouse', code: 'CH' },
}

const LAST_ROW_AGE: Record<DatasetState, number | null> = {
  ok: 240,
  warn: 1_260, // 21m — past a 15m warn window
  alert: 5_640, // 94m — past a 30m alert window
  unknown: null,
  paused: 7_200,
}

function build(seed: Seed, index: number): DatasetSummary {
  const meta = SOURCE_META[seed.source]
  const state = seed.state
  const paused = state === 'paused'
  const lastAge = LAST_ROW_AGE[state]
  return {
    id: `ds-${index}`,
    key: seed.key,
    displayName: seed.displayName ?? seed.key,
    sourceId: seed.source,
    sourceName: meta.name,
    sourceType: meta.type,
    sourceCode: meta.code,
    kind: seed.kind ?? 'table',
    tags: seed.tags ?? [],
    state,
    stateSince: iso(state === 'ok' ? 86_400 : (lastAge ?? 3_600)),
    lastRowAt: lastAge === null ? null : iso(lastAge),
    expectedEverySeconds: seed.expected === undefined ? 3_600 : seed.expected,
    warnAfterSeconds: 900,
    alertAfterSeconds: 1_800,
    rowsWindow: seed.rows === undefined ? 4_200 + index * 137 : seed.rows,
    volumeDeltaPct: seed.delta === undefined ? 1.4 : seed.delta,
    sparkline: sparkline(index * 1000 + 7, state),
    checkCount: seed.checks ?? 2,
    openIncidentCount: seed.incidents ?? (state === 'alert' ? 1 : 0),
    paused,
    pausedAt: paused ? iso(7_200) : null,
  }
}

const SEEDS: readonly Seed[] = [
  // ── warehouse-pg (14) — carries the alert / unknown / paused edge cases ──
  {
    key: 'public.orders',
    source: 'src-pg',
    tags: ['gold'],
    state: 'alert',
    rows: 0,
    delta: -100,
    incidents: 1,
    checks: 4,
  },
  {
    key: 'public.payment_settlements',
    source: 'src-pg',
    tags: ['gold', 'finance'],
    state: 'alert',
    rows: 12,
    delta: -98.4,
    incidents: 1,
    checks: 3,
  },
  {
    key: 'public.marketing_attribution_touchpoints_normalized_v2',
    displayName: 'public.marketing_attribution_touchpoints_normalized_v2',
    source: 'src-pg',
    tags: ['silver'],
    state: 'warn',
    delta: -41.2,
    checks: 3,
  },
  {
    key: 'public.customer_subscription_lifecycle_events_enriched',
    source: 'src-pg',
    tags: ['silver'],
    state: 'ok',
    delta: 3.1,
  },
  {
    key: 'public.inventory_snapshots',
    source: 'src-pg',
    tags: ['silver'],
    state: 'ok',
    delta: 0,
  },
  {
    key: 'public.refunds',
    source: 'src-pg',
    tags: ['gold', 'finance'],
    state: 'ok',
    delta: 2.2,
  },
  {
    key: 'public.shipments',
    source: 'src-pg',
    tags: ['silver'],
    state: 'ok',
    delta: -1.1,
  },
  {
    key: 'public.audit_log',
    source: 'src-pg',
    kind: 'view',
    tags: ['bronze'],
    state: 'ok',
    delta: 5.7,
  },
  {
    key: 'public.warehouse_bin_utilization_daily_rollup',
    source: 'src-pg',
    tags: ['bronze'],
    state: 'ok',
    delta: 1.9,
  },
  {
    key: 'public.suppliers',
    source: 'src-pg',
    tags: ['bronze'],
    state: 'ok',
    delta: 0.4,
  },
  {
    key: 'public.pricing_experiments',
    source: 'src-pg',
    tags: ['silver'],
    state: 'ok',
    delta: -0.8,
  },
  {
    key: 'public.returns_intake',
    source: 'src-pg',
    tags: ['bronze'],
    state: 'unknown',
    rows: null,
    delta: null,
    incidents: 0,
    expected: null,
  },
  {
    key: 'public.legacy_clickstream_2019',
    source: 'src-pg',
    tags: ['bronze', 'deprecated'],
    state: 'paused',
    delta: null,
  },
  {
    key: 'public.gift_cards',
    source: 'src-pg',
    tags: ['gold', 'finance'],
    state: 'ok',
    delta: 4.0,
  },

  // ── events-redpanda (9) — topics, lag-driven warn ──
  {
    key: 'payments.transactions.settlement.reconciliation.events',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['gold'],
    state: 'warn',
    rows: 1_284_310,
    delta: 22.6,
    checks: 3,
  },
  {
    key: 'orders.created',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['gold'],
    state: 'ok',
    rows: 842_005,
    delta: 6.2,
  },
  {
    key: 'orders.fulfilled',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['silver'],
    state: 'ok',
    rows: 611_920,
    delta: 3.3,
  },
  {
    key: 'clickstream.pageviews',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['bronze'],
    state: 'ok',
    rows: 9_120_400,
    delta: -2.1,
  },
  {
    key: 'clickstream.interactions',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['bronze'],
    state: 'ok',
    rows: 7_004_211,
    delta: 1.2,
  },
  {
    key: 'inventory.stock_changes',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['silver'],
    state: 'ok',
    rows: 220_004,
    delta: 0.9,
  },
  {
    key: 'notifications.email.delivery',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['bronze'],
    state: 'ok',
    rows: 55_320,
    delta: -0.5,
  },
  {
    key: 'fraud.scoring.decisions',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['gold'],
    state: 'ok',
    rows: 18_204,
    delta: 8.1,
  },
  {
    key: 'audit.security.access_events',
    source: 'src-kafka',
    kind: 'topic',
    tags: ['bronze'],
    state: 'ok',
    rows: 44_120,
    delta: 2.7,
  },

  // ── lake-garage (6 monitored prefixes) — long S3 keys ──
  {
    key: 's3://lake/raw/vendor_feeds/partner_atlas/clickstream_events_hourly/',
    source: 'src-s3',
    kind: 'prefix',
    tags: ['bronze'],
    state: 'ok',
    rows: 1_092,
    delta: 1.1,
  },
  {
    key: 's3://lake/raw/vendor_feeds/partner_orion/transactions_daily/',
    source: 'src-s3',
    kind: 'prefix',
    tags: ['silver'],
    state: 'warn',
    rows: 84,
    delta: -33.0,
  },
  {
    key: 's3://lake/curated/marketing/campaign_performance_snapshots/',
    source: 'src-s3',
    kind: 'prefix',
    tags: ['gold'],
    state: 'ok',
    rows: 512,
    delta: 0.6,
  },
  {
    key: 's3://lake/raw/iot/device_telemetry_partitioned/',
    source: 'src-s3',
    kind: 'prefix',
    tags: ['bronze'],
    state: 'ok',
    rows: 38_402,
    delta: 4.4,
  },
  {
    key: 's3://lake/exports/finance/gl_journal_entries/',
    source: 'src-s3',
    kind: 'prefix',
    tags: ['gold', 'finance'],
    state: 'ok',
    rows: 2_140,
    delta: 0.2,
  },
  {
    key: 's3://lake/raw/support/zendesk_ticket_exports/',
    source: 'src-s3',
    kind: 'prefix',
    tags: ['bronze'],
    state: 'ok',
    rows: 904,
    delta: -1.4,
  },

  // ── analytics-ch (5) — dbt models + tables ──
  {
    key: 'mart.revenue_daily',
    source: 'src-ch',
    kind: 'dbt model',
    tags: ['gold'],
    state: 'ok',
    delta: 2.9,
  },
  {
    key: 'mart.customer_ltv_cohorts_by_channel_and_region',
    source: 'src-ch',
    kind: 'dbt model',
    tags: ['gold'],
    state: 'ok',
    delta: 2.4,
    checks: 3,
  },
  {
    key: 'stg.web_sessions',
    source: 'src-ch',
    kind: 'dbt model',
    tags: ['silver'],
    state: 'ok',
    delta: 1.0,
  },
  {
    key: 'fct.order_items',
    source: 'src-ch',
    tags: ['silver'],
    state: 'ok',
    delta: 3.6,
  },
  {
    key: 'dim.products',
    source: 'src-ch',
    tags: ['bronze'],
    state: 'ok',
    delta: 0.1,
  },
]

export const DATASETS: readonly DatasetSummary[] = SEEDS.map(build)

export function getDataset(id: string): DatasetSummary | undefined {
  return DATASETS.find((d) => d.id === id)
}
