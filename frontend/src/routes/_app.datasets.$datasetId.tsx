import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, Copy, Pause, Play, RefreshCw } from 'lucide-react'
import { BaselineBandChart } from '@/components/data/BaselineBandChart'
import { FreshnessGapChart } from '@/components/data/FreshnessGapChart'
import { MetricNumber } from '@/components/data/MetricNumber'
import { SchemaDiffRow } from '@/components/data/SchemaDiffRow'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SkeletonDatasetCard } from '@/components/feedback/Skeleton'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { TimeRangePicker } from '@/components/controls/TimeRangePicker'
import { Button, Frame, Input, Switch, Tag } from '@/components/primitives'
import { FreshnessPill } from '@/components/status/FreshnessPill'
import { StatusBadge } from '@/components/status/StatusBadge'
import { notify } from '@/components/feedback/notify'
import { cn } from '@/lib/cn'
import { useNow } from '@/lib/clock'
import { useReducedMotion } from '@/lib/motion'
import { formatAge, formatConfigDuration, formatCount, formatDateTime } from '@/lib/format'
import { useUiStore } from '@/stores/ui'
import {
  useDataset,
  useDatasetIncidents,
  useRowsSeries,
  useFreshnessSeries,
  useProbeDataset,
  usePauseDataset,
  useResumeDataset,
  usePatchDataset,
  useStopMonitoring,
} from '@/features/datasets'
import { NotFoundError } from '@/lib/api'
import type { DatasetDetail, Incident, TimeRange } from '@/contracts'

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
  const detailQuery = useDataset(datasetId)
  const detail = detailQuery.data

  if (detailQuery.isPending) {
    return (
      <div className="p-[var(--tm-pad)]" aria-busy="true" aria-label="Loading dataset">
        <SkeletonDatasetCard />
      </div>
    )
  }

  if (detailQuery.isError || !detail) {
    const gone = detailQuery.error instanceof NotFoundError
    return (
      <div className="p-[var(--tm-pad)]">
        <ErrorState
          variant="page"
          headline={gone ? 'That dataset is gone' : "Couldn't load dataset"}
          raw={`dataset_id=${datasetId}\nendpoint=GET /api/datasets/${datasetId}\nprobe_id=det attempt=1/3 next_retry=—`}
          onRetry={() => (gone ? void navigate({ to: '/', search: {} }) : void detailQuery.refetch())}
        />
      </div>
    )
  }

  return (
    <DatasetDetail
      detail={detail}
      tab={tab}
      range={range}
      onTab={(next) => void navigate({ to: '/datasets/$datasetId', params: { datasetId }, search: { tab: next, range } })}
      onRange={(next) => void navigate({ to: '/datasets/$datasetId', params: { datasetId }, search: { tab, range: next } })}
    />
  )
}

