import { z } from 'zod'
import { incidentSeveritySchema } from './incident'

/* Routing contract (§3.22 / Screen 6). Wire snake_case → camelCase via .transform. */

export const routeSchema = z
  .object({
    id: z.string(),
    scope: z.enum(['global', 'source', 'tag']),
    scope_ref: z.string().nullable(),
    scope_label: z.string(),
    notifier_ids: z.array(z.string()),
    min_severity: incidentSeveritySchema,
  })
  .transform((w) => ({
    id: w.id,
    scope: w.scope,
    scopeRef: w.scope_ref,
    scopeLabel: w.scope_label,
    notifierIds: w.notifier_ids,
    minSeverity: w.min_severity,
  }))
export type Route = z.infer<typeof routeSchema>
export const routeListSchema = z.array(routeSchema)
