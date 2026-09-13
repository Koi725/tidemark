import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DensityContext } from './context'
import type { Density, DensityContextValue } from './types'

const STORAGE_KEY = 'tm.ui.density'
const DENSITIES: readonly Density[] = ['comfortable', 'compact']

function readStoredDensity(): Density {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (DENSITIES as readonly string[]).includes(stored)) {
      return stored as Density
    }
  } catch {
    /* localStorage unavailable (private mode / SSR) */
  }
  return 'comfortable'
}

export function DensityProvider({ children }: { children: ReactNode }): ReactNode {
  const [density, setDensityState] = useState<Density>(readStoredDensity)

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

  const setDensity = useCallback((next: Density): void => {
    setDensityState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage unavailable */
    }
  }, [])

  const toggle = useCallback((): void => {
    setDensityState((current) => {
      const next: Density = current === 'compact' ? 'comfortable' : 'compact'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* localStorage unavailable */
      }
      return next
    })
  }, [])

  const value = useMemo<DensityContextValue>(
    () => ({ density, setDensity, toggle }),
    [density, setDensity, toggle],
  )

  return <DensityContext value={value}>{children}</DensityContext>
}
