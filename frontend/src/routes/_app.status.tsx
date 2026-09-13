import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { Button, Frame, Input, Segmented, Switch, Tag } from '@/components/primitives'
import { NinetyDayBarStrip } from '@/components/data/NinetyDayBarStrip'
import { EmptyState } from '@/components/feedback/EmptyState'
import { notify } from '@/components/feedback/notify'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { stateMeta } from '@/lib/state'
import { formatPct } from '@/lib/format'
import { DATASETS, STATUS_PAGE, previewDatasets } from '@/mocks'
import type { PublicTheme } from '@/mocks'

export const Route = createFileRoute('/_app/status')({
  component: StatusEditorRoute,
})

function StatusEditorRoute() {
  const navigate = useNavigate()
  const [title, setTitle] = useState(STATUS_PAGE.title)
  const [slug, setSlug] = useState(STATUS_PAGE.slug)
  const [theme, setTheme] = useState<PublicTheme>(STATUS_PAGE.theme)
  const [selected, setSelected] = useState<string[]>([...STATUS_PAGE.datasetIds])
  const [showIncidents, setShowIncidents] = useState(STATUS_PAGE.showIncidents)
  const [published, setPublished] = useState(STATUS_PAGE.published)

  const preview = useMemo(() => previewDatasets(selected), [selected])
  const slugTaken = slug !== STATUS_PAGE.slug && slug === 'taken'
  const canPublish = selected.length > 0 && !slugTaken

  const toggleDataset = (id: string): void =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

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
            <Button
              variant="primary"
              disabled={!canPublish}
              onClick={() => {
                setPublished(true)
                notify('ok', `Published to status.acme.dev/${slug}`)
              }}
            >
              Publish
            </Button>
          </>
        }
      />

      <div className="grid gap-[var(--tm-gap)] p-[var(--tm-pad)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* left: form */}
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
              {DATASETS.map((d) => (
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
            {!canPublish && selected.length === 0 ? (
              <span className="text-[11px] text-ink-muted">Pick at least one dataset to publish.</span>
            ) : null}
          </div>

          <label className="flex items-center gap-2.5">
            <Switch checked={showIncidents} onCheckedChange={setShowIncidents} aria-label="Show incident history publicly" />
            <span className="text-body-sm text-ink">Show incident history (publicly)</span>
          </label>
        </div>

        {/* right: live preview */}
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