function DatasetDetail({
  detail,
  tab,
  range,
  onTab,
  onRange,
}: {
  detail: DatasetDetail
  tab: TabId
  range: TimeRange
  onTab: (t: TabId) => void
  onRange: (r: TimeRange) => void
}) {
  const navigate = useNavigate()
  const now = useNow()
  const reduced = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const [stopOpen, setStopOpen] = useState(false)
  const [animate, setAnimate] = useState(!reduced)
  useEffect(() => {
    const id = window.setTimeout(() => setAnimate(false), 1000)
    return () => window.clearTimeout(id)
  }, [])

  const pushRecent = useUiStore((s) => s.pushRecent)
  useEffect(() => {
    pushRecent({ id: detail.id, key: detail.key })
  }, [detail.id, detail.key, pushRecent])

  const probe = useProbeDataset()
  const pause = usePauseDataset()
  const resume = useResumeDataset()
  const stop = useStopMonitoring()

  const probed = detail.state !== 'unknown'
  const paused = detail.paused
  const longKey = detail.key.length > 60
  const schemaChanges = detail.schema.filter((r) => r.change !== 'none').length

  const rowsQuery = useRowsSeries(detail.id, range, probed)
  const freshQuery = useFreshnessSeries(detail.id, range, probed)

  const copyKey = (): void => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(detail.key)
    setCopied(true)
    notify('ok', `Copied ${detail.key}`)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const lastRowNote = !probed
    ? 'never probed'
    : paused && detail.pausedAt
      ? `paused ${formatAge(detail.pausedAt, { now })} ago`
      : schemaChanges > 0
        ? 'schema drift detected'
        : detail.expectedEverySeconds
          ? `expected every ${formatConfigDuration(detail.expectedEverySeconds)}`
          : 'on arrival'

  const tabCounts: Record<TabId, number | null> = {
    timeline: null,
    schema: schemaChanges,
    checks: detail.checks.length,
    incidents: detail.openIncidentCount,
    settings: null,
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-hairline p-[var(--tm-pad)]">
        <Link to="/" search={{}} className="inline-flex w-fit items-center gap-1 text-caption text-ink-muted no-underline hover:text-ink">
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" /> Overview
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge state={detail.state} size="md" />
          <h1 className={cn('min-w-0 font-mono text-ink [overflow-wrap:anywhere]', longKey ? 'text-[18px]' : 'text-h1')}>
            {detail.key}
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
              onClick={() => probe.mutate({ id: detail.id, displayName: detail.displayName })}
            >
              Probe now
            </Button>
            <Button
              variant="ghost"
              startSlot={paused ? <Play size={14} strokeWidth={1.5} aria-hidden="true" /> : <Pause size={14} strokeWidth={1.5} aria-hidden="true" />}
              onClick={() => (paused ? resume.mutate(detail.id) : pause.mutate(detail.id))}
            >
              {paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Last row</span>
              <FreshnessPill since={detail.lastRowAt} size="metric-lg" state={detail.state} />
              <span className="text-caption text-ink-muted">{lastRowNote}</span>
            </div>
            <MetricNumber label="Rows · 24h" value={detail.rowsWindow === null ? null : formatCount(detail.rowsWindow)} tone="ink" />
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Source</span>
              <span className="font-mono text-metric leading-none text-ink">{detail.sourceName}</span>
              <span className="text-caption text-ink-muted">
                {detail.kind}
                {detail.tags.length ? ` · ${detail.tags.join(', ')}` : ''}
              </span>
            </div>
          </div>
          <TimeRangePicker value={range} onChange={onRange} />
        </div>
      </div>

      {paused ? (
        <div className="flex items-center gap-3 border-b border-warn-border bg-warn-bg px-[var(--tm-pad)] py-2 text-body-sm text-warn">
          <span>Paused {detail.pausedAt ? formatAge(detail.pausedAt, { now }) : ''} ago — checks aren't running.</span>
          <Button variant="secondary" className="ml-auto" startSlot={<Play size={14} strokeWidth={1.5} aria-hidden="true" />} onClick={() => resume.mutate(detail.id)}>
            Resume
          </Button>
        </div>
      ) : null}

      <div role="tablist" aria-label="Dataset views" className="flex gap-1 overflow-x-auto border-b border-hairline px-[var(--tm-pad)]">
        {TABS.map((id) => {
          const active = id === tab
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(id)}
              className={cn(
                'tm-touch flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-body-sm capitalize transition-[color,border-color] duration-base ease-out',
                active ? 'border-tide text-ink' : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {id}
              {tabCounts[id] ? <span className="font-mono text-mono-sm text-ink-faint">{tabCounts[id]}</span> : null}
            </button>
          )
        })}
      </div>

      <div className="p-[var(--tm-pad)]">
        {tab === 'timeline' ? (
          <div className="flex flex-col gap-[var(--tm-gap)]">
            <div className="grid gap-[var(--tm-gap)]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              <FreshnessGapChart
                buckets={probed ? freshQuery.data ?? [] : []}
                warnMinutes={detail.warnMinutes}
                alertMinutes={detail.alertMinutes}
                range={range}
                animate={animate}
                loading={probed && freshQuery.isPending}
              />
              <BaselineBandChart
                series={probed ? rowsQuery.data ?? [] : []}
                range={range}
                animate={animate}
                loading={probed && rowsQuery.isPending}
                baselineLearning={detail.baselineLearning}
                baselineHoursLeft={detail.baselineHoursLeft}
                onWiden={() => onRange('30d')}
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
                      <span className={cn(row.result === 'alert' ? 'text-alert' : row.result === 'warn' ? 'text-warn' : 'text-ok')}>{row.result}</span>
                      <span className="text-ink-muted">{row.durationMs}ms</span>
                      <span className="text-right text-ink-muted">{row.rows === null ? '—' : formatCount(row.rows)}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-fit">Load more</Button>
              </Frame>
            ) : null}
          </div>
        ) : null}

        {tab === 'schema' ? <SchemaTab detail={detail} /> : null}

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
                  <Button variant="secondary" onClick={() => notify('ok', 'Saved')}>Save</Button>
                  <Button variant="ghost" startSlot={<RefreshCw size={14} strokeWidth={1.5} aria-hidden="true" />} onClick={() => notify('info', `Running ${check.name}…`)}>
                    Run now
                  </Button>
                </div>
              </Frame>
            ))}
            <Button variant="secondary" className="w-fit">Add check · custom SQL</Button>
          </div>
        ) : null}

        {tab === 'incidents' ? <IncidentsTab datasetId={detail.id} now={now} /> : null}

        {tab === 'settings' ? <SettingsTab detail={detail} onStop={() => setStopOpen(true)} /> : null}
      </div>

      <ConfirmDialog
        open={stopOpen}
        onOpenChange={setStopOpen}
        title={`Stop monitoring ${detail.displayName}?`}
        body="Deletes probe history for this dataset. The table itself is untouched."
        match={detail.displayName}
        actionLabel="Stop monitoring"
        onConfirm={() => {
          stop.mutate(detail.id)
          setStopOpen(false)
          void navigate({ to: '/', search: {} })
        }}
      />
    </>
  )
}

