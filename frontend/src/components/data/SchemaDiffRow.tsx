import { cn } from '@/lib/cn'
import type { SchemaDiffEntry } from '@/mocks'

export interface SchemaDiffRowProps {
  row: SchemaDiffEntry
}

const GLYPH: Record<SchemaDiffEntry['change'], string> = {
  added: '+',
  removed: '−',
  changed: '~',
  none: '',
}

const ROW_BG: Record<SchemaDiffEntry['change'], string> = {
  added: 'bg-ok-bg',
  removed: 'bg-alert-bg',
  changed: 'bg-warn-bg',
  none: 'bg-transparent',
}

const GUTTER_FG: Record<SchemaDiffEntry['change'], string> = {
  added: 'text-ok',
  removed: 'text-alert',
  changed: 'text-warn',
  none: 'text-ink-muted',
}

const CHANGE_WORD: Record<SchemaDiffEntry['change'], string> = {
  added: 'added column',
  removed: 'removed column',
  changed: 'changed column',
  none: 'column',
}

/** One row of the schema diff table (§3.14). */
export function SchemaDiffRow({ row }: SchemaDiffRowProps): React.JSX.Element {
  const ariaLabel = `${CHANGE_WORD[row.change]} ${row.name}, type ${row.type}${
    row.nullable ? ', nullable' : ''
  }`
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        'grid grid-cols-[28px_1fr_1fr_auto] items-center border-b border-hairline py-[7px] pr-3 font-mono text-mono',
        ROW_BG[row.change],
        row.change === 'none' && 'hover:bg-faint',
      )}
    >
      <span className={cn('text-center font-medium', GUTTER_FG[row.change])}>{GLYPH[row.change]}</span>
      <span className={cn('text-ink', row.change === 'removed' && 'line-through')}>{row.name}</span>
      <span className="text-ink-muted">
        {row.oldType ? (
          <>
            <s>{row.oldType}</s> → {row.type}
          </>
        ) : (
          row.type
        )}
      </span>
      <span className="pl-3 font-sans text-[11px] text-ink-muted">{row.note ?? ''}</span>
    </div>
  )
}
