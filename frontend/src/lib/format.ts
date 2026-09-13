/*
 * Formatting helpers — transcription of spec §6.2 (relative time), §6.3 (numbers)
 * and §6.4 (timestamps & timezone). Pure, deterministic, unit-tested.
 *
 * Conventions:
 *  - The em-dash EMPTY placeholder renders for null / unparseable input.
 *  - The typographic U+2212 MINUS SIGN is used for negative signs.
 *  - Latin digits are forced (numberingSystem:'latn') so tabular alignment holds
 *    regardless of locale (§6.3). navigator.language drives grouping + month
 *    names only; technical strings (keys, SQL, durations) are never localised.
 */

export const EMPTY = '—'
const MINUS = '−'

const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function toMs(input: number | Date | string): number {
  if (typeof input === 'number') return input
  if (input instanceof Date) return input.getTime()
  return Date.parse(input)
}

/* ────────────────────────── §6.2 relative time ────────────────────────── */

export interface AgeOptions {
  /** Reference "now" in ms. Default Date.now(). */
  now?: number
}

/**
 * The ticking age of an ISO timestamp (§6.2, exact thresholds):
 *   null → —              < 60s → {n}s
 *   < 60m → {m}m {ss}s    < 24h → {h}h {mm}m
 *   < 30d → {d}d {h}h     ≥ 30d → {d}d
 *   negative (clock skew) → 0s
 */
export function formatAge(iso: string | null, options: AgeOptions = {}): string {
  if (iso === null) return EMPTY
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return EMPTY
  const ms = (options.now ?? Date.now()) - ts
  if (ms < 0) return '0s'

  const s = Math.floor(ms / SEC)
  if (s < 60) return `${s}s`
  const m = Math.floor(ms / MIN)
  if (m < 60) return `${m}m ${pad2(s - m * 60)}s`
  const h = Math.floor(ms / HOUR)
  if (h < 24) return `${h}h ${pad2(m - h * 60)}m`
  const d = Math.floor(ms / DAY)
  if (d < 30) return `${d}d ${h - d * 24}h`
  return `${d}d`
}

/**
 * Coarser list meta form (§6.2): "{n}s ago" · "{n}m ago" · "{n}h ago" ·
 * "{n}d ago" · "never" when null.
 */
