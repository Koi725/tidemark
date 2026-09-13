import type { DiscoveredDataset } from './types'

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

const PG_SCHEMAS = ['public', 'analytics', 'staging']
const PG_NOUNS = [
  'orders',
  'customers',
  'events',
  'sessions',
  'payments',
  'invoices',
  'shipments',
  'refunds',
  'products',
  'inventory',
  'clicks',
  'impressions',
  'subscriptions',
  'tickets',
  'audit_log',
  'webhooks',
]

const S3_ROOTS = ['raw', 'curated', 'exports', 'staging']
const S3_VENDORS = ['partner_atlas', 'partner_orion', 'partner_vega', 'internal', 'iot']

function pgKeys(count: number): DiscoveredDataset[] {
  const next = rng(101)
  const out: DiscoveredDataset[] = []
  for (let i = 0; i < count; i += 1) {
    const schema = PG_SCHEMAS[i % PG_SCHEMAS.length]
    const noun = PG_NOUNS[i % PG_NOUNS.length]
    const hasTs = next() > 0.12
    out.push({
      key: `${schema}.${noun}_${String(i).padStart(4, '0')}`,
      rows: Math.round(next() * 4_000_000),
      tsColumn: hasTs ? 'created_at' : null,
      kind: next() > 0.85 ? 'view' : 'table',
    })
  }
  return out
}

function s3Keys(count: number): DiscoveredDataset[] {
  const next = rng(202)
  const out: DiscoveredDataset[] = []
  for (let i = 0; i < count; i += 1) {
    const root = S3_ROOTS[i % S3_ROOTS.length]
    const vendor = S3_VENDORS[i % S3_VENDORS.length]
    out.push({
      key: `s3://lake/${root}/${vendor}/feed_${String(i).padStart(5, '0')}/`,
      rows: Math.round(next() * 20_000),
      tsColumn: next() > 0.3 ? 'partition_date' : null,
      kind: 'prefix',
    })
  }
  return out
}

function kafkaKeys(count: number): DiscoveredDataset[] {
  const next = rng(303)
  const domains = ['orders', 'payments', 'clickstream', 'inventory', 'fraud', 'audit']
  const events = ['created', 'updated', 'deleted', 'settled', 'scored', 'viewed']
  const out: DiscoveredDataset[] = []
  for (let i = 0; i < count; i += 1) {
    out.push({
      key: `${domains[i % domains.length]}.${events[i % events.length]}.${i}`,
      rows: Math.round(next() * 9_000_000),
      tsColumn: 'event_time',
      kind: 'topic',
    })
  }
  return out
}

/**
 * Discovered datasets for the wizard's discovery step (§3.20). The S3 connector
 * returns 10,412 objects — the "10k tables" virtualisation fixture.
 */
export function discoveredFor(type: string): DiscoveredDataset[] {
  switch (type) {
    case 's3':
      return s3Keys(10_412)
    case 'kafka':
      return kafkaKeys(42)
    case 'postgres':
      return pgKeys(1_284)
    case 'mysql':
    case 'clickhouse':
    case 'trino':
      return pgKeys(220)
    case 'duckdb':
    case 'iceberg':
    case 'airflow':
    case 'dbt':
      return pgKeys(18)
    default:
      return pgKeys(48)
  }
}
