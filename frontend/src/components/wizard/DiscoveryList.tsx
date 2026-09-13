import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search, TriangleAlert } from 'lucide-react'
import { Button, Input } from '@/components/primitives'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatCount } from '@/lib/format'
import type { DiscoveredDataset } from '@/mocks'

export interface DiscoveryListProps {
  discovered: DiscoveredDataset[]
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  onMonitor: () => void
  onRetry?: () => void
}

/** Compile a glob (* ? . literal, anchored both ends) or null if invalid. */
function compileGlob(pattern: string): RegExp | null {
  if (!pattern.trim()) return null
  try {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    const globbed = escaped.replace(/\*/g, '.*').replace(/\?/g, '.')
    return new RegExp(`^${globbed}$`)
  } catch {
    return null
  }
}

const ROW_HEIGHT = 44

export function DiscoveryList({
  discovered,
  selected,
  onSelectedChange,
  onMonitor,
  onRetry,
}: DiscoveryListProps): React.JSX.Element {
  const [search, setSearch] = useState('')
  const [pattern, setPattern] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const patternRe = pattern.trim() ? compileGlob(pattern) : null
  const patternInvalid = pattern.trim().length > 0 && patternRe === null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return discovered.filter((d) => {
      if (q && !d.key.toLowerCase().includes(q)) return false
      if (patternRe && !patternRe.test(d.key)) return false
      return true
    })
  }, [discovered, search, patternRe])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns functions the React Compiler can't memoize; safe here (§3.20).
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  const toggle = (key: string): void => {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectedChange(next)
  }

  const selectShown = (): void => {
    const next = new Set(selected)
    for (const d of filtered) next.add(d.key)
    onSelectedChange(next)
  }

  if (discovered.length === 0) {
    return (
      <EmptyState
        title="Nothing to discover"
        body="The role can see the server but no tables in the allowed schemas. Check the role's grants."
        action={onRetry ? { label: 'Retry discovery', onClick: onRetry } : undefined}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search size={14} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <Input
            className="pl-[30px]"
            placeholder={`Search ${formatCount(discovered.length)} discovered`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search discovered datasets"
          />
        </div>
        <Input
          mono
          className="w-[180px]"
          placeholder="pattern  public.*_events"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          invalid={patternInvalid}
          aria-label="Filter by glob pattern"
        />
        <Button variant="secondary" onClick={selectShown}>
          Select shown
        </Button>
        <Button variant="ghost" onClick={() => onSelectedChange(new Set())}>
          Clear
        </Button>
      </div>

      {patternInvalid ? (
        <p className="text-[11px] text-alert" role="alert">
          Not a valid pattern
        </p>
      ) : null}

      {selected.size > 500 ? (
        <p className="border border-warn-border bg-warn-bg px-2.5 py-1.5 text-body-sm text-warn">
          That's {formatCount(selected.size)} datasets — expect ~{formatCount(selected.size * 2)} checks per interval. You
          can narrow with a pattern.
        </p>
      ) : null}

      <div
        ref={listRef}
        role="group"
        aria-label="Discovered datasets"
        className="max-h-[320px] overflow-auto border border-hairline"
      >
        {filtered.length === 0 ? (
          <div className="flex min-h-[44px] items-center justify-between px-3 text-body-sm text-ink-muted">
            No matches for {search || pattern}
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('')
                setPattern('')
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((row) => {
              const d = filtered[row.index]
              if (!d) return null
              const noTs = d.tsColumn === null && d.kind !== 'view'
              return (
                <label
                  key={d.key}
                  className="absolute left-0 top-0 grid w-full grid-cols-[16px_1fr_auto_auto] items-center gap-3 border-b border-hairline px-3"
                  style={{ height: ROW_HEIGHT, transform: `translateY(${row.start}px)` }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(d.key)}
                    onChange={() => toggle(d.key)}
                    className="size-4 accent-[var(--tm-accent)]"
                  />
                  <span className="truncate font-mono text-mono text-ink" title={d.key}>
                    {d.key}
                  </span>
                  <span className="font-mono text-mono-sm text-ink-muted">
                    {d.rows === null ? '—' : `${formatCount(d.rows)} rows`}
                  </span>
                  <span className="flex w-[110px] items-center justify-end gap-1 text-right text-[11px] text-ink-muted">
                    {noTs ? (
                      <>
                        <TriangleAlert size={11} strokeWidth={1.8} className="text-warn" aria-hidden="true" />
                        no ts column · volume only
                      </>
                    ) : d.kind === 'view' ? (
                      'view'
                    ) : (
                      d.tsColumn
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled={selected.size === 0} onClick={onMonitor}>
          Monitor {formatCount(selected.size)} datasets
        </Button>
        <span aria-live="polite" className="text-caption text-ink-muted">
          Freshness + volume checks are added by default; baselines learn over 24h.
        </span>
      </div>
    </div>
  )
}
