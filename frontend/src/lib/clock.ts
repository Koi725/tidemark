/*
 * The single application ticker (spec §3.3).
 *
 * One shared clock drives every relative-time display so the whole UI updates on
 * the same frame. Behaviour:
 *  - 1s cadence while the tab is visible and something is subscribed;
 *  - a downshift cadence: after 60s continuously running it slows to 5s, and
 *    after 5 min to 30s, to avoid needless churn on long-lived idle screens;
 *  - visibilitychange pause: ticking stops entirely while the tab is hidden and
 *    resets to the 1s cadence (with an immediate tick) when it becomes visible;
 *  - it idles (no timer) whenever there are no subscribers.
 *
 * Cadence values are documented defaults — see
 * docs/adr/0004-format-and-state-rules.md.
 */

import { useSyncExternalStore } from 'react'

export interface CadenceStep {
  /** Apply this interval once elapsed run-time reaches `after` ms. */
  after: number
  /** Tick interval in ms. */
  interval: number
}

export const DEFAULT_CADENCE: readonly CadenceStep[] = [
  { after: 0, interval: 1000 },
  { after: 60_000, interval: 5000 },
  { after: 300_000, interval: 30_000 },
]

type Listener = (now: number) => void

export interface ClockOptions {
  cadence?: readonly CadenceStep[]
  /** Clock source; overridable for tests. */
  now?: () => number
}

export class Clock {
  private readonly listeners = new Set<Listener>()
  private readonly cadence: readonly CadenceStep[]
  private readonly nowFn: () => number
  private readonly onVisibility: () => void
  private timer: ReturnType<typeof setTimeout> | null = null
  private startedAt = 0
  private current: number

  constructor(options: ClockOptions = {}) {
    this.nowFn = options.now ?? (() => Date.now())
    this.cadence = options.cadence ?? DEFAULT_CADENCE
    this.current = this.nowFn()
    this.onVisibility = () => this.handleVisibility()
  }

  getNow(): number {
    return this.current
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    if (this.listeners.size === 1) this.start()
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size === 0) this.stop()
    }
  }

  private isHidden(): boolean {
    return typeof document !== 'undefined' && document.visibilityState === 'hidden'
  }

  private intervalFor(elapsed: number): number {
    let interval = this.cadence[0]?.interval ?? 1000
    for (const step of this.cadence) {
      if (elapsed >= step.after) interval = step.interval
    }
    return interval
  }

  private start(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibility)
    }
    if (this.isHidden()) return
    this.startedAt = this.nowFn()
    this.schedule()
  }

  private stop(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibility)
    }
  }

  private schedule(): void {
    const elapsed = this.nowFn() - this.startedAt
    const interval = this.intervalFor(elapsed)
    this.timer = setTimeout(() => {
      this.tick()
      this.schedule()
    }, interval)
  }

  private tick(): void {
    this.current = this.nowFn()
    for (const listener of this.listeners) listener(this.current)
  }

  private handleVisibility(): void {
    if (this.isHidden()) {
      if (this.timer !== null) {
        clearTimeout(this.timer)
        this.timer = null
      }
      return
    }
    // Became visible: reset to the fast cadence and emit immediately.
    if (this.listeners.size > 0 && this.timer === null) {
      this.startedAt = this.nowFn()
      this.tick()
      this.schedule()
    }
  }
}

/** The shared application clock. */
export const clock = new Clock()

/** Subscribe a component to the shared clock; returns the current time in ms. */
export function useNow(): number {
  return useSyncExternalStore(
    (onChange) => clock.subscribe(onChange),
    () => clock.getNow(),
    () => clock.getNow(),
  )
}