function SchemaTab({ detail }: { detail: DatasetDetail }) {
  if (detail.state === 'unknown') {
    return <p className="text-body-sm text-ink-muted">No schema history yet. The first snapshot is taken on the next probe.</p>
  }
  const added = detail.schema.filter((r) => r.change === 'added').length
  const removed = detail.schema.filter((r) => r.change === 'removed').length
  const changed = detail.schema.filter((r) => r.change === 'changed').length
  return (
    <div className="flex max-w-[900px] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-mono-sm text-ink-muted">latest vs previous</span>
        <span className="font-mono text-mono-sm">
          <span className="text-ok">+{added}</span> <span className="text-alert">−{removed}</span> <span className="text-warn">~{changed}</span>
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

function IncidentsTab({ datasetId, now }: { datasetId: string; now: number }) {
  const incidentsQuery = useDatasetIncidents(datasetId)
  const incidents = incidentsQuery.data ?? []
  if (incidents.length === 0) {
    return <EmptyState title="Calm seas" body="No incidents for this dataset in the last 90 days." />
  }
  return (
    <div className="max-w-[900px] border border-hairline">
      {incidents.map((inc: Incident) => (
        <div key={inc.id} className="flex items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0">
          <StatusBadge state={inc.severity} />
          <div className="min-w-0 flex-1">
            <div className="text-body-sm text-ink">{inc.title}</div>
            <div className="truncate font-mono text-mono-sm text-ink-muted">{inc.datasetKey} · {inc.check}</div>
          </div>
          <span className="font-mono text-mono-sm text-ink-muted">{formatAge(inc.openedAt, { now })} ago</span>
        </div>
      ))}
    </div>
  )
}

function SettingsTab({ detail, onStop }: { detail: DatasetDetail; onStop: () => void }) {
  const patch = usePatchDataset()
  const [displayName, setDisplayName] = useState(detail.displayName)
  const [owner, setOwner] = useState(detail.owner)
  const [interval, setInterval] = useState(
    detail.expectedEverySeconds ? formatConfigDuration(detail.expectedEverySeconds) : '15m',
  )

  const save = (): void =>
    patch.mutate({ id: detail.id, body: { displayName, owner } })

  return (
    <div className="flex max-w-[900px] flex-col gap-8">
      <SettingsRow label="Display name">
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} aria-label="Display name" />
      </SettingsRow>
      <SettingsRow label="Tags">
        <div className="flex flex-wrap gap-1.5">
          {detail.tags.map((t) => (
            <Tag key={t} variant="accent">{t}</Tag>
          ))}
        </div>
      </SettingsRow>
      <SettingsRow label="Timestamp column">
        <Input mono defaultValue={detail.timestampColumn ?? 'Detect automatically'} aria-label="Timestamp column" />
      </SettingsRow>
      <SettingsRow label="Probe interval">
        <div className="flex flex-col gap-1">
          <Input mono className="w-[120px]" value={interval} onChange={(e) => setInterval(e.target.value)} aria-label="Probe interval" />
          <span className="text-caption text-ink-muted">Minimum 15s. Reads one row.</span>
        </div>
      </SettingsRow>
      <SettingsRow label="Owner">
        <Input value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Owner" />
      </SettingsRow>
      <SettingsRow label="Notifier route">
        <span className="text-body-sm text-ink-muted">inherit · per-source ({detail.sourceName})</span>
      </SettingsRow>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={save}>Save</Button>
        <Button variant="ghost" className="text-alert" onClick={onStop}>Stop monitoring</Button>
      </div>
    </div>
  )
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 lg:grid-cols-[220px_minmax(0,1fr)]">
      <label className="text-label font-display uppercase tracking-[.1em] text-ink-muted">{label}</label>
      <div>{children}</div>
    </div>
  )
}
