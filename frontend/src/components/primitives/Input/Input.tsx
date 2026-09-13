import { cn } from '@/lib/cn'
import type { InputProps } from './types'

// Field control (§3.18): 38px tall, raised surface, hairline border → strong on
// hover, tide on focus, alert when invalid. Disabled dims to 45% on a fainter fill.
const BASE =
  'h-[38px] w-full rounded-md border bg-raised px-2.5 text-[14px] text-ink placeholder:text-ink-faint transition-[border-color] duration-fast ease-out hover:border-strong focus:border-tide disabled:cursor-not-allowed disabled:bg-fainter disabled:opacity-45'

export function Input({
  invalid = false,
  mono = false,
  className,
  ...rest
}: InputProps): React.JSX.Element {
  return (
    <input
      className={cn(
        BASE,
        invalid ? 'border-alert' : 'border-hairline',
        mono && 'font-mono',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}
