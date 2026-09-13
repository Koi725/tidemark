import { cn } from '@/lib/cn'
import type { DatasetState } from '@/lib/state'
import { stateMeta } from '@/lib/state'

export interface StatusDotProps {
  state: DatasetState
  /** Diameter in px. Default 8. */
  size?: 6 | 8 | 10
  /** none · one 900ms ring · live 2400ms infinite (§3.1). */
  pulse?: 'none' | 'once' | 'live'
  className?: string
}

/**
 * The smallest state indicator (§3.1). Colour equals background so tw-pulse-ring
 * (currentColor) tints correctly. Paused renders a hollow dot so it reads without
 * colour. Always role="img" + aria-label; never the sole carrier of state.
 */
export function StatusDot({
  state,
  size = 8,
  pulse = 'none',
  className,
}: StatusDotProps): React.JSX.Element {
  const color = `var(${stateMeta[state].cssVar})`
  const hollow = state === 'paused'
  const animation =
    pulse === 'once'
      ? 'tw-pulse-ring 900ms var(--ease-out) 1'
      : pulse === 'live'
        ? 'tw-pulse-ring 2400ms var(--ease-out) infinite'
        : undefined
  return (
    <span
      role="img"
      aria-label={state}
      className={cn('inline-block rounded-full', hollow && 'border border-paused-border', className)}
      style={{
        width: size,
        height: size,
        background: hollow ? 'transparent' : color,
        color,
        animation,
      }}
    />
  )
}
