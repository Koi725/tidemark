import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { Button, Frame, Input, Segmented, Switch, Tag } from '@/components/primitives'
import { NinetyDayBarStrip } from '@/components/data/NinetyDayBarStrip'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { stateMeta } from '@/lib/state'
import { formatPct } from '@/lib/format'
import { useDatasets } from '@/features/datasets'
import { useStatusPage, usePutStatusPage, usePreviewDatasets } from '@/features/statusPage'
import type { DatasetSummary, PublicTheme, StatusPageConfig } from '@/contracts'

export const Route = createFileRoute('/_app/status')({
  component: StatusEditorRoute,
})

function StatusEditor({ config, datasets }: { config: StatusPageConfig; datasets: DatasetSummary[] }) {
  const navigate = useNavigate()
  const putStatusPage = usePutStatusPage()
  const [title, setTitle] = useState(config.title)
  const [slug, setSlug] = useState(config.slug)
  const [theme, setTheme] = useState<PublicTheme>(config.theme)
  const [selected, setSelected] = useState<string[]>([...config.datasetIds])
  const [showIncidents, setShowIncidents] = useState(config.showIncidents)
  const [published, setPublished] = useState(config.published)

  const previewQuery = usePreviewDatasets(selected)
  const preview = previewQuery.data ?? []
  const slugTaken = slug !== config.slug && slug === 'taken'
  const canPublish = selected.length > 0 && !slugTaken

  const toggleDataset = (id: string): void =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const publish = (): void => {
    putStatusPage.mutate({
      title,
      slug,
      theme,
      datasetIds: selected,
      showIncidents,
      published: true,
      publishedAt: new Date().toISOString(),
    })
    setPublished(true)
  }

  return (
    <>
      <HeaderStrip
        title="Status page"
        meta={
          <span className="inline-flex items-center gap-2 font-mono text-mono-sm">
            <span className={published ? 'text-ink-muted' : 'text-ink-faint'}>status.acme.dev/{slug}</span>
            {!published ? <Tag variant="outline">draft</Tag> : null}
          </span>
        }
        right={
          <>
            <Button
              variant="secondary"
              startSlot={<ExternalLink size={14} strokeWidth={1.5} aria-hidden="true" />}
              onClick={() => void navigate({ to: '/status/$slug', params: { slug } })}
            >
              View public page
            </Button>
            <Button variant="primary" disabled={!canPublish} onClick={publish}>
              Publish
            </Button>
          </>
        }
      />

      <div className="grid gap-[var(--tm-gap)] p-[var(--tm-pad)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Slug</span>
            <Input mono value={slug} onChange={(e) => setSlug(e.target.value)} invalid={slugTaken} aria-label="Slug" />
            <span className={slugTaken ? 'text-[11px] text-alert' : 'text-[11px] text-ink-muted'}>
              {slugTaken ? 'That slug is taken.' : 'Lowercase letters, numbers and dashes.'}
            </span>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Theme</span>
            <Segmented
              ariaLabel="Public page theme"
              value={theme}
              onValueChange={(v) => setTheme(v as PublicTheme)}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">
              Datasets shown · {selected.length}
            </span>
            <div className="max-h-[300px] overflow-auto border border-hairline">
              {datasets.map((d) => (
                <label key={d.id} className="flex min-h-[40px] items-center gap-3 border-b border-hairline px-3 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selected.includes(d.id)}
                    onChange={() => toggleDataset(d.id)}
                    className="size-4 accent-[var(--tm-accent)]"
                  />
                  <span className="truncate font-mono text-mono-sm text-ink" title={d.key}>
                    {d.key}
                  </span>
                </label>
              ))}
            </div>
            {selected.length === 0 ? (
              <span className="text-[11px] text-ink-muted">Pick at least one dataset to publish.</span>
            ) : null}
          </div>

          <label className="flex items-center gap-2.5">
            <Switch checked={showIncidents} onCheckedChange={setShowIncidents} aria-label="Show incident history publicly" />
            <span className="text-body-sm text-ink">Show incident history (publicly)</span>
          </label>
        </div>

        <Frame className="flex flex-col gap-4 p-[var(--tm-pad)]">
          <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Live preview</span>
          {preview.length === 0 ? (
            <EmptyState size="sm" title="Nothing selected" body="Pick datasets on the left to preview the public page." />
          ) : (
            <div className="flex flex-col gap-4">
              {preview.map((d) => {
                const Icon = stateMeta[d.state].icon
                return (
                  <div key={d.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={16} strokeWidth={1.8} aria-hidden="true" style={{ color: `var(${stateMeta[d.state].cssVar})` }} />
                      <span className="min-w-0 flex-1 truncate font-mono text-mono-sm text-ink">{d.key}</span>
                      <span className="text-caption text-ink-muted">{formatPct(d.uptimePct, { uptime: true })} fresh</span>
                    </div>
                    <NinetyDayBarStrip days={d.days} size="sm" label={d.key} />
                  </div>
                )
              })}
            </div>
          )}
        </Frame>
      </div>
    </>
  )
}

function StatusEditorRoute() {
  const configQuery = useStatusPage()
  const datasetsQuery = useDatasets()

  if (!configQuery.data || !datasetsQuery.data) {
    return (
      <>
        <HeaderStrip title="Status page" />
        <div className="grid gap-[var(--tm-gap)] p-[var(--tm-pad)] lg:grid-cols-2" aria-busy="true" aria-label="Loading status page">
          <Skeleton variant="row" height={200} />
          <Skeleton variant="row" height={200} />
        </div>
      </>
    )
  }

  return <StatusEditor config={configQuery.data} datasets={datasetsQuery.data} />
}
