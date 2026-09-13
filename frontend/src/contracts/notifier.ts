import { z } from 'zod'

/* Notifier contract (§4 Screen 6). Wire snake_case → camelCase via .transform. */

export interface Notifier {
  id: string
  kind: string
  code: string
  name: string
  target: string
  lastSentAt: string | null
  events7d: number
  enabled: boolean
  failing?: boolean
}
export const notifierSchema = z
  .object({
    id: z.string(),
    kind: z.string(),
    code: z.string(),
    name: z.string(),
    target: z.string(),
    last_sent_at: z.string().nullable(),
    events_7d: z.number(),
    enabled: z.boolean(),
    failing: z.boolean().optional(),
  })
  .transform(
    (w): Notifier => ({
      id: w.id,
      kind: w.kind,
      code: w.code,
      name: w.name,
      target: w.target,
      lastSentAt: w.last_sent_at,
      events7d: w.events_7d,
      enabled: w.enabled,
      failing: w.failing,
    }),
  )
export const notifierListSchema = z.array(notifierSchema)
