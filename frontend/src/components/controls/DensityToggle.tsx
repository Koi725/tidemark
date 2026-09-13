import { Switch } from '@/components/primitives'
import { useDensity } from '@/providers/density'

/** Compact-density switch (§3.29). Instant relayout; no animation. */
export function DensityToggle(): React.JSX.Element {
  const { density, setDensity } = useDensity()
  return (
    <Switch
      checked={density === 'compact'}
      onCheckedChange={(on) => setDensity(on ? 'compact' : 'comfortable')}
      aria-label="Compact density"
    />
  )
}
