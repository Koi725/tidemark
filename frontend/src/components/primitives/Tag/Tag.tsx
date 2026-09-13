import { cn } from '@/lib/cn'
import type { TagProps, TagVariant } from './types'

// Tag (§3.32): 20px tall, 4px radius, 10px text, +.04em tracking.
const BASE =
  'inline-flex h-[20px] items-center rounded-md px-1.5 text-[10px] tracking-[.04em]'

const VARIANT_CLASS: Record<TagVariant, string> = {
  accent: 'bg-tide-100 text-tide-700',
  neutral: 'bg-neutral-200 text-neutral-800',
  outline: 'border border-hairline text-ink-muted',
}

export function Tag({
  variant = 'neutral',
  className,
  children,
  ...rest
}: TagProps): React.JSX.Element {
  return (
    <span className={cn(BASE, VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </span>
  )
}
