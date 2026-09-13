import { cn } from '@/lib/cn'
import type { KbdProps } from './types'

/** A keyboard key cap (§3.32). */
export function Kbd({ className, children, ...rest }: KbdProps): React.JSX.Element {
  return (
    <kbd
      className={cn(
        'inline-flex items-center rounded-md border border-hairline px-1.5 font-mono text-[11px] text-ink-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  )
}
