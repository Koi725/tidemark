import type { DatasetState } from './state'

/*
 * Literal Tailwind class maps per dataset state. Kept as full literal strings (not
 * `text-${state}`) so the Tailwind v4 scanner emits every utility. Components
 * import these instead of building class names dynamically.
 */

export const STATE_FG: Record<DatasetState, string> = {
  ok: 'text-ok',
  warn: 'text-warn',
  alert: 'text-alert',
  unknown: 'text-unknown',
  paused: 'text-paused',
}

export const STATE_BG: Record<DatasetState, string> = {
  ok: 'bg-ok-bg',
  warn: 'bg-warn-bg',
  alert: 'bg-alert-bg',
  unknown: 'bg-unknown-bg',
  paused: 'bg-transparent',
}

export const STATE_BORDER: Record<DatasetState, string> = {
  ok: 'border-ok-border',
  warn: 'border-warn-border',
  alert: 'border-alert-border',
  unknown: 'border-unknown-border',
  paused: 'border-paused-border',
}
