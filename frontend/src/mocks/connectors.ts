import type { ConnectorSchema } from './types'

/*
 * Connector JSON Schemas driving the add-source wizard's SchemaDrivenForm (§3.18).
 * These exercise every supported control shape: string, uri/dsn (mono, span 2),
 * password, integer (min/max), enum≤3 (segmented), enum4+ (select), boolean
 * (switch), duration, string[] (TagInput), object (fieldset), x-widget sql.
 */

const postgres: ConnectorSchema = {
  type: 'postgres',
  code: 'PG',
  name: 'Postgres',
  kinds: 'tables · views',
  version: 3,
  required: ['host', 'database', 'user', 'password'],
  properties: {
    host: {
      type: 'string',
      title: 'Host',
      'x-mono': true,
      'x-order': 1,
      placeholder: 'pg.internal',
    },
    port: {
      type: 'integer',
      title: 'Port',
      minimum: 1,
      maximum: 65535,
      default: 5432,
      'x-order': 2,
    },
    database: { type: 'string', title: 'Database', 'x-mono': true, 'x-order': 3 },
    user: { type: 'string', title: 'Role', 'x-mono': true, 'x-order': 4, default: 'tidewatch_ro' },
    password: {
      type: 'string',
      title: 'Password',
      format: 'password',
      writeOnly: true,
      'x-order': 5,
    },
    sslmode: {
      type: 'string',
      title: 'SSL mode',
      enum: ['disable', 'require', 'verify-full'],
      default: 'require',
      'x-order': 6,
    },
    schemas: {
      type: 'array',
      title: 'Schemas',
      items: { type: 'string' },
      description: 'Leave empty to allow all schemas the role can see.',
      'x-order': 7,
    },
    probe_interval: {
      type: 'string',
      title: 'Probe interval',
      'x-format': 'duration',
      default: '5m',
      'x-order': 8,
    },
  },
}

const kafka: ConnectorSchema = {
  type: 'kafka',
  code: 'KF',
  name: 'Kafka / Redpanda',
  kinds: 'topics · lag',
  version: 2,
  required: ['brokers', 'sasl_mechanism'],
  properties: {
    brokers: {
      type: 'array',
      title: 'Brokers',
      items: { type: 'string' },
      description: 'host:port per broker.',
      'x-order': 1,
      'x-span': 2,
    },
    sasl_mechanism: {
      type: 'string',
      title: 'SASL mechanism',
      enum: ['SCRAM-SHA-256', 'SCRAM-SHA-512', 'PLAIN'],
      default: 'SCRAM-SHA-256',
      'x-order': 2,
    },
    username: { type: 'string', title: 'Username', 'x-mono': true, 'x-order': 3 },
    password: { type: 'string', title: 'Password', format: 'password', writeOnly: true, 'x-order': 4 },
    tls: { type: 'boolean', title: 'Use TLS', default: true, 'x-order': 5 },
    consumer_groups: {
      type: 'array',
      title: 'Consumer groups',
      items: { type: 'string' },
      description: 'Groups whose lag should be tracked.',
      'x-order': 6,
    },
  },
}

const s3: ConnectorSchema = {
  type: 's3',
  code: 'S3',
  name: 'S3 / Garage',
  kinds: 'prefixes · objects',
  version: 1,
  required: ['endpoint', 'bucket', 'access_key_id', 'secret_access_key'],
  properties: {
    endpoint: {
      type: 'string',
      title: 'Endpoint',
      format: 'uri',
      'x-mono': true,
      'x-span': 2,
      'x-order': 1,
      placeholder: 'https://garage.internal',
    },
    bucket: { type: 'string', title: 'Bucket', 'x-mono': true, 'x-order': 2 },
    region: { type: 'string', title: 'Region', default: 'garage', 'x-order': 3 },
    access_key_id: { type: 'string', title: 'Access key ID', 'x-mono': true, 'x-order': 4 },
    secret_access_key: {
      type: 'string',
      title: 'Secret access key',
      format: 'password',
      writeOnly: true,
      'x-order': 5,
    },
    prefix: {
      type: 'string',
      title: 'Prefix',
      'x-mono': true,
      'x-order': 6,
      placeholder: 'raw/',
    },
  },
}

const duckdb: ConnectorSchema = {
  type: 'duckdb',
  code: 'DK',
  name: 'DuckDB',
  kinds: 'file · tables',
  version: 1,
  required: ['path'],
  properties: {
    path: {
      type: 'string',
      title: 'File path',
      'x-mono': true,
      maxLength: 120,
      'x-order': 1,
      placeholder: '/data/warehouse.duckdb',
    },
    read_only: { type: 'boolean', title: 'Read-only', default: true, 'x-order': 2 },
    healthcheck: {
      type: 'string',
      title: 'Healthcheck query',
      'x-widget': 'sql',
      description: 'Optional — must be a read-only SELECT.',
      'x-order': 3,
      'x-span': 2,
    },
  },
}

function simple(
  type: string,
  code: string,
  name: string,
  kinds: string,
): ConnectorSchema {
  return {
    type,
    code,
    name,
    kinds,
    version: 1,
    required: ['host', 'user', 'password'],
    properties: {
      host: { type: 'string', title: 'Host', 'x-mono': true, 'x-order': 1, 'x-span': 2 },
      user: { type: 'string', title: 'User', 'x-mono': true, 'x-order': 2 },
      password: { type: 'string', title: 'Password', format: 'password', writeOnly: true, 'x-order': 3 },
    },
  }
}

export const CONNECTORS: readonly ConnectorSchema[] = [
  postgres,
  simple('mysql', 'MY', 'MySQL', 'tables'),
  simple('clickhouse', 'CH', 'ClickHouse', 'tables · parts'),
  simple('trino', 'TR', 'Trino', 'catalogs · tables'),
  duckdb,
  simple('iceberg', 'IC', 'Iceberg REST', 'snapshots'),
  s3,
  kafka,
  simple('airflow', 'AF', 'Airflow', 'DAG runs'),
  simple('dbt', 'DB', 'dbt', 'run results'),
]

export function getConnector(type: string): ConnectorSchema | undefined {
  return CONNECTORS.find((c) => c.type === type)
}
