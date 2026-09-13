import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LayoutGroup } from 'motion/react'
import { DatasetCard } from '@/components/cards/DatasetCard'
import { FilterChipBar } from '@/components/controls/FilterChipBar'
import type { FilterChip } from '@/components/controls/FilterChipBar'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonDatasetCard } from '@/components/feedback/Skeleton'
import { SourceIcon } from '@/components/status/SourceIcon'
import { StatusDot } from '@/components/status/StatusDot'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { useNow } from '@/lib/clock'
import { formatAgo } from '@/lib/format'
import { compareBySeverity, DATASET_STATES, stateMeta } from '@/lib/state'
import type { DatasetState } from '@/lib/state'
import { useUiStore } from '@/stores/ui'
import { DATASETS, SOURCES } from '@/mocks'
import type { DatasetSummary } from '@/mocks'

interface OverviewSearch {
  mock?: string
}

export const Route = createFileRoute('/_app/')({
  component: OverviewRoute,
  validateSearch: (search: Record<string, unknown>): OverviewSearch => ({
    mock: typeof search.mock === 'string' ? search.mock : undefined,
  }),
})

const GRID_COLUMNS = 'repeat(auto-fill, minmax(250px, 1fr))'

const COUNT_ORDER: readonly DatasetState[] = ['ok', 'warn', 'alert', 'unknown', 'paused']

function countByState(datasets: readonly DatasetSummary[]): Record<DatasetState, number> {
  const counts = { ok: 0, warn: 0, alert: 0, unknown: 0, paused: 0 }
  for (const d of datasets) counts[d.state] += 1
  return counts
}

function compareDatasets(a: DatasetSummary, b: DatasetSummary): number {
  const bySeverity = compareBySeverity(a.state, b.state)
  if (bySeverity !== 0) return bySeverity
  const at = a.lastRowAt ? Date.parse(a.lastRowAt) : 0
  const bt = b.lastRowAt ? Date.parse(b.lastRowAt) : 0
  if (at !== bt) return at - bt // stalest (oldest) first
  return a.key.localeCompare(b.key)
}

function matches(dataset: DatasetSummary, filter: string, pausedCount: number): boolean {
  if (filter === 'all') return !(dataset.paused && pausedCount > 5)
  if ((DATASET_STATES as readonly string[]).includes(filter)) return dataset.state === filter
  if (filter.startsWith('src:')) return dataset.sourceId === filter.slice(4)
  if (filter.startsWith('tag:')) return dataset.tags.includes(filter.slice(4))
  return true
}

function CountsMeta({ counts }: { counts: Record<DatasetState, number> }) {
  return (
    <>
      {COUNT_ORDER.map((state) => {
        const Icon = stateMeta[state].icon
        const zero = counts[state] === 0
        return (
          <span key={state} className="inline-flex items-center gap-1">
            <Icon
              size={12}
              strokeWidth={1.8}
              aria-hidden="true"
              style={{ color: zero ? undefined : `var(${stateMeta[state].cssVar})` }}
              className={zero ? 'text-ink-muted' : undefined}
            />
            <span className={zero ? 'text-ink-muted' : 'text-ink-2'}>
              {counts[state]} {state === 'ok' ? 'OK' : state}
            </span>
          </span>
        )
      })}
    </>
  )
}

