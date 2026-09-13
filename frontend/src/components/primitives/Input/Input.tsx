import { cn } from '@/lib/cn'
import type { InputProps, InputSize } from './types'

const BASE =
  'tm-focusable w-full rounded-md border bg-surface text-fg placeholder:text-fg-subtle transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const SIZE_CLASS: Record<InputSize, string> = {
  sm: 'h-[var(--tm-control-h-sm)] px-[var(--tm-control-pad-x)] text-xs',
  md: 'h-[var(--tm-control-h-md)] px-[var(--tm-control-pad-x)] text-sm',
  lg: 'h-[var(--tm-control-h-lg)] px-[var(--tm-control-pad-x)] text-base',
}

export function Input({
  inputSize = 'md',
  invalid = false,
  className,
  ...rest
}: InputProps): React.JSX.Element {
  return (
    <input
      className={cn(
        BASE,
        SIZE_CLASS[inputSize],
        invalid ? 'border-error' : 'border-border',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}
