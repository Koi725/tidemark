import { cn } from '@/lib/cn'
import type { DatasetState } from '@/lib/state'
import { stateMeta } from '@/lib/state'

export interface SparklineProps {
  points: number[]
  state: DatasetState
  height?: 28 | 40
  /** Draw-in animation — dataset-detail page first mount only (§3.4). */
  animate?: boolean
  className?: string
}

const N = 24

/**
 * 24-point trend (§3.4). Hand-rolled SVG (§9). Fewer points left-align and
 * shorten the line rather than interpolate. All-zero → flat grey line; single
 * point → a 2px dot at x=0. Decorative — aria-hidden (the numbers are in text).
 */
export function Sparkline({
  points,
  state,
  height = 28,
  animate = false,
  className,
}: SparklineProps): React.JSX.Element {
  const allZero = points.length === 0 || points.every((v) => v === 0)
  const color = allZero
    ? 'var(--tm-unknown-fg)'
    : `var(${stateMeta[state].cssVar})`
  const max = Math.max(...points, 1)
  const n = Math.min(points.length, N)

  const coords = points.slice(0, n).map((v, i) => {
    const x = n <= 1 ? 0 : (i * 100) / (n - 1)
    const y = allZero ? 26 : 26 - (v / max) * 24
    return [x, y] as const
  })

  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('block', className)}
      style={{ color }}
    >
      {allZero ? (
        <line x1="0" y1="26" x2="100" y2="26" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      ) : coords.length === 1 ? (
        <circle cx={coords[0]![0]} cy={coords[0]![1]} r="2" fill="currentColor" />
      ) : (
        <polyline
          points={coords.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          style={
            animate
              ? {
                  strokeDasharray: 1000,
                  animation: 'tw-draw 800ms var(--ease-out) 1',
                }
              : undefined
          }
        />
      )}
    </svg>
  )
}
