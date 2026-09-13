import { z } from 'zod'

/* API token contract (§4 Screen 8). Wire snake_case → camelCase via .transform. */

export const tokenScopeSchema = z.enum(['read', 'probe', 'admin'])
export type TokenScope = z.infer<typeof tokenScopeSchema>

export const apiTokenSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    prefix: z.string(),
    scope: tokenScopeSchema,
    last_used_at: z.string().nullable(),
    created_at: z.string(),
  })
  .transform((w) => ({
    id: w.id,
    name: w.name,
    prefix: w.prefix,
    scope: w.scope,
    lastUsedAt: w.last_used_at,
    createdAt: w.created_at,
  }))
export type ApiToken = z.infer<typeof apiTokenSchema>
export const apiTokenListSchema = z.array(apiTokenSchema)

/** A freshly created token — the raw value is returned exactly once (§3.21). */
export const createdTokenSchema = z
  .object({ token: z.string(), record: apiTokenSchema })
  .transform((w) => ({ token: w.token, record: w.record }))
export type CreatedToken = z.infer<typeof createdTokenSchema>
