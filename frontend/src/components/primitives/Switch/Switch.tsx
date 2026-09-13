import { Root, Thumb } from '@radix-ui/react-switch'
import { cn } from '@/lib/cn'
import type { SwitchProps } from './types'

export function Switch({ className, ...rest }: SwitchProps): React.JSX.Element {
  return (
    <Root
      className={cn(
        'tm-focusable inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border bg-surface-2 transition-colors data-[state=checked]:border-accent-border data-[state=checked]:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      <Thumb className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-fg shadow-1 transition-transform data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-fg-on-accent" />
    </Root>
  )
}
