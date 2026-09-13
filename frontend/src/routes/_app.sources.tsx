import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { SourceCard } from '@/components/cards/SourceCard'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { AddSourceWizard } from '@/components/wizard/AddSourceWizard'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Button } from '@/components/primitives'
import { notify } from '@/components/feedback/notify'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { SOURCES } from '@/mocks'
import type { Source } from '@/mocks'

interface SourcesSearch {
  mock?: string
}

export const Route = createFileRoute('/_app/sources')({
  component: SourcesRoute,
  validateSearch: (search: Record<string, unknown>): SourcesSearch => ({
    mock: typeof search.mock === 'string' ? search.mock : undefined,
  }),
})

function SourcesRoute() {
  const { mock } = Route.useSearch()
  const [sources, setSources] = useState<Source[]>(mock === 'empty' ? [] : [...SOURCES])
  const [wizardOpen, setWizardOpen] = useState(false)
  const [probingId, setProbingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null)

  const probe = (source: Source): void => {
    setProbingId(source.id)
    notify('info', `Probe queued for ${source.name}`)
    window.setTimeout(() => setProbingId(null), 1400)
  }

  const header = (
    <HeaderStrip
      title="Sources"
      meta={<span>{sources.length} connected · read-only roles</span>}
      right={
        <Button variant="primary" startSlot={<Plus size={14} strokeWidth={1.5} aria-hidden="true" />} onClick={() => setWizardOpen(true)}>
          Add source
        </Button>
      }
    />
  )

  return (
    <>
      {header}
      <div className="p-[var(--tm-pad)]">
        {mock === 'loading' ? (
          <div aria-busy="true" aria-label="Loading sources" className="border border-hairline">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="row" />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <EmptyState
            title="No sources yet"
            body="Connect a database, a bucket or a topic. Read-only is enough."
            action={{ label: 'Add source', onClick: () => setWizardOpen(true) }}
          />
        ) : (
          <div className="border border-hairline md:border-b-0">
            <div className="flex flex-col gap-2 md:block md:gap-0">
              {sources.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  probing={probingId === source.id}
                  onProbe={probe}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AddSourceWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={deleteTarget ? `Delete ${deleteTarget.name}?` : 'Delete source?'}
        body={
          deleteTarget
            ? `Removes the source, its ${deleteTarget.datasetCount} datasets and all probe history. Your database is untouched.`
            : ''
        }
        match={deleteTarget?.name ?? ''}
        actionLabel="Delete source"
        onConfirm={() => {
          if (deleteTarget) {
            setSources((prev) => prev.filter((s) => s.id !== deleteTarget.id))
            notify('ok', `Deleted ${deleteTarget.name}`)
          }
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
