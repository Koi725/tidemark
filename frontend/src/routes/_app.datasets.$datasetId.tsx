import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, Copy, Pause, Play, RefreshCw } from 'lucide-react'
import { BaselineBandChart } from '@/components/data/BaselineBandChart'
import { FreshnessGapChart } from '@/components/data/FreshnessGapChart'
import { MetricNumber } from '@/components/data/MetricNumber'
import { SchemaDiffRow } from '@/components/data/SchemaDiffRow'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { TimeRangePicker } from '@/components/controls/TimeRangePicker'
import { Button, Frame, Input, Switch, Tag } from '@/components/primitives'
import { FreshnessPill } from '@/components/status/FreshnessPill'
import { StatusBadge } from '@/components/status/StatusBadge'
import { cn } from '@/lib/cn'
import { useNow } from '@/lib/clock'
import { useReducedMotion } from '@/lib/motion'
import {
  formatAge,
  formatConfigDuration,
  formatCount,
  formatDateTime,
} from '@/lib/format'
import { useUiStore } from '@/stores/ui'
import { getDataset, getDatasetDetail } from '@/mocks'
import type { TimeRange } from '@/mocks'

type TabId = 'timeline' | 'schema' | 'checks' | 'incidents' | 'settings'
const TABS: readonly TabId[] = ['timeline', 'schema', 'checks', 'incidents', 'settings']
const RANGES: readonly TimeRange[] = ['1h', '24h', '7d', '30d']

interface DetailSearch {
  tab: TabId
  range: TimeRange
}

export const Route = createFileRoute('/_app/datasets/$datasetId')({
  component: DatasetDetailRoute,
  validateSearch: (search: Record<string, unknown>): DetailSearch => ({
    tab: TABS.includes(search.tab as TabId) ? (search.tab as TabId) : 'timeline',
    range: RANGES.includes(search.range as TimeRange) ? (search.range as TimeRange) : '24h',
  }),
})

