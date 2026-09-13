import { cn } from '@/lib/cn'
import type { ButtonProps, ButtonSize, ButtonVariant } from './types'

const BASE =
  'tm-focusable inline-flex select-none items-center justify-center gap-2 rounded-md font-medium leading-none transition-colors disabled:pointer-events-none disabled:opacity-50'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  solid: 'bg-accent text-fg-on-accent hover:opacity-90 active:opacity-100',
  outline: 'border border-border bg-transparent text-fg hover:bg-surface-2',
  ghost: 'bg-transparent text-fg hover:bg-surface-2',
  subtle: 'bg-surface-2 text-fg hover:bg-overlay',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-[var(--tm-control-h-sm)] px-3 text-xs',
  md: 'h-[var(--tm-control-h-md)] px-4 text-sm',
  lg: 'h-[var(--tm-control-h-lg)] px-5 text-base',
}

function Spinner(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-[1em] rounded-full border-2 border-current border-r-transparent"
      style={{ animation: 'tm-spin 0.6s linear infinite' }}
    />
  )
}

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  disabled,
  startSlot,
  endSlot,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : startSlot}
      {children}
      {endSlot}
    </button>
  )
}
