import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  mono?: boolean
  id?: string
  'aria-describedby'?: string
}

/** Chips input (§3.18 array shape): Enter to add, Backspace to remove the last. */
export function TagInput({
  value,
  onChange,
  placeholder,
  mono,
  id,
  ...aria
}: TagInputProps): React.JSX.Element {
  const [draft, setDraft] = useState('')

  const add = (): void => {
    const t = draft.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft('')
  }

  return (
    <div
      className={cn(
        'flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-md border border-hairline bg-raised px-2 py-1.5 focus-within:border-tide',
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className={cn(
            'inline-flex items-center gap-1 rounded-md bg-tide-100 px-1.5 py-0.5 text-[11px] text-tide-700',
            mono && 'font-mono',
          )}
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="text-tide-700/70 hover:text-tide-700"
          >
            <X size={11} strokeWidth={2} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={value.length === 0 ? placeholder : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={add}
        className={cn('min-w-[80px] flex-1 bg-transparent text-[14px] text-ink outline-none', mono && 'font-mono')}
        {...aria}
      />
    </div>
  )
}
