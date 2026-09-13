import { Item, Root } from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/cn'
import type { SegmentedProps, SegmentedSize } from './types'

const SIZE_CLASS: Record<SegmentedSize, string> = {
  sm: 'h-[var(--tm-control-h-sm)] px-2.5 text-xs',
  md: 'h-[var(--tm-control-h-md)] px-3 text-sm',
}

/** A single-select segmented control built on Radix ToggleGroup. */
export function Segmented({
  options,
  value,
  onValueChange,
  size = 'md',
  disabled = false,
  className,
  ariaLabel,
}: SegmentedProps): React.JSX.Element {
  return (
    <Root
      type="single"
      value={value}
      // Radix emits '' when the active item is toggled off; keep the selection.
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 p-0.5',
        className,
      )}
    >
      {options.map((option) => (
        <Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          aria-label={option.ariaLabel}
          className={cn(
            'tm-focusable inline-flex items-center justify-center gap-1.5 rounded-sm font-medium text-fg-muted transition-colors data-[state=on]:bg-surface data-[state=on]:text-fg disabled:opacity-50',
            SIZE_CLASS[size],
          )}
        >
          {option.icon}
          {option.label}
        </Item>
      ))}
    </Root>
  )
}
