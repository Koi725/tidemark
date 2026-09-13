/*
 * The single application ticker (spec §3.3).
 *
 * One shared clock drives every relative-time display. Per §3.3 the cadence is a
 * flat 1000ms setInterval; the per-pill downshift (recompute every 10th / 60th
 * tick as the age grows) lives in FreshnessPill, not here. Behaviour:
 *   - 1s cadence while the tab is visible and something is subscribed;
 *   - the interval is paused entirely while document.hidden, and emits one
 *     immediate tick on visibilitychange when the tab becomes visible again;
 *   - it idles (no timer) whenever there are no subscribers.
 */

import { useSyncExternalStore } from 'react'

const TICK_MS = 1000

type Listener = (now: number) => void

export interface ClockOptions {
  /** Tick interval in ms. Default 1000 (§3.3). */
  interval?: number
  /** Clock source; overridable for tests. */
  now?: () => number
}

export class Clock {
  private readonly listeners = new Set<Listener>()
  private readonly interval: number
  private readonly nowFn: () => number
  private readonly onVisibility: () => void
  private timer: ReturnType<typeof setInterval> | null = null
  private current: number

  constructor(options: ClockOptions = {}) {
    this.nowFn = options.now ?? (() => Date.now())
    this.interval = options.interval ?? TICK_MS
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

  private start(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibility)
    }
    if (!this.isHidden()) this.run()
  }

  private stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibility)
    }
  }

  private run(): void {
    if (this.timer !== null) return
    this.timer = setInterval(() => this.tick(), this.interval)
  }

  private tick(): void {
    this.current = this.nowFn()
    for (const listener of this.listeners) listener(this.current)
  }

  private handleVisibility(): void {
    if (this.isHidden()) {
      if (this.timer !== null) {
        clearInterval(this.timer)
        this.timer = null
      }
      return
    }
    // Became visible: emit one immediate tick, then resume the interval.
    if (this.listeners.size > 0 && this.timer === null) {
      this.tick()
      this.run()
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
