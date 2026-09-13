import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { SourceCard } from '@/components/cards/SourceCard'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { AddSourceWizard } from '@/components/wizard/AddSourceWizard'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Button } from '@/components/primitives'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { useSources, useProbeSource, useDeleteSource } from '@/features/sources'
import type { Source } from '@/contracts'

export const Route = createFileRoute('/_app/sources')({
  component: SourcesRoute,
})

function SourcesRoute() {
  const sourcesQuery = useSources()
  const probeMutation = useProbeSource()
  const deleteMutation = useDeleteSource()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null)

  const sources = sourcesQuery.data ?? []

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
        {sourcesQuery.isPending ? (
          <div aria-busy="true" aria-label="Loading sources" className="border border-hairline">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="row" />
            ))}
          </div>
        ) : sourcesQuery.isError ? (
          <ErrorState
            variant="page"
            headline="Couldn't load sources"
            raw={'GET /api/sources failed\nprobe_id=src-1 attempt=1/3 next_retry=4s'}
            onRetry={() => void sourcesQuery.refetch()}
          />
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
                  probing={probeMutation.isPending && probeMutation.variables?.id === source.id}
                  onProbe={(s) => probeMutation.mutate({ id: s.id, name: s.name })}
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
          if (deleteTarget) deleteMutation.mutate({ id: deleteTarget.id, name: deleteTarget.name })
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
