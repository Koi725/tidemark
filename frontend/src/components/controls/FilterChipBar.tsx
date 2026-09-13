import { cn } from '@/lib/cn'

export interface FilterChip {
  id: string
  label: string
  count: number
}

export interface FilterChipBarProps {
  chips: readonly FilterChip[]
  value: string
  onChange: (id: string) => void
  className?: string
}

/**
 * Status/source/tag filters (§3.9). Single-select via aria-pressed (not role
 * radio — "All" is a reset). Count-0 chips stay visible but disabled at 45% so
 * the layout is stable.
 */
export function FilterChipBar({
  chips,
  value,
  onChange,
  className,
}: FilterChipBarProps): React.JSX.Element {
  return (
    <div role="group" aria-label="Filter datasets" className={cn('flex flex-wrap gap-1.5', className)}>
      {chips.map((chip) => {
        const selected = chip.id === value
        const disabled = chip.count === 0 && chip.id !== value
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(chip.id)}
            className={cn(
              'tm-touch inline-flex h-[30px] items-center gap-1.5 rounded-md border px-2.5 text-[12px] transition-[background,border-color,color] duration-base ease-out disabled:opacity-45',
              selected
                ? 'border-tide bg-tide text-tide-on'
                : 'border-hairline bg-transparent text-ink hover:bg-faint',
            )}
          >
            {chip.label}
            {/* Muted count, but kept AA-legible on the tide fill when selected. */}
            <span className={selected ? 'opacity-90' : 'opacity-70'}>{chip.count}</span>
          </button>
        )
      })}
    </div>
  )
}
