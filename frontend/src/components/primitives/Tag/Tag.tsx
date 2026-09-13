import { cn } from '@/lib/cn'
import type { TagProps, TagSize, TagTone, TagVariant } from './types'

const BASE =
  'inline-flex items-center whitespace-nowrap rounded-full border font-medium leading-none'

const SIZE_CLASS: Record<TagSize, string> = {
  sm: 'h-5 gap-1 px-1.5 text-2xs',
  md: 'h-6 gap-1.5 px-2 text-xs',
}

// Literal class strings per tone×variant so the Tailwind scanner emits them.
const TONE_CLASS: Record<TagVariant, Record<TagTone, string>> = {
  soft: {
    neutral: 'border-border bg-surface-2 text-fg-muted',
    accent: 'border-accent-border bg-accent-muted text-accent',
    fresh: 'border-fresh-border bg-fresh-bg text-fresh',
    stale: 'border-stale-border bg-stale-bg text-stale',
    late: 'border-late-border bg-late-bg text-late',
    error: 'border-error-border bg-error-bg text-error',
    unknown: 'border-unknown-border bg-unknown-bg text-unknown',
    paused: 'border-paused-border bg-paused-bg text-paused',
  },
  solid: {
    neutral: 'border-transparent bg-fg-muted text-bg',
    accent: 'border-transparent bg-accent text-fg-on-accent',
    fresh: 'border-transparent bg-fresh text-bg',
    stale: 'border-transparent bg-stale text-bg',
    late: 'border-transparent bg-late text-bg',
    error: 'border-transparent bg-error text-bg',
    unknown: 'border-transparent bg-unknown text-bg',
    paused: 'border-transparent bg-paused text-bg',
  },
  outline: {
    neutral: 'border-border bg-transparent text-fg-muted',
    accent: 'border-accent-border bg-transparent text-accent',
    fresh: 'border-fresh-border bg-transparent text-fresh',
    stale: 'border-stale-border bg-transparent text-stale',
    late: 'border-late-border bg-transparent text-late',
    error: 'border-error-border bg-transparent text-error',
    unknown: 'border-unknown-border bg-transparent text-unknown',
    paused: 'border-paused-border bg-transparent text-paused',
  },
}

export function Tag({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  className,
  children,
  ...rest
}: TagProps): React.JSX.Element {
  return (
    <span
      className={cn(BASE, SIZE_CLASS[size], TONE_CLASS[variant][tone], className)}
      {...rest}
    >
      {children}
    </span>
  )
}
