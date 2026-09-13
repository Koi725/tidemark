import { Item, Root } from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/cn'
import type { SegmentedProps } from './types'

/**
 * A square single-select segmented control (§3.10): hairline frame, 34px options,
 * 12px text, hairline dividers between options, selected fills with tide. Built on
 * Radix ToggleGroup so arrow keys move the selection.
 */
export function Segmented({
  options,
  value,
  onValueChange,
  disabled = false,
  fill = false,
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
        'inline-flex items-stretch rounded-none border border-hairline',
        fill && 'w-full',
        className,
      )}
    >
      {options.map((option, index) => (
        <Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          aria-label={option.ariaLabel}
          className={cn(
            'tm-touch inline-flex h-[34px] items-center justify-center gap-1.5 px-3 text-[12px] text-ink-muted transition-[background,color] duration-fast ease-out hover:bg-faint disabled:opacity-45 data-[state=on]:bg-tide data-[state=on]:text-tide-on',
            index > 0 && 'border-l border-hairline',
            fill && 'flex-1',
          )}
        >
          {option.icon}
          {option.label}
        </Item>
      ))}
    </Root>
  )
}
