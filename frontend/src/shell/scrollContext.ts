import { createContext, useContext } from 'react'
import type { RefObject } from 'react'

/** Ref to the app's scroll container (the <main>), consumed by HeaderStrip. */
export const ScrollContext = createContext<RefObject<HTMLElement | null> | null>(null)

export function useScrollContainer(): RefObject<HTMLElement | null> | null {
  return useContext(ScrollContext)
}
