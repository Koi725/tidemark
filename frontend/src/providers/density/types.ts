export type Density = 'comfortable' | 'compact'

export interface DensityContextValue {
  density: Density
  setDensity: (density: Density) => void
  /** Flip between comfortable and compact. */
  toggle: () => void
}
