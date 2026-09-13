import { cn } from '@/lib/cn'
import type { CornerPosition, CornerProps } from './types'

const POSITION_CLASS: Record<CornerPosition, string> = {
  tl: 'tm-corner--tl',
  tr: 'tm-corner--tr',
  bl: 'tm-corner--bl',
  br: 'tm-corner--br',
}

/** A single L-shaped corner mark. Decorative; hidden from assistive tech. */
export function Corner({ position, className, ...rest }: CornerProps): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={cn('tm-corner', POSITION_CLASS[position], className)}
      {...rest}
    />
  )
}