export function formatAgo(iso: string | null, options: AgeOptions = {}): string {
  if (iso === null) return 'never'
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return EMPTY
  const ms = Math.max(0, (options.now ?? Date.now()) - ts)
  if (ms < MIN) return `${Math.floor(ms / SEC)}s ago`
  if (ms < HOUR) return `${Math.floor(ms / MIN)}m ago`
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h ago`
  return `${Math.floor(ms / DAY)}d ago`
}

/**
 * Duration between two instants (§6.2: "resolved · 1h 12m") — formatAge without
 * padding on the leading unit and without seconds once minutes are reached.
 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return EMPTY
  const clamped = Math.max(0, ms)
  const s = Math.floor(clamped / SEC)
  if (s < 60) return `${s}s`
  const m = Math.floor(clamped / MIN)
  if (m < 60) return `${m}m`
  const h = Math.floor(clamped / HOUR)
  if (h < 24) {
    const mm = m - h * 60
    return mm > 0 ? `${h}h ${mm}m` : `${h}h`
  }
  const d = Math.floor(clamped / DAY)
  const hh = h - d * 24
  return hh > 0 ? `${d}d ${hh}h` : `${d}d`
}

/** Verbose age for aria-labels (§6.3): "31 minutes 4 seconds". */
export function formatVerboseAge(iso: string | null, options: AgeOptions = {}): string {
  if (iso === null) return 'never'
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return EMPTY
  const ms = Math.max(0, (options.now ?? Date.now()) - ts)
  const parts: string[] = []
  const units: ReadonlyArray<readonly [string, number]> = [
    ['day', DAY],
    ['hour', HOUR],
    ['minute', MIN],
    ['second', SEC],
  ]
  let remaining = ms
  let count = 0
  for (const [label, size] of units) {
    const value = Math.floor(remaining / size)
    if (value > 0 || (count === 0 && label === 'second')) {
      parts.push(`${value} ${label}${value === 1 ? '' : 's'}`)
      remaining -= value * size
      count += 1
    }
    if (count >= 2) break
  }
  return parts.length > 0 ? parts.join(' ') : '0 seconds'
}

/* ─────────────────────────────── §6.3 numbers ─────────────────────────── */

function grouped(n: number): string {
  return new Intl.NumberFormat(undefined, {
    numberingSystem: 'latn',
    maximumFractionDigits: 0,
  }).format(n)
}

/** 3 significant figures, trailing zeros trimmed (18.2 · 1.09 · 100). */
function sig3(value: number): string {
  const s = value.toPrecision(3)
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

function abbreviate(abs: number): string {
  if (abs < 1e9) return `${sig3(abs / 1e6)}M`
  if (abs < 1e12) return `${sig3(abs / 1e9)}B`
  return `${sig3(abs / 1e12)}T`
}

/**
 * Row counts (§6.3): grouped up to 9,999,999 (1,284,310); ≥10M → 3 sig figs +
 * unit (18.2M, 1.09B). An optional noun trails the number (18.2M msgs).
 */
export function formatCount(n: number, unit?: string): string {
  if (!Number.isFinite(n)) return EMPTY
  const sign = n < 0 ? MINUS : ''
  const abs = Math.abs(n)
  const core = abs < 10_000_000 ? grouped(Math.round(abs)) : abbreviate(abs)
  return `${sign}${core}${unit ? ` ${unit}` : ''}`
}

const BYTE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] as const

/** Binary bytes (§6.3): 934 B · 12.4 KiB · 3.1 MiB · 4.0 TiB (1 decimal ≥ 1 unit). */
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
  return `${sign}${value.toFixed(1)} ${BYTE_UNITS[unit]}`
}

export interface PctOptions {
  /** Uptime always shows one decimal (§6.3: 99.2%). */
  uptime?: boolean
  /** Force a fixed number of decimals. */
  decimals?: number
}

/**
 * Percentage from an already-scaled value (§6.3): one decimal when < 10 and
 * non-integer (0.4%, 4.2%), integer at ≥ 10 (42%); uptime always one decimal.
 */
export function formatPct(value: number, options: PctOptions = {}): string {
  if (!Number.isFinite(value)) return EMPTY
  const decimals =
    options.decimals ??
    (options.uptime || (Math.abs(value) < 10 && !Number.isInteger(value)) ? 1 : 0)
  return `${value.toFixed(decimals)}%`
}

export interface DeltaOptions {
  /** Formatter for the magnitude; default formatCount. */
  format?: (value: number) => string
}

/**
 * Signed change (§6.3), always with an explicit sign and Unicode minus:
 * +3.1%, −78%, +2 objects. Zero is up to the formatter (+0.0% via formatPct).
 */
export function formatDelta(n: number, options: DeltaOptions = {}): string {
  if (!Number.isFinite(n)) return EMPTY
  const format = options.format ?? ((v: number) => formatCount(v))
  const sign = n < 0 ? MINUS : '+'
  return `${sign}${format(Math.abs(n))}`
}

/** Consumer lag (§6.3): grouped under 100k (12,418 msgs), abbreviated above (1.2M msgs). */
export function formatLag(n: number): string {
  if (!Number.isFinite(n)) return EMPTY
  const sign = n < 0 ? MINUS : ''
  const abs = Math.abs(n)
  const core = abs < 100_000 ? grouped(Math.round(abs)) : abbreviate(abs)
  return `${sign}${core} msgs`
}

/* ──────────────── §6.3 config durations (lenient parse) ────────────────── */

/** Parse "90" · "90s" · "1.5m" · "26h" · "14d" into seconds; null if invalid. */
export function parseDuration(input: string): number | null {
  const match = /^\s*(\d+(?:\.\d+)?)\s*([smhd]?)\s*$/.exec(input)
  if (!match) return null
  const value = Number(match[1])
  if (!Number.isFinite(value)) return null
  const unit = match[2] || 's'
  const factor = unit === 'd' ? 86400 : unit === 'h' ? 3600 : unit === 'm' ? 60 : 1
  return Math.round(value * factor)
}

/** Render seconds canonically compact (§6.3): 15m · 26h · 14d · 400d · 45s. */
export function formatConfigDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return EMPTY
  const s = Math.max(0, Math.round(seconds))
  if (s < 60) return `${s}s`
  if (s % 86400 === 0) return `${s / 86400}d`
  if (s % 3600 === 0) return `${s / 3600}h`
  if (s % 60 === 0) return `${s / 60}m`
  return `${s}s`
}

/* ─────────────────────────── §6.4 timestamps ──────────────────────────── */

interface TsParts {
  year: number
  month: number
  day: number
  weekday: number
  hours: number
  minutes: number
  seconds: number
}

function parts(ms: number, utc: boolean): TsParts {
  const d = new Date(ms)
  return utc
    ? {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth(),
        day: d.getUTCDate(),
        weekday: d.getUTCDay(),
        hours: d.getUTCHours(),
        minutes: d.getUTCMinutes(),
        seconds: d.getUTCSeconds(),
      }
    : {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        weekday: d.getDay(),
        hours: d.getHours(),
        minutes: d.getMinutes(),
        seconds: d.getSeconds(),
      }
}

export interface TsOptions {
  /** Use UTC getters instead of local time (Settings "Show times in UTC"). */
  utc?: boolean
  /** Include seconds in the time portion. */
  seconds?: boolean
}

/** Time only, 24h always (§6.4): "14:02" · with seconds "14:02:11". */
export function formatTime(
  input: number | Date | string,
  options: TsOptions = {},
): string {
  const ms = toMs(input)
  if (!Number.isFinite(ms)) return EMPTY
  const p = parts(ms, options.utc ?? false)
  const base = `${pad2(p.hours)}:${pad2(p.minutes)}`
  return options.seconds ? `${base}:${pad2(p.seconds)}` : base
}

/** Date + time (§6.4): "10 Sep 14:02". */
export function formatDateTime(
  input: number | Date | string,
  options: TsOptions = {},
): string {
  const ms = toMs(input)
  if (!Number.isFinite(ms)) return EMPTY
  const p = parts(ms, options.utc ?? false)
  return `${p.day} ${MONTHS_SHORT[p.month]} ${formatTime(ms, options)}`
}

/** Snapshot header (§6.4, mono): "2026-09-10 14:05". */
export function formatSnapshot(
  input: number | Date | string,
  options: TsOptions = {},
): string {
  const ms = toMs(input)
  if (!Number.isFinite(ms)) return EMPTY
  const p = parts(ms, options.utc ?? false)
  return `${p.year}-${pad2(p.month + 1)}-${pad2(p.day)} ${pad2(p.hours)}:${pad2(p.minutes)}`
}

/** Full tooltip timestamp (§6.4): "2026-09-10 14:02:11" (+ offset when local). */
export function formatFullTs(
  input: number | Date | string,
  options: TsOptions = {},
): string {
  const ms = toMs(input)
  if (!Number.isFinite(ms)) return EMPTY
  const utc = options.utc ?? false
  const p = parts(ms, utc)
  const stamp = `${p.year}-${pad2(p.month + 1)}-${pad2(p.day)} ${pad2(p.hours)}:${pad2(p.minutes)}:${pad2(p.seconds)}`
  if (utc) return `${stamp} +00:00 (UTC)`
  const offsetMin = -new Date(ms).getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  const offset = `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
  let zone: string
  try {
    zone = new Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  } catch {
    zone = ''
  }
  return zone ? `${stamp} ${offset} (${zone})` : `${stamp} ${offset}`
}

export interface DayHeaderOptions extends TsOptions {
  /** Reference "now" in ms. Default Date.now(). */
  now?: number
}

/** Day-group header (§6.4): "Today" · "Yesterday" · "Mon 8 Sep". */
export function formatDayHeader(
  input: number | Date | string,
  options: DayHeaderOptions = {},
): string {
  const ms = toMs(input)
  if (!Number.isFinite(ms)) return EMPTY
  const utc = options.utc ?? false
  const p = parts(ms, utc)
  const nowParts = parts(options.now ?? Date.now(), utc)

  const dayIndex = (y: number, m: number, d: number): number =>
    Math.floor(Date.UTC(y, m, d) / DAY)
  const target = dayIndex(p.year, p.month, p.day)
  const today = dayIndex(nowParts.year, nowParts.month, nowParts.day)

  if (target === today) return 'Today'
  if (target === today - 1) return 'Yesterday'
  return `${WEEKDAYS_SHORT[p.weekday]} ${p.day} ${MONTHS_SHORT[p.month]}`
}
