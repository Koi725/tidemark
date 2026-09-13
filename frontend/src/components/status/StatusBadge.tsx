import { cn } from '@/lib/cn'
import type { DatasetState } from '@/lib/state'
import { stateMeta } from '@/lib/state'

export interface StatusBadgeProps {
  state: DatasetState
  /** sm: 11px text / 12px icon · md: 13px text / 16px icon (§3.2). */
  size?: 'sm' | 'md'
  /** One 900ms ring, driven by a state transition (§5.3) — not by the value. */
  pulse?: boolean
  className?: string
}

/**
 * The canonical state chip (§3.2): colour plus glyph, always. The label text is
 * the accessible name. Contrast ≥ 4.5:1 in both themes by construction.
 */
export function StatusBadge({
  state,
  size = 'sm',
  pulse = false,
  className,
}: StatusBadgeProps): React.JSX.Element {
  const meta = stateMeta[state]
  const Icon = meta.icon
  const md = size === 'md'
  const paused = state === 'paused'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium tracking-[.04em]',
        md ? 'px-[10px] py-[5px] text-[13px]' : 'px-[7px] py-[2px] text-[11px]',
        paused && 'border border-paused-border',
        className,
      )}
      style={{
        color: `var(${meta.cssVar})`,
        background: paused ? 'transparent' : `var(--tm-${state}-bg)`,
        animation: pulse ? 'tw-pulse-ring 900ms var(--ease-out) 1' : undefined,
      }}
    >
      <Icon size={md ? 16 : 12} strokeWidth={1.8} aria-hidden="true" />
      {meta.label}
    </span>
  )
}
