import { Corner } from '@/components/primitives/Corner'
import type { CornerPosition } from '@/components/primitives/Corner'
import { cn } from '@/lib/cn'
import type { ButtonProps, ButtonVariant } from './types'

// Industry-derived buttons (§3.31). Focus ring is the global :focus-visible rule.
const BASE =
  'tm-touch inline-flex select-none items-center justify-center gap-1.5 font-sans text-[14px] font-medium leading-none transition-[background,border-color,color] duration-fast ease-out disabled:pointer-events-none disabled:opacity-45'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'relative h-9 rounded-none border border-tide bg-tide px-4 text-tide-on hover:bg-tide-hover active:bg-tide-pressed',
  secondary:
    'h-9 rounded-none border border-hairline bg-transparent px-3.5 text-ink hover:border-strong hover:bg-faint active:bg-fainter',
  ghost:
    'h-9 rounded-none px-2.5 text-ink-muted hover:bg-faint hover:text-ink active:bg-fainter',
  destructive:
    'relative h-9 rounded-none border border-alert bg-alert px-4 text-white hover:brightness-[.92] active:brightness-[.85]',
  icon: 'size-9 rounded-md text-ink-muted hover:bg-faint hover:text-ink active:bg-fainter',
}

const ALL_CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

/** The blinking ● shown in a loading button (§3.31 — never a spinner ring). */
function Blink(): React.JSX.Element {
  return (
    <span aria-hidden="true" className="animate-[tw-blink_1s_steps(1,end)_infinite]">
      ●
    </span>
  )
}

export function Button({
  variant = 'secondary',
  loading = false,
  disabled,
  startSlot,
  endSlot,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps): React.JSX.Element {
  const framed = variant === 'primary' || variant === 'destructive'
  return (
    <button
      type={type}
      className={cn(BASE, VARIANT_CLASS[variant], className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Blink /> : startSlot}
      {children}
      {endSlot}
      {framed &&
        ALL_CORNERS.map((position) => <Corner key={position} position={position} />)}
    </button>
  )
}
