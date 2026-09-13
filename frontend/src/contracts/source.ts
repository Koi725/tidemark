import { z } from 'zod'

/* Source contract (§4 Screen 3). Wire snake_case → camelCase via .transform. */

export const sourceStateSchema = z.enum(['ok', 'warn', 'alert', 'unknown'])

export const sourceSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    code: z.string(),
    host: z.string(),
    dataset_count: z.number(),
    state: sourceStateSchema,
    last_probe_at: z.string().nullable(),
    read_only_verified: z.boolean(),
    created_at: z.string(),
  })
  .transform((w) => ({
    id: w.id,
    name: w.name,
    type: w.type,
    code: w.code,
    host: w.host,
    datasetCount: w.dataset_count,
    state: w.state,
    lastProbeAt: w.last_probe_at,
    readOnlyVerified: w.read_only_verified,
    createdAt: w.created_at,
  }))
export type Source = z.infer<typeof sourceSchema>
export const sourceListSchema = z.array(sourceSchema)

/* ── Connector JSON Schema (§3.18) — a JSON Schema is already the wire format, so
 * this is a passthrough (no snake↔camel boundary). Recursive via z.lazy. ── */

export type JsonSchemaType = 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object'

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

const jsonSchemaTypeSchema = z.enum(['string', 'integer', 'number', 'boolean', 'array', 'object'])

export const jsonSchemaPropertySchema: z.ZodType<JsonSchemaProperty> = z.lazy(() =>
  z.object({
    type: jsonSchemaTypeSchema,
    title: z.string(),
    description: z.string().optional(),
    format: z.enum(['uri', 'password']).optional(),
    writeOnly: z.boolean().optional(),
    enum: z.array(z.string()).optional(),
    items: z.object({ type: jsonSchemaTypeSchema }).optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    multipleOf: z.number().optional(),
    maxLength: z.number().optional(),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
    placeholder: z.string().optional(),
    properties: z.record(z.string(), jsonSchemaPropertySchema).optional(),
    'x-mono': z.boolean().optional(),
    'x-span': z.number().optional(),
    'x-order': z.number().optional(),
    'x-format': z.literal('duration').optional(),
    'x-widget': z.literal('sql').optional(),
  }),
)

export const connectorSchema = z.object({
  type: z.string(),
  code: z.string(),
  name: z.string(),
  kinds: z.string(),
  version: z.number(),
  required: z.array(z.string()),
  properties: z.record(z.string(), jsonSchemaPropertySchema),
})
export type ConnectorSchema = z.infer<typeof connectorSchema>

/* ── Discovery (§3.20) ── */

export interface DiscoveredDataset {
  key: string
  rows: number | null
  tsColumn: string | null
  kind?: 'table' | 'view' | 'prefix' | 'topic'
}
export const discoveredDatasetSchema = z
  .object({
    key: z.string(),
    rows: z.number().nullable(),
    ts_column: z.string().nullable(),
    kind: z.enum(['table', 'view', 'prefix', 'topic']).optional(),
  })
  .transform((w): DiscoveredDataset => ({ key: w.key, rows: w.rows, tsColumn: w.ts_column, kind: w.kind }))
