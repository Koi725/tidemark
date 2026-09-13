import { Corner } from '@/components/primitives/Corner'
import type { CornerPosition } from '@/components/primitives/Corner'
import { cn } from '@/lib/cn'
import type { FrameElevation, FrameProps } from './types'

const ALL_CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

const ELEVATION_CLASS: Record<FrameElevation, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

/**
 * The blueprint wrapper (§3.0): a square, hairline-bordered line drawing with `+`
 * registration marks at every corner. Every card, figure, dialog and primary
 * button is a Frame. Never rounded; never surface-filled (accent-filled primary
 * button is the single exception). The corner marks are never removed.
 */
export function Frame({
  as: Component = 'div',
  interactive = false,
  filled = false,
  elevation = 'none',
  className,
  children,
  ...rest
}: FrameProps): React.JSX.Element {
  return (
    <Component
      className={cn(
        'relative border',
        filled ? 'border-tide bg-tide text-tide-on' : 'border-hairline bg-transparent',
        interactive &&
          'transition-[background,border-color] duration-fast ease-out hover:border-strong hover:bg-faint',
        ELEVATION_CLASS[elevation],
        className,
      )}
      {...rest}
    >
      {children}
      {ALL_CORNERS.map((position) => (
        <Corner key={position} position={position} />
      ))}
    </Component>
  )
}