function DatasetDetailRoute() {
  const { datasetId } = Route.useParams()
  const { tab, range } = Route.useSearch()
  const navigate = useNavigate()
  const now = useNow()
  const [copied, setCopied] = useState(false)
  const reduced = useReducedMotion()
  // Charts draw in on first mount only (§5.6); once the draw completes we disable
  // animation so a later range change re-renders without redrawing.
  const [animate, setAnimate] = useState(!reduced)
  useEffect(() => {
    const id = window.setTimeout(() => setAnimate(false), 1000)
    return () => window.clearTimeout(id)
  }, [])

  const summary = getDataset(datasetId)

  // Record this dataset in the palette's recents (§3.27 / Screen 9).
  const pushRecent = useUiStore((s) => s.pushRecent)
  useEffect(() => {
    if (summary) pushRecent({ id: summary.id, key: summary.key })
  }, [summary, pushRecent])

  // Deleted / unknown id (§4 edge: 404).
  if (!summary) {
    return (
      <div className="p-[var(--tm-pad)]">
        <ErrorState
          variant="page"
          headline="That dataset is gone"
          raw={`dataset_id=${datasetId} not found\nendpoint=GET /api/datasets/${datasetId}\nprobe_id=det-404 attempt=1/3 next_retry=—`}
          onRetry={() => navigate({ to: '/', search: {} })}
        />
      </div>
    )
  }

  const detail = getDatasetDetail(summary, range)
  const probed = summary.state !== 'unknown'
  const paused = summary.paused
  const longKey = summary.key.length > 60
  const schemaChanges = detail.schema.filter((r) => r.change !== 'none').length

  const setTab = (next: TabId): void => {
    void navigate({ to: '/datasets/$datasetId', params: { datasetId }, search: { tab: next, range } })
  }
  const setRange = (next: TimeRange): void => {
    void navigate({ to: '/datasets/$datasetId', params: { datasetId }, search: { tab, range: next } })
  }

  const copyKey = (): void => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(summary.key)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const lastRowNote = !probed
    ? 'never probed'
    : paused && summary.pausedAt
      ? `paused ${formatAge(summary.pausedAt, { now })} ago`
      : schemaChanges > 0
        ? 'schema drift detected'
        : summary.expectedEverySeconds
          ? `expected every ${formatConfigDuration(summary.expectedEverySeconds)}`
          : 'on arrival'

  const tabCounts: Record<TabId, number | null> = {
    timeline: null,
    schema: schemaChanges,
    checks: detail.checks.length,
    incidents: summary.openIncidentCount,
    settings: null,
  }

  return (
    <>
      {/* ── hero ── */}
      <div className="flex flex-col gap-3 border-b border-hairline p-[var(--tm-pad)]">
        <Link to="/" search={{}} className="inline-flex w-fit items-center gap-1 text-caption text-ink-muted no-underline hover:text-ink">
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" /> Overview
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge state={summary.state} size="md" />
          <h1
            className={cn(
              'min-w-0 font-mono text-ink [overflow-wrap:anywhere]',
              longKey ? 'text-[18px]' : 'text-h1',
            )}
          >
            {summary.key}
          </h1>
          <Button variant="icon" aria-label="Copy key" onClick={copyKey}>
            {copied ? (
              <Check size={16} strokeWidth={1.8} className="text-ok" aria-hidden="true" />
            ) : (
              <Copy size={16} strokeWidth={1.5} aria-hidden="true" />
            )}
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={probed ? 'secondary' : 'primary'}
              startSlot={<RefreshCw size={14} strokeWidth={1.5} aria-hidden="true" />}
            >
              Probe now
            </Button>
            <Button
              variant="ghost"
              startSlot={
                paused ? (
                  <Play size={14} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Pause size={14} strokeWidth={1.5} aria-hidden="true" />
                )
              }
            >
              {paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        </div>

        {/* metrics row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Last row</span>
              <FreshnessPill since={summary.lastRowAt} size="metric-lg" state={summary.state} />
              <span className="text-caption text-ink-muted">{lastRowNote}</span>
            </div>
            <MetricNumber
              label="Rows · 24h"
              value={summary.rowsWindow === null ? null : formatCount(summary.rowsWindow)}
              tone="ink"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Source</span>
              <span className="font-mono text-metric leading-none text-ink">{summary.sourceName}</span>
              <span className="text-caption text-ink-muted">
                {summary.kind}
                {summary.tags.length ? ` · ${summary.tags.join(', ')}` : ''}
              </span>
            </div>
          </div>
          <TimeRangePicker value={range} onChange={setRange} />
        </div>
      </div>

      {paused ? (
        <div className="flex items-center gap-3 border-b border-warn-border bg-warn-bg px-[var(--tm-pad)] py-2 text-body-sm text-warn">
          <span>
            Paused {summary.pausedAt ? formatAge(summary.pausedAt, { now }) : ''} ago — checks aren't running.
          </span>
          <Button variant="secondary" className="ml-auto" startSlot={<Play size={14} strokeWidth={1.5} aria-hidden="true" />}>
            Resume
          </Button>
        </div>
      ) : null}

      {/* tablist */}
      <div role="tablist" aria-label="Dataset views" className="flex gap-1 overflow-x-auto border-b border-hairline px-[var(--tm-pad)]">
        {TABS.map((id) => {
          const active = id === tab
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                'tm-touch flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-body-sm capitalize transition-[color,border-color] duration-base ease-out',
                active ? 'border-tide text-ink' : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {id}
              {tabCounts[id] ? (
                <span className="font-mono text-mono-sm text-ink-faint">{tabCounts[id]}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* panels */}
      <div className="p-[var(--tm-pad)]">
        {tab === 'timeline' ? (
          <div className="flex flex-col gap-[var(--tm-gap)]">
            <div
              className="grid gap-[var(--tm-gap)]"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
            >
              <FreshnessGapChart
                buckets={probed ? detail.freshnessBuckets : []}
                warnMinutes={detail.warnMinutes}
                alertMinutes={detail.alertMinutes}
                range={range}
                animate={animate}
              />
              <BaselineBandChart
                series={probed ? detail.rowsSeries : []}
                range={range}
                animate={animate}
                baselineLearning={detail.baselineLearning}
                baselineHoursLeft={detail.baselineHoursLeft}
                onWiden={() => setRange('30d')}
              />
            </div>
            {(range === '7d' || range === '30d') && probed ? (
              <Frame className="flex flex-col gap-2 p-[var(--tm-pad)]">
                <h3 className="font-display text-h3 text-ink">Probe log</h3>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 font-mono text-mono-sm">
                  <span className="text-label uppercase tracking-[.1em] text-ink-muted">time</span>
                  <span className="text-label uppercase tracking-[.1em] text-ink-muted">result</span>
                  <span className="text-label uppercase tracking-[.1em] text-ink-muted">duration</span>
                  <span className="text-label uppercase tracking-[.1em] text-ink-muted">rows</span>
                  {detail.probeLog.map((row, i) => (
                    <div key={i} className="col-span-4 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-t border-hairline py-1.5">
                      <span className="text-ink-2">{formatDateTime(row.t)}</span>
                      <span
                        className={cn(
                          row.result === 'alert' ? 'text-alert' : row.result === 'warn' ? 'text-warn' : 'text-ok',
                        )}
                      >
                        {row.result}
                      </span>
                      <span className="text-ink-muted">{row.durationMs}ms</span>
                      <span className="text-right text-ink-muted">
                        {row.rows === null ? '—' : formatCount(row.rows)}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-fit">Load more</Button>
              </Frame>
            ) : null}
          </div>
        ) : null}

        {tab === 'schema' ? (
          <SchemaTab detail={detail} />
        ) : null}

        {tab === 'checks' ? (
          <div className="flex max-w-[900px] flex-col gap-[var(--tm-gap)]">
            {detail.checks.map((check) => (
              <Frame key={check.id} className="flex flex-col gap-3 p-[var(--tm-pad)]">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge state={check.state} />
                  <h3 className="font-display text-h3 text-ink">{check.name}</h3>
                  <span className="text-caption text-ink-muted">{check.description}</span>
                  <Switch defaultChecked={check.enabled} aria-label={`Enable ${check.name}`} className="ml-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary">Save</Button>
                  <Button variant="ghost" startSlot={<RefreshCw size={14} strokeWidth={1.5} aria-hidden="true" />}>
                    Run now
                  </Button>
                </div>
              </Frame>
            ))}
            <Button variant="secondary" className="w-fit">
              Add check · custom SQL
            </Button>
          </div>
        ) : null}

        {tab === 'incidents' ? (
          <IncidentsTab summaryKey={summary.key} count={summary.openIncidentCount} state={summary.state} now={now} />
        ) : null}

        {tab === 'settings' ? (
          <SettingsTab detail={detail} />
        ) : null}
      </div>
    </>
  )
}

/* ── Schema tab ── */
function SchemaTab({ detail }: { detail: ReturnType<typeof getDatasetDetail> }) {
  if (detail.state === 'unknown') {
    return (
      <p className="text-body-sm text-ink-muted">
        No schema history yet. The first snapshot is taken on the next probe.
      </p>
    )
  }
  const added = detail.schema.filter((r) => r.change === 'added').length
  const removed = detail.schema.filter((r) => r.change === 'removed').length
  const changed = detail.schema.filter((r) => r.change === 'changed').length
  return (
    <div className="flex max-w-[900px] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-mono-sm text-ink-muted">latest vs previous</span>
        <span className="font-mono text-mono-sm">
          <span className="text-ok">+{added}</span> <span className="text-alert">−{removed}</span>{' '}
          <span className="text-warn">~{changed}</span>
        </span>
      </div>
      <div className="border border-hairline">
        {detail.schema.map((row) => (
          <SchemaDiffRow key={row.name} row={row} />
        ))}
      </div>
    </div>
  )
}

/* ── Incidents tab ── */
function IncidentsTab({
  summaryKey,
  count,
  state,
  now,
}: {
  summaryKey: string
  count: number
  state: string
  now: number
}) {
  if (count === 0) {
    return (
      <EmptyState
        title="Calm seas"
        body="No incidents for this dataset in the last 90 days."
      />
    )
  }
  const title = state === 'alert' ? 'No rows for 1h 34m' : 'Volume −41% vs baseline'
  return (
    <div className="max-w-[900px] border border-hairline">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0">
          <StatusBadge state={state === 'alert' ? 'alert' : 'warn'} />
          <div className="min-w-0 flex-1">
            <div className="text-body-sm text-ink">{title}</div>
            <div className="truncate font-mono text-mono-sm text-ink-muted">
              {summaryKey} · freshness
            </div>
          </div>
          <span className="font-mono text-mono-sm text-ink-muted">
            {formatAge(new Date(now - 5_640_000).toISOString(), { now })} ago
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Settings tab ── */
function SettingsTab({ detail }: { detail: ReturnType<typeof getDatasetDetail> }) {
  const rows: Array<[string, React.ReactNode]> = [
    ['Display name', <Input key="dn" defaultValue={detail.displayName} aria-label="Display name" />],
    [
      'Tags',
      <div key="tags" className="flex flex-wrap gap-1.5">
        {detail.tags.map((t) => (
          <Tag key={t} variant="accent">
            {t}
          </Tag>
        ))}
      </div>,
    ],
    [
      'Timestamp column',
      <Input key="ts" mono defaultValue={detail.timestampColumn ?? 'Detect automatically'} aria-label="Timestamp column" />,
    ],
    [
      'Probe interval',
      <div key="pi" className="flex flex-col gap-1">
        <Input
          mono
          className="w-[120px]"
          defaultValue={detail.expectedEverySeconds ? formatConfigDuration(detail.expectedEverySeconds) : '15m'}
          aria-label="Probe interval"
        />
        <span className="text-caption text-ink-muted">Minimum 15s. Reads one row.</span>
      </div>,
    ],
    ['Owner', <Input key="ow" defaultValue={detail.owner} aria-label="Owner" />],
    [
      'Notifier route',
      <span key="nr" className="text-body-sm text-ink-muted">
        inherit · per-source ({detail.sourceName})
      </span>,
    ],
  ]
  return (
    <div className="flex max-w-[900px] flex-col gap-8">
      {rows.map(([label, control]) => (
        <div key={label} className="grid gap-2 lg:grid-cols-[220px_minmax(0,1fr)]">
          <label className="text-label font-display uppercase tracking-[.1em] text-ink-muted">{label}</label>
          <div>{control}</div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button variant="primary">Save</Button>
        <Button variant="ghost" className="text-alert">Stop monitoring</Button>
      </div>
    </div>
  )
}
