import { cn } from '@/lib/cn'
import type { KbdProps } from './types'

/** A keyboard key cap. */
export function Kbd({ className, children, ...rest }: KbdProps): React.JSX.Element {
  return (
    <kbd
      className={cn(
        'inline-flex h-[1.5em] min-w-[1.5em] items-center justify-center rounded-sm border border-border bg-surface-2 px-1.5 font-mono text-xs text-fg-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  )
}
