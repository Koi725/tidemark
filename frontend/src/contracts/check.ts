import { z } from 'zod'
import { DATASET_STATES } from '@/lib/state'

/*
 * Check contract (§4 Screen 4 · Checks tab). Wire is snake_case; the boundary is
 * crossed explicitly with .transform — never an auto-mapper.
 */

const datasetStateSchema = z.enum(DATASET_STATES)

export const datasetCheckSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    enabled: z.boolean(),
    state: datasetStateSchema,
  })
  .transform((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
    enabled: w.enabled,
    state: w.state,
  }))

export type DatasetCheck = z.infer<typeof datasetCheckSchema>
