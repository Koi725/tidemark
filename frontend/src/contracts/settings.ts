import { z } from 'zod'

/* Settings contract (§4 Screen 8). Wire snake_case → camelCase via .transform. */

const retentionSchema = z
  .object({
    raw_probes: z.string(),
    hourly_rollups: z.string(),
    schema_snapshots: z.string(),
  })
  .transform((w) => ({
    rawProbes: w.raw_probes,
    hourlyRollups: w.hourly_rollups,
    schemaSnapshots: w.schema_snapshots,
  }))
export type RetentionConfig = z.infer<typeof retentionSchema>

export const settingsSchema = z
  .object({
    email: z.string(),
    retention: retentionSchema,
    egress_strict: z.boolean(),
  })
  .transform((w) => ({ email: w.email, retention: w.retention, egressStrict: w.egress_strict }))
export type Settings = z.infer<typeof settingsSchema>
