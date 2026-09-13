/*
 * Motion constants — transcription of spec §1.6 (motion tokens → interaction
 * mapping), plus a reduced-motion hook. These are the JS-visible copy of the CSS
 * duration/easing tokens in app.css, for use with `motion` (Framer).
 */

import { useEffect, useState } from 'react'

/** Durations in milliseconds (§1.6). */
export const durations = {
  instant: 80,
  fast: 120,
  base: 160,
  slow: 200,
  drawer: 240,
  chart: 800,
  cinematic: 1400,
  tide: 7000,
  stagger: 40,
} as const

/** Easing curves as CSS strings (§1.2 @theme). */
export const easings = {
  out: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  spring: 'cubic-bezier(0.3, 1.3, 0.4, 1)',
  linear: 'linear',
} as const

/** Easing curves as bezier tuples, for motion/Framer `ease` props. */
export const easeTuples = {
  out: [0.2, 0.7, 0.2, 1],
  inOut: [0.65, 0, 0.35, 1],
  spring: [0.3, 1.3, 0.4, 1],
} as const

export type DurationToken = keyof typeof durations
export type EasingToken = keyof typeof easings

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

/** Read the current reduced-motion preference once (SSR/jsdom safe). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(REDUCE_QUERY).matches
}

/** Subscribe to the reduced-motion preference and re-render on change. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mq = window.matchMedia(REDUCE_QUERY)
    const onChange = (): void => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