function OverviewRoute() {
  const { mock } = Route.useSearch()
  const navigate = useNavigate()
  const now = useNow()
  const [filter, setFilter] = useState('all')

  const hasStaggered = useUiStore((s) => s.hasStaggered)
  const markStaggered = useUiStore((s) => s.markStaggered)
  const animateIn = !hasStaggered
  useEffect(() => {
    if (!hasStaggered) markStaggered()
  }, [hasStaggered, markStaggered])

  // ── Mock-driven state overrides (skeleton / empty / error) ──
  const datasets = mock === 'one' ? DATASETS.slice(0, 1) : DATASETS
  const sources = mock === 'empty' ? [] : SOURCES

  const counts = useMemo(() => countByState(datasets), [datasets])
  const pausedCount = counts.paused

  const chips = useMemo<FilterChip[]>(() => {
    const statusChips: FilterChip[] = [
      { id: 'all', label: 'All', count: datasets.length },
      { id: 'alert', label: 'Alert', count: counts.alert },
      { id: 'warn', label: 'Warn', count: counts.warn },
      { id: 'ok', label: 'OK', count: counts.ok },
      { id: 'unknown', label: 'Unknown', count: counts.unknown },
      { id: 'paused', label: 'Paused', count: counts.paused },
    ]
    const sourceChips: FilterChip[] = SOURCES.filter((s) =>
      datasets.some((d) => d.sourceId === s.id),
    ).map((s) => ({
      id: `src:${s.id}`,
      label: s.name,
      count: datasets.filter((d) => d.sourceId === s.id).length,
    }))
    const tags = [...new Set(datasets.flatMap((d) => d.tags))]
    const tagChips: FilterChip[] = tags.map((t) => ({
      id: `tag:${t}`,
      label: t,
      count: datasets.filter((d) => d.tags.includes(t)).length,
    }))
    return [...statusChips, ...sourceChips, ...tagChips]
  }, [datasets, counts])

  const visible = useMemo(
    () => datasets.filter((d) => matches(d, filter, pausedCount)),
    [datasets, filter, pausedCount],
  )

  const groups = useMemo(
    () =>
      SOURCES.map((source) => ({
        source,
        items: visible.filter((d) => d.sourceId === source.id).sort(compareDatasets),
      })).filter((g) => g.items.length > 0),
    [visible],
  )

  const lastProbe = SOURCES.reduce<string | null>((latest, s) => {
    if (!s.lastProbeAt) return latest
    if (!latest || Date.parse(s.lastProbeAt) > Date.parse(latest)) return s.lastProbeAt
    return latest
  }, null)

  const singleColumn = visible.length === 1

  // ── Non-happy paths ──
  if (mock === 'loading') {
    return (
      <>
        <HeaderStrip title="Overview" />
        <div
          aria-busy="true"
          aria-label="Loading datasets"
          className="grid gap-[var(--tm-gap)] p-[var(--tm-pad)]"
          style={{ gridTemplateColumns: GRID_COLUMNS }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonDatasetCard key={i} />
          ))}
        </div>
      </>
    )
  }

  if (mock === 'error') {
    return (
      <>
        <HeaderStrip title="Overview" />
        <div className="p-[var(--tm-pad)]">
          <ErrorState
            variant="page"
            headline="Couldn't load datasets"
            raw={
              'ECONNREFUSED tidemark-api:8080\nendpoint=GET /api/datasets?view=summary\nprobe_id=ovw-1 attempt=1/3 next_retry=4s'
            }
            onRetry={() => navigate({ to: '/', search: {} })}
          />
        </div>
      </>
    )
  }

  if (sources.length === 0) {
    return (
      <>
        <HeaderStrip title="Overview" />
        <div className="p-[var(--tm-pad)]">
          <EmptyState
            title="No sources yet"
            body="Connect a database, a bucket or a topic. Read-only is enough."
            action={{ label: 'Add source', onClick: () => undefined }}
          />
        </div>
      </>
    )
  }

  if (datasets.length === 0 || mock === 'empty-datasets') {
    const first = SOURCES[0]
    return (
      <>
        <HeaderStrip title="Overview" />
        <div className="p-[var(--tm-pad)]">
          <EmptyState
            title="Nothing monitored yet"
            body={`${first?.name ?? 'This source'} is connected but no datasets are selected.`}
            action={{ label: 'Pick datasets', onClick: () => undefined }}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <HeaderStrip
        title="Overview"
        meta={<CountsMeta counts={counts} />}
        right={
          <>
            <span className="font-mono text-mono-sm text-ink-muted">
              last probe {formatAgo(lastProbe, { now })}
            </span>
            <span title="Live · SSE connected">
              <StatusDot state="ok" pulse="live" />
            </span>
          </>
        }
      >
        <FilterChipBar chips={chips} value={filter} onChange={setFilter} />
      </HeaderStrip>

      <LayoutGroup>
        <div className="flex flex-col gap-[var(--tm-pad)] p-[var(--tm-pad)]">
          {groups.map((group) => (
            <section key={group.source.id} className="flex flex-col gap-[var(--tm-gap)]">
              <div className="sticky top-0 z-[4] flex items-center gap-2 bg-canvas/95 py-1 backdrop-blur-[4px]">
                <SourceIcon code={group.source.code} size={22} decorative />
                <span className="font-display text-h4 uppercase tracking-[.04em] text-ink">
                  {group.source.name}
                </span>
                <span className="text-caption text-ink-muted">
                  {group.source.type} · {group.items.length}
                </span>
              </div>
              <div
                className="grid gap-[var(--tm-gap)]"
                style={{
                  gridTemplateColumns: singleColumn ? undefined : GRID_COLUMNS,
                  maxWidth: singleColumn ? 520 : undefined,
                }}
              >
                {group.items.map((dataset, index) => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    index={index}
                    animateIn={animateIn}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </LayoutGroup>
    </>
  )
}
