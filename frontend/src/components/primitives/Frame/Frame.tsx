import { Corner } from '@/components/primitives/Corner'
import type { CornerPosition } from '@/components/primitives/Corner'
import { cn } from '@/lib/cn'
import type { FrameProps, FrameSize } from './types'

const SIZE_CLASS: Record<FrameSize, string> = {
  sm: 'tm-frame--sm',
  md: 'tm-frame--md',
  lg: 'tm-frame--lg',
}

const ALL_CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

/**
 * A bordered surface with reticle-style corner marks — the recurring container of
 * the tidemark instrument aesthetic.
 */
export function Frame({
  size = 'md',
  as,
  showCorners = true,
  corners = ALL_CORNERS,
  className,
  children,
  ...rest
}: FrameProps): React.JSX.Element {
  const Component = as ?? 'div'
  return (
    <Component
      className={cn(
        'tm-frame border border-border bg-surface',
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {children}
      {showCorners &&
        corners.map((position) => <Corner key={position} position={position} />)}
    </Component>
  )
}
