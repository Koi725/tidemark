/*
 * Dataset freshness states (spec §6.1). The set of states, their severity
 * ordering and their colour/icon/label mapping are documented defaults — see
 * docs/adr/0004-format-and-state-rules.md.
 *
 * Colours are not hard-coded here: `cssVar` points at the theme token defined in
 * src/styles/tokens.css and `tone` is the utility key (e.g. text-fresh, bg-fresh-bg).
 */

import {
  CircleCheck,
  CircleHelp,
  CirclePause,
  CircleX,
  Clock,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'

export const DATASET_STATES = [
  'fresh',
  'stale',
  'late',
  'error',
  'unknown',
  'paused',
] as const

export type DatasetState = (typeof DATASET_STATES)[number]

export interface StateMeta {
  /** Human label. */
  label: string
  /** Lucide icon component for the state. */
  icon: LucideIcon
  /** Higher number = more urgent. */
  severity: number
  /** Utility-class key, e.g. `text-${tone}` / `bg-${tone}-bg`. */
  tone: DatasetState
  /** Base colour custom property from tokens.css. */
  cssVar: `--tm-state-${DatasetState}`
}

export const stateMeta: Record<DatasetState, StateMeta> = {
  fresh: { label: 'Fresh', icon: CircleCheck, severity: 1, tone: 'fresh', cssVar: '--tm-state-fresh' },
  stale: { label: 'Stale', icon: Clock, severity: 3, tone: 'stale', cssVar: '--tm-state-stale' },
  late: { label: 'Late', icon: TriangleAlert, severity: 4, tone: 'late', cssVar: '--tm-state-late' },
  error: { label: 'Error', icon: CircleX, severity: 5, tone: 'error', cssVar: '--tm-state-error' },
  unknown: { label: 'Unknown', icon: CircleHelp, severity: 2, tone: 'unknown', cssVar: '--tm-state-unknown' },
  paused: { label: 'Paused', icon: CirclePause, severity: 0, tone: 'paused', cssVar: '--tm-state-paused' },
}

/** States ordered most urgent first. */
export const severityOrder: readonly DatasetState[] = [...DATASET_STATES].sort(
  (a, b) => stateMeta[b].severity - stateMeta[a].severity,
)

/** Array#sort comparator placing the most urgent state first. */
export function compareBySeverity(a: DatasetState, b: DatasetState): number {
  return stateMeta[b].severity - stateMeta[a].severity
}

export function isDatasetState(value: string): value is DatasetState {
  return (DATASET_STATES as readonly string[]).includes(value)
}
