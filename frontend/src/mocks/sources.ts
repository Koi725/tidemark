import type { Source } from './types'

const NOW = Date.now()
const iso = (secondsAgo: number): string => new Date(NOW - secondsAgo * 1000).toISOString()

/**
 * Four connected sources. `lake-s3` carries a 10,412-object catalogue — the
 * "one source with 10k tables" fixture (§ task DATA) — while only a handful of
 * its prefixes are monitored.
 */
export const SOURCES: readonly Source[] = [
  {
    id: 'src-pg',
    name: 'warehouse-pg',
    type: 'Postgres',
    code: 'PG',
    host: 'pg.internal:5432',
    datasetCount: 14,
    state: 'alert',
    lastProbeAt: iso(12),
    readOnlyVerified: true,
    createdAt: iso(86400 * 40),
  },
  {
    id: 'src-kafka',
    name: 'events-redpanda',
    type: 'Kafka / Redpanda',
    code: 'KF',
    host: 'redpanda.internal:9092',
    datasetCount: 9,
    state: 'warn',
    lastProbeAt: iso(31),
    readOnlyVerified: true,
    createdAt: iso(86400 * 26),
  },
  {
    id: 'src-s3',
    name: 'lake-garage',
    type: 'S3 / Garage',
    code: 'S3',
    host: 'garage.internal',
    datasetCount: 10412,
    state: 'ok',
    lastProbeAt: iso(48),
    readOnlyVerified: true,
    createdAt: iso(86400 * 18),
  },
  {
    id: 'src-ch',
    name: 'analytics-ch',
    type: 'ClickHouse',
    code: 'CH',
    host: 'clickhouse.internal:8123',
    datasetCount: 7,
    state: 'ok',
    lastProbeAt: iso(20),
    readOnlyVerified: true,
    createdAt: iso(86400 * 12),
  },
]

export function getSource(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id)
}
