import { describe, expect, it } from 'vitest'
import {
  EMPTY,
  formatAge,
  formatAgo,
  formatBytes,
  formatConfigDuration,
  formatCount,
  formatDateTime,
  formatDayHeader,
  formatDelta,
  formatDuration,
  formatLag,
  formatPct,
  formatSnapshot,
  formatTime,
  formatVerboseAge,
  parseDuration,
} from './format'

const MINUS = '−'
const NOW = Date.parse('2026-09-13T14:22:35Z')
const ago = (ms: number): string => new Date(NOW - ms).toISOString()

describe('formatAge (§6.2)', () => {
  it('renders the exact thresholds', () => {
    expect(formatAge(null)).toBe(EMPTY)
    expect(formatAge(ago(4_000), { now: NOW })).toBe('4s')
    expect(formatAge(ago(47_000), { now: NOW })).toBe('47s')
    expect(formatAge(ago(31 * 60_000 + 4_000), { now: NOW })).toBe('31m 04s')
    expect(formatAge(ago(2 * 3_600_000 + 8 * 60_000), { now: NOW })).toBe('2h 08m')
    expect(formatAge(ago(3 * 86_400_000 + 4 * 3_600_000), { now: NOW })).toBe('3d 4h')
    expect(formatAge(ago(62 * 86_400_000), { now: NOW })).toBe('62d')
  })

  it('clamps clock skew to 0s and guards bad input', () => {
    expect(formatAge(ago(-5_000), { now: NOW })).toBe('0s')
    expect(formatAge('not-a-date')).toBe(EMPTY)
  })
})

describe('formatAgo (§6.2)', () => {
  it('renders coarse relative time', () => {
    expect(formatAgo(ago(45_000), { now: NOW })).toBe('45s ago')
    expect(formatAgo(ago(5 * 60_000), { now: NOW })).toBe('5m ago')
    expect(formatAgo(ago(3 * 3_600_000), { now: NOW })).toBe('3h ago')
    expect(formatAgo(ago(2 * 86_400_000), { now: NOW })).toBe('2d ago')
    expect(formatAgo(null)).toBe('never')
  })
})

describe('formatDuration (§6.2)', () => {
  it('drops seconds and leading-unit padding', () => {
    expect(formatDuration(45_000)).toBe('45s')
    expect(formatDuration(48 * 60_000)).toBe('48m')
    expect(formatDuration(72 * 60_000)).toBe('1h 12m')
    expect(formatDuration(3_600_000)).toBe('1h')
    expect(formatDuration(2 * 86_400_000 + 3 * 3_600_000)).toBe('2d 3h')
  })
})

describe('formatVerboseAge (§6.3)', () => {
  it('spells out the two largest units', () => {
    expect(formatVerboseAge(ago(31 * 60_000 + 4_000), { now: NOW })).toBe(
      '31 minutes 4 seconds',
    )
    expect(formatVerboseAge(null)).toBe('never')
  })
})

describe('formatCount (§6.3)', () => {
  it('groups up to 9,999,999 then abbreviates to 3 sig figs', () => {
    expect(formatCount(999)).toBe('999')
    expect(formatCount(1_284_310)).toBe('1,284,310')
    expect(formatCount(9_999_999)).toBe('9,999,999')
    expect(formatCount(18_200_000)).toBe('18.2M')
    expect(formatCount(1_090_000_000)).toBe('1.09B')
  })

  it('appends a unit noun and signs negatives', () => {
    expect(formatCount(1092, 'objects')).toBe('1,092 objects')
    expect(formatCount(-1500)).toBe(`${MINUS}1,500`)
    expect(formatCount(Number.NaN)).toBe(EMPTY)
  })
})

describe('formatBytes (§6.3)', () => {
  it('uses binary units with one decimal above 1 unit', () => {
    expect(formatBytes(934)).toBe('934 B')
    expect(formatBytes(12_700)).toBe('12.4 KiB')
    expect(formatBytes(3_250_585)).toBe('3.1 MiB')
    expect(formatBytes(4 * 1024 ** 4)).toBe('4.0 TiB')
  })
})

describe('formatPct (§6.3)', () => {
  it('picks decimals by magnitude', () => {
    expect(formatPct(0.4)).toBe('0.4%')
    expect(formatPct(4.2)).toBe('4.2%')
    expect(formatPct(42)).toBe('42%')
    expect(formatPct(5)).toBe('5%')
    expect(formatPct(100)).toBe('100%')
    expect(formatPct(99.2, { uptime: true })).toBe('99.2%')
  })
})

describe('formatDelta (§6.3)', () => {
  it('always signs with a Unicode minus', () => {
    expect(formatDelta(3.1, { format: (v) => formatPct(v, { decimals: 1 }) })).toBe('+3.1%')
    expect(formatDelta(-78, { format: (v) => formatPct(v) })).toBe(`${MINUS}78%`)
    expect(formatDelta(2, { format: (v) => formatCount(v, 'objects') })).toBe('+2 objects')
    expect(formatDelta(0, { format: (v) => formatPct(v, { decimals: 1 }) })).toBe('+0.0%')
  })
})

describe('formatLag (§6.3)', () => {
  it('groups under 100k, abbreviates above', () => {
    expect(formatLag(12_418)).toBe('12,418 msgs')
    expect(formatLag(1_200_000)).toBe('1.2M msgs')
  })
})

describe('config durations (§6.3)', () => {
  it('parses leniently and renders canonically', () => {
    expect(parseDuration('90')).toBe(90)
    expect(parseDuration('90s')).toBe(90)
    expect(parseDuration('1.5m')).toBe(90)
    expect(parseDuration('26h')).toBe(93_600)
    expect(parseDuration('nope')).toBeNull()
    expect(formatConfigDuration(900)).toBe('15m')
    expect(formatConfigDuration(93_600)).toBe('26h')
    expect(formatConfigDuration(14 * 86_400)).toBe('14d')
    expect(formatConfigDuration(45)).toBe('45s')
  })
})

describe('timestamps (§6.4)', () => {
  const iso = '2026-09-13T14:22:35Z'

  it('formats time, date-time and snapshots in UTC', () => {
    expect(formatTime(iso, { utc: true })).toBe('14:22')
    expect(formatTime(iso, { utc: true, seconds: true })).toBe('14:22:35')
    expect(formatDateTime(iso, { utc: true })).toBe('13 Sep 14:22')
    expect(formatSnapshot(iso, { utc: true })).toBe('2026-09-13 14:22')
  })

  it('renders day-group headers', () => {
    expect(formatDayHeader(iso, { utc: true, now: NOW })).toBe('Today')
    expect(formatDayHeader(iso, { utc: true, now: NOW + 86_400_000 })).toBe('Yesterday')
    expect(formatDayHeader(iso, { utc: true, now: NOW + 3 * 86_400_000 })).toBe('Sun 13 Sep')
  })
})
