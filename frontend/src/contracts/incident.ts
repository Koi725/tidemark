import { z } from 'zod'

/* Incident contract (§4 Screen 5). Wire snake_case → camelCase via .transform. */

export const incidentSeveritySchema = z.enum(['warn', 'alert'])
export type IncidentSeverity = z.infer<typeof incidentSeveritySchema>

export const incidentStatusSchema = z.enum(['open', 'acked', 'snoozed', 'resolved'])
export type IncidentStatus = z.infer<typeof incidentStatusSchema>

const evidenceSchema = z.object({ label: z.string(), before: z.string(), after: z.string() })
export type IncidentEvidence = z.infer<typeof evidenceSchema>

const timelineSchema = z
  .object({
    at: z.string(),
    kind: z.enum(['opened', 'notified', 'acked', 'snoozed', 'resolved', 'note']),
    text: z.string(),
  })
export type IncidentTimelineEntry = z.infer<typeof timelineSchema>

export const incidentSchema = z
  .object({
    id: z.string(),
    dataset_id: z.string(),
    dataset_key: z.string(),
    source_name: z.string(),
    severity: incidentSeveritySchema,
    title: z.string(),
    check: z.string(),
    opened_at: z.string(),
    resolved_at: z.string().nullable(),
    status: incidentStatusSchema,
    snoozed_until: z.string().nullable(),
    acked_by: z.string().nullable(),
    notified_via: z.array(z.string()),
    evidence: z.array(evidenceSchema),
    timeline: z.array(timelineSchema),
    raw: z.string(),
  })
  .transform((w) => ({
    id: w.id,
    datasetId: w.dataset_id,
    datasetKey: w.dataset_key,
    sourceName: w.source_name,
    severity: w.severity,
    title: w.title,
    check: w.check,
    openedAt: w.opened_at,
    resolvedAt: w.resolved_at,
    status: w.status,
    snoozedUntil: w.snoozed_until,
    ackedBy: w.acked_by,
    notifiedVia: w.notified_via,
    evidence: w.evidence,
    timeline: w.timeline,
    raw: w.raw,
  }))
export type Incident = z.infer<typeof incidentSchema>
export const incidentListSchema = z.array(incidentSchema)

export const snoozeChoiceSchema = z.enum(['1h', '4h', 'tomorrow', 'resolved'])
export type SnoozeChoice = z.infer<typeof snoozeChoiceSchema>
