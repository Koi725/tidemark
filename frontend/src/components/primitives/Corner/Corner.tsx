import { cn } from '@/lib/cn'
import type { CornerPosition, CornerProps } from './types'

// A `+` registration mark (§3.0): two crossed 1px strokes in a 7×7px box,
// --border-strong, inset −1px at the corner of a framed object.
const POSITION_CLASS: Record<CornerPosition, string> = {
  tl: '-top-px -left-px',
  tr: '-top-px -right-px',
  bl: '-bottom-px -left-px',
  br: '-bottom-px -right-px',
}

/** A single corner registration mark. Decorative; hidden from assistive tech. */
export function Corner({ position, className, ...rest }: CornerProps): React.JSX.Element {
  return (
    <i
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute size-[7px]',
        'before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-strong',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-strong',
        POSITION_CLASS[position],
        className,
      )}
      {...rest}
    />
  )
}
