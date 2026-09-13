import { createContext } from 'react'
import type { DensityContextValue } from './types'

export const DensityContext = createContext<DensityContextValue | null>(null)
