/*
 * Motion constants mirroring the --tm-dur-* / --tm-ease-* tokens in
 * src/styles/tokens.css, plus a reduced-motion hook. Keep these in sync with the
 * CSS tokens by hand — they are the JS-visible copy for animation libraries.
 */

import { useEffect, useState } from 'react'

/** Durations in milliseconds. */
export const durations = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 360,
} as const

export const easings = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
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
