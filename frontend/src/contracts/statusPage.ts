import { z } from 'zod'
import { DATASET_STATES } from '@/lib/state'

/* Status page contracts (§4 Screen 7). Wire snake_case → camelCase via .transform. */

export const publicThemeSchema = z.enum(['auto', 'dark', 'light'])
export type PublicTheme = z.infer<typeof publicThemeSchema>

export const dayStateSchema = z.enum(['ok', 'warn', 'alert', 'none'])
export type DayState = z.infer<typeof dayStateSchema>

const datasetStateSchema = z.enum(DATASET_STATES)

export const statusPageConfigSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
    theme: publicThemeSchema,
    dataset_ids: z.array(z.string()),
    show_incidents: z.boolean(),
    published: z.boolean(),
    published_at: z.string().nullable(),
  })
  .transform((w) => ({
    title: w.title,
    slug: w.slug,
    theme: w.theme,
    datasetIds: w.dataset_ids,
    showIncidents: w.show_incidents,
    published: w.published,
    publishedAt: w.published_at,
  }))
export type StatusPageConfig = z.infer<typeof statusPageConfigSchema>

const statusDaySchema = z
  .object({ date: z.string(), state: dayStateSchema, fresh_pct: z.number() })
  .transform((w) => ({ date: w.date, state: w.state, freshPct: w.fresh_pct }))
export type StatusDay = z.infer<typeof statusDaySchema>

export const publicDatasetSchema = z
  .object({
    id: z.string(),
    key: z.string(),
    short_name: z.string(),
    state: datasetStateSchema,
    uptime_pct: z.number(),
    last_row_at: z.string().nullable(),
    days: z.array(statusDaySchema),
  })
  .transform((w) => ({
    id: w.id,
    key: w.key,
    shortName: w.short_name,
    state: w.state,
    uptimePct: w.uptime_pct,
    lastRowAt: w.last_row_at,
    days: w.days,
  }))
export type PublicDataset = z.infer<typeof publicDatasetSchema>
export const publicDatasetListSchema = z.array(publicDatasetSchema)

const publicIncidentSchema = z.object({ date: z.string(), title: z.string(), duration: z.string() })
export type PublicIncident = z.infer<typeof publicIncidentSchema>

export const publicStatusSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
    theme: publicThemeSchema,
    updated_at: z.string(),
    datasets: z.array(publicDatasetSchema),
    show_incidents: z.boolean(),
    recent_incidents: z.array(publicIncidentSchema),
  })
  .transform((w) => ({
    title: w.title,
    slug: w.slug,
    theme: w.theme,
    updatedAt: w.updated_at,
    datasets: w.datasets,
    showIncidents: w.show_incidents,
    recentIncidents: w.recent_incidents,
  }))
export type PublicStatus = z.infer<typeof publicStatusSchema>
