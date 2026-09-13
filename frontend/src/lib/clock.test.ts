import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Clock } from './clock'

function setVisibility(state: 'visible' | 'hidden'): void {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  })
}

describe('Clock (§3.3)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    setVisibility('visible')
  })

  afterEach(() => {
    vi.useRealTimers()
    setVisibility('visible')
  })

  it('ticks once per second while visible (flat 1000ms cadence)', () => {
    const clock = new Clock()
    const seen: number[] = []
    const unsub = clock.subscribe((now) => seen.push(now))

    expect(clock.getNow()).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(seen).toEqual([1000])
    vi.advanceTimersByTime(1000)
    expect(seen).toEqual([1000, 2000])

    // Cadence stays flat — no downshift after the first minute (§3.3).
    vi.advanceTimersByTime(60_000)
    expect(seen).toHaveLength(62)

    unsub()
  })

  it('idles when the last subscriber leaves', () => {
    const clock = new Clock()
    const seen: number[] = []
    const unsub = clock.subscribe(() => seen.push(1))
    vi.advanceTimersByTime(2000)
    expect(seen).toHaveLength(2)

    unsub()
    vi.advanceTimersByTime(10_000)
    expect(seen).toHaveLength(2)
  })

  it('pauses while hidden and resumes on visibilitychange', () => {
    setVisibility('hidden')
    const clock = new Clock()
    const seen: number[] = []
    const unsub = clock.subscribe(() => seen.push(1))

    vi.advanceTimersByTime(5000)
    expect(seen).toHaveLength(0)

    setVisibility('visible')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(seen).toHaveLength(1) // immediate tick on resume

    vi.advanceTimersByTime(1000)
    expect(seen).toHaveLength(2)

    unsub()
  })
})
