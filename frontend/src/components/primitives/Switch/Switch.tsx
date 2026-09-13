import { Root, Thumb } from '@radix-ui/react-switch'
import { cn } from '@/lib/cn'
import type { SwitchProps } from './types'

// Boolean control (§3.18): 36×20 square track, 14px square knob. Off = hairline
// on transparent; on = tide fill. Knob slides 2px → 18px.
export function Switch({ className, ...rest }: SwitchProps): React.JSX.Element {
  return (
    <Root
      className={cn(
        'tm-touch inline-flex h-5 w-9 shrink-0 items-center rounded-md border border-hairline bg-transparent transition-colors duration-fast ease-out data-[state=checked]:border-tide data-[state=checked]:bg-tide disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...rest}
    >
      <Thumb className="pointer-events-none block size-[14px] translate-x-[2px] rounded-sm bg-ink transition-transform duration-fast ease-out data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-tide-on" />
    </Root>
  )
}
