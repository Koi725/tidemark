/*
 * Formatting helpers (spec §6.2/§6.3/§6.4). The exact rules below are documented
 * defaults — see docs/adr/0004-format-and-state-rules.md — implemented to be pure,
 * deterministic and fully unit-tested (src/lib/format.test.ts).
 *
 * Conventions:
 *  - A non-finite or unparseable input renders the em-dash placeholder EMPTY.
 *  - Durations are milliseconds. Timestamps accept number(ms) | Date | ISO string.
 *  - The minus in signed output uses the typographic U+2212 MINUS SIGN.
 */

export const EMPTY = '—'
const MINUS = '−'

const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const YEAR = 365 * DAY

const AGE_UNITS: ReadonlyArray<readonly [string, number]> = [
  ['y', YEAR],
  ['w', WEEK],
  ['d', DAY],
  ['h', HOUR],
  ['m', MIN],
  ['s', SEC],
]

const COUNT_UNITS: ReadonlyArray<readonly [string, number]> = [
  ['T', 1e12],
  ['B', 1e9],
  ['M', 1e6],
  ['k', 1e3],
]

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

/** Drop a trailing `.0` produced by toFixed. */
function trimZeros(value: string): string {
  return value.includes('.') ? value.replace(/\.?0+$/, '') : value
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function toMs(input: number | Date | string): number {
  if (typeof input === 'number') return input
  if (input instanceof Date) return input.getTime()
  return Date.parse(input)
}

export interface FormatAgeOptions {
  /** How many successive units to include, e.g. 2 → "2h 5m". Default 1. */
  maxUnits?: number
}

/** Compact duration: 45s · 3m · 2h · 4d · 3w · 2y (`maxUnits` adds precision). */
export function formatAge(ms: number, options: FormatAgeOptions = {}): string {
  if (!Number.isFinite(ms)) return EMPTY
  const maxUnits = Math.max(1, options.maxUnits ?? 1)
  let remaining = Math.max(0, Math.floor(ms))
  if (remaining < SEC) return '0s'

  const parts: string[] = []
  for (const [label, size] of AGE_UNITS) {
    if (parts.length >= maxUnits) break
    const value = Math.floor(remaining / size)
    if (value <= 0) {
      if (parts.length === 0) continue
      break
    }
    parts.push(`${value}${label}`)
    remaining -= value * size
  }
  return parts.length > 0 ? parts.join(' ') : '0s'
}

export interface FormatAgoOptions extends FormatAgeOptions {
  /** Reference "now" in ms. Default Date.now(). */
  now?: number
}

/** Relative time: "just now" · "3m ago" · "in 5m". */
export function formatAgo(
  input: number | Date | string,
  options: FormatAgoOptions = {},
): string {
  const ts = toMs(input)
  if (!Number.isFinite(ts)) return EMPTY
  const now = options.now ?? Date.now()
  const diff = now - ts
  if (Math.abs(diff) < 5 * SEC) return 'just now'
  const age = formatAge(Math.abs(diff), { maxUnits: options.maxUnits })
  return diff >= 0 ? `${age} ago` : `in ${age}`
}

/** Compact count: 1 → "1" · 1200 → "1.2k" · 3_400_000 → "3.4M". */
export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return EMPTY
  const sign = n < 0 ? MINUS : ''
  const abs = Math.abs(n)
  if (abs < 1000) return `${sign}${Math.round(abs)}`
  for (const [label, size] of COUNT_UNITS) {
    if (abs >= size) {
      const value = abs / size
      const decimals = value < 10 ? 1 : 0
      return `${sign}${trimZeros(value.toFixed(decimals))}${label}`
    }
  }
  return `${sign}${Math.round(abs)}`
}

/** Binary bytes: 512 → "512 B" · 1536 → "1.5 KB" · 5_242_880 → "5 MB". */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n)) return EMPTY
  const sign = n < 0 ? MINUS : ''
  const abs = Math.abs(n)
  if (abs < 1024) return `${sign}${Math.round(abs)} B`
  let value = abs
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  const decimals = value < 10 ? 1 : 0
  return `${sign}${trimZeros(value.toFixed(decimals))} ${BYTE_UNITS[unit]}`
}

export interface FormatPctOptions {
  /** Fixed number of decimals; defaults to auto (1 below 10%, else 0). */
  decimals?: number
}

/** Percentage from a 0..1 ratio: 0.42 → "42%" · 0.004 → "0.4%". */
export function formatPct(ratio: number, options: FormatPctOptions = {}): string {
  if (!Number.isFinite(ratio)) return EMPTY
  const pct = ratio * 100
  const decimals =
    options.decimals ??
    (Math.abs(pct) < 10 && !Number.isInteger(pct) ? 1 : 0)
  return `${trimZeros(pct.toFixed(decimals))}%`
}

export interface FormatDeltaOptions {
  /** Formatter for the magnitude; default formatCount. */
  format?: (value: number) => string
}

/** Signed change: 12 → "+12" · -3 → "−3" · 0 → "0". */
export function formatDelta(n: number, options: FormatDeltaOptions = {}): string {
  if (!Number.isFinite(n)) return EMPTY
  if (n === 0) return '0'
  const format = options.format ?? formatCount
  const sign = n > 0 ? '+' : MINUS
  return `${sign}${format(Math.abs(n))}`
}

export interface FormatTsOptions {
  /** Use UTC getters instead of local time. */
  utc?: boolean
  /** Include seconds in the time portion. */
  seconds?: boolean
  /** Render only the date portion. */
  dateOnly?: boolean
  /** Render only the time portion. */
  timeOnly?: boolean
}

/** Absolute timestamp: "2026-09-13 14:22" (local, 24h). */
export function formatTs(
  input: number | Date | string,
  options: FormatTsOptions = {},
): string {
  const ms = toMs(input)
  if (!Number.isFinite(ms)) return EMPTY
  const d = new Date(ms)
  const { utc = false, seconds = false, dateOnly = false, timeOnly = false } = options

  const year = utc ? d.getUTCFullYear() : d.getFullYear()
  const month = (utc ? d.getUTCMonth() : d.getMonth()) + 1
  const day = utc ? d.getUTCDate() : d.getDate()
  const hours = utc ? d.getUTCHours() : d.getHours()
  const minutes = utc ? d.getUTCMinutes() : d.getMinutes()
  const secs = utc ? d.getUTCSeconds() : d.getSeconds()

  const date = `${year}-${pad2(month)}-${pad2(day)}`
  const time = `${pad2(hours)}:${pad2(minutes)}${seconds ? `:${pad2(secs)}` : ''}`

  if (dateOnly) return date
  if (timeOnly) return time
  return `${date} ${time}`
}
