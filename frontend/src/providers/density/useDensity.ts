import { useContext } from 'react'
import { DensityContext } from './context'
import type { DensityContextValue } from './types'

export function useDensity(): DensityContextValue {
  const ctx = useContext(DensityContext)
  if (ctx === null) {
    throw new Error('useDensity must be used within a DensityProvider')
  }
  return ctx
}
