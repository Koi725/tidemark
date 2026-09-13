/*
 * Dataset states — transcription of spec §6.1 (authoritative).
 *
 * State → colour + icon + shape + label. Colours are not hard-coded here: each
 * state points at its --tm-{state}-fg / -bg tokens (defined in tokens.css) and
 * exposes the Tailwind utility key so a call site can build `text-ok`, `bg-ok-bg`,
 * `border-ok-border`, etc. Every status also carries a shape cue and text label:
 * per §6.1, state is NEVER rendered as colour alone.
 */

import {
  CircleCheck,
  CircleHelp,
  CirclePause,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'

export const DATASET_STATES = ['ok', 'warn', 'alert', 'unknown', 'paused'] as const

export type DatasetState = (typeof DATASET_STATES)[number]

export interface StateMeta {
  /** Uppercase text label shown in badges (OK · WARN · ALERT · UNKNOWN · PAUSED). */
  label: string
  /** Lucide icon for the state (stroke-width 1.8 per §6.1). */
  icon: LucideIcon
  /** Severity for rollups + sorting: alert > warn > unknown > ok > paused. */
  severity: number
  /** Non-colour shape cue, for a11y notes / documentation. */
  shape: string
  /** Utility-class key, e.g. text-${tone}, bg-${tone}-bg, border-${tone}-border. */
  tone: DatasetState
  /** Base foreground colour custom property from tokens.css. */
  cssVar: `--tm-${DatasetState}-fg`
}

export const stateMeta: Record<DatasetState, StateMeta> = {
  ok: {
    label: 'OK',
    icon: CircleCheck,
    severity: 1,
    shape: 'circle',
    tone: 'ok',
    cssVar: '--tm-ok-fg',
  },
  warn: {
    label: 'WARN',
    icon: TriangleAlert,
    severity: 3,
    shape: 'triangle',
    tone: 'warn',
    cssVar: '--tm-warn-fg',
  },
  alert: {
    label: 'ALERT',
    icon: OctagonAlert,
    severity: 4,
    shape: 'octagon',
    tone: 'alert',
    cssVar: '--tm-alert-fg',
  },
  unknown: {
    label: 'UNKNOWN',
    icon: CircleHelp,
    severity: 2,
    shape: 'circle + ?',
    tone: 'unknown',
    cssVar: '--tm-unknown-fg',
  },
  paused: {
    label: 'PAUSED',
    icon: CirclePause,
    severity: 0,
    shape: 'circle + bars',
    tone: 'paused',
    cssVar: '--tm-paused-fg',
  },
}

/** States ordered most urgent first: alert > warn > unknown > ok > paused. */
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

/**
 * The worst state among a set (§6.1). A source's rolled-up state is the worst
 * state among its datasets, ignoring `paused`; a day's strip state is the worst
 * state observed that day. Returns 'unknown' for an empty / all-paused input.
 */
export function worstState(
  states: readonly DatasetState[],
  { ignorePaused = true }: { ignorePaused?: boolean } = {},
): DatasetState {
  const pool = ignorePaused ? states.filter((s) => s !== 'paused') : states
  if (pool.length === 0) return 'unknown'
  return pool.reduce((worst, s) =>
    stateMeta[s].severity > stateMeta[worst].severity ? s : worst,
  )
}
