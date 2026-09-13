import { describe, expect, it } from 'vitest'
import {
  EMPTY,
  formatAge,
  formatAgo,
  formatBytes,
  formatCount,
  formatDelta,
  formatPct,
  formatTs,
} from './format'

const MINUS = '−'

describe('formatAge', () => {
  it('renders compact single units', () => {
    expect(formatAge(0)).toBe('0s')
    expect(formatAge(500)).toBe('0s')
    expect(formatAge(45_000)).toBe('45s')
    expect(formatAge(60_000)).toBe('1m')
    expect(formatAge(185_000)).toBe('3m')
    expect(formatAge(3_600_000)).toBe('1h')
    expect(formatAge(172_800_000)).toBe('2d')
  })

  it('supports multi-unit precision', () => {
    expect(formatAge(185_000, { maxUnits: 2 })).toBe('3m 5s')
    expect(formatAge(90_000, { maxUnits: 2 })).toBe('1m 30s')
    expect(formatAge(3_600_000, { maxUnits: 2 })).toBe('1h')
  })

  it('guards bad input', () => {
    expect(formatAge(-5)).toBe('0s')
    expect(formatAge(Number.POSITIVE_INFINITY)).toBe(EMPTY)
    expect(formatAge(Number.NaN)).toBe(EMPTY)
  })
})

describe('formatAgo', () => {
  const now = Date.parse('2026-09-13T14:22:35Z')

  it('renders relative time both directions', () => {
    expect(formatAgo(now - 2000, { now })).toBe('just now')
    expect(formatAgo(now - 200_000, { now })).toBe('3m ago')
    expect(formatAgo(now + 200_000, { now })).toBe('in 3m')
  })

  it('guards bad input', () => {
    expect(formatAgo('not-a-date')).toBe(EMPTY)
  })
})

describe('formatCount', () => {
  it('compacts large numbers', () => {
    expect(formatCount(999)).toBe('999')
    expect(formatCount(1000)).toBe('1k')
    expect(formatCount(1200)).toBe('1.2k')
    expect(formatCount(12_000)).toBe('12k')
    expect(formatCount(1_234_000)).toBe('1.2M')
    expect(formatCount(3_400_000_000)).toBe('3.4B')
  })

  it('handles sign and bad input', () => {
    expect(formatCount(0)).toBe('0')
    expect(formatCount(-1500)).toBe(`${MINUS}1.5k`)
    expect(formatCount(Number.NaN)).toBe(EMPTY)
  })
})

describe('formatBytes', () => {
  it('formats binary units', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5_242_880)).toBe('5 MB')
    expect(formatBytes(1_073_741_824)).toBe('1 GB')
  })
})

describe('formatPct', () => {
  it('formats a 0..1 ratio', () => {
    expect(formatPct(0.42)).toBe('42%')
    expect(formatPct(0.5)).toBe('50%')
    expect(formatPct(1)).toBe('100%')
    expect(formatPct(0.004)).toBe('0.4%')
  })

  it('honours fixed decimals', () => {
    expect(formatPct(0.1234, { decimals: 1 })).toBe('12.3%')
  })
})

describe('formatDelta', () => {
  it('adds an explicit sign', () => {
    expect(formatDelta(0)).toBe('0')
    expect(formatDelta(12)).toBe('+12')
    expect(formatDelta(-3)).toBe(`${MINUS}3`)
    expect(formatDelta(1500)).toBe('+1.5k')
    expect(formatDelta(-1500)).toBe(`${MINUS}1.5k`)
  })
})

describe('formatTs', () => {
  const iso = '2026-09-13T14:22:35Z'

  it('formats absolute timestamps (utc)', () => {
    expect(formatTs(iso, { utc: true })).toBe('2026-09-13 14:22')
    expect(formatTs(iso, { utc: true, seconds: true })).toBe('2026-09-13 14:22:35')
    expect(formatTs(iso, { utc: true, dateOnly: true })).toBe('2026-09-13')
    expect(formatTs(iso, { utc: true, timeOnly: true })).toBe('14:22')
  })

  it('guards bad input', () => {
    expect(formatTs('nope')).toBe(EMPTY)
  })
})
