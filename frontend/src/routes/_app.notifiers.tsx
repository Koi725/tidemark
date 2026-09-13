import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { NotifierCard } from '@/components/cards/NotifierCard'
import { RoutingMatrix } from '@/components/data/RoutingMatrix'
import { NotifierDialog } from '@/components/overlays/NotifierDialog'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { Button } from '@/components/primitives'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { useNotifiers, useCreateNotifier, useUpdateNotifier, useTestNotifier } from '@/features/notifiers'
import { useRoutes, usePutRoutes } from '@/features/routes'
import type { Notifier, Route as RouteConfig } from '@/contracts'

export const Route = createFileRoute('/_app/notifiers')({
  component: NotifiersRoute,
})

function NotifiersRoute() {
  const notifiersQuery = useNotifiers()
  const routesQuery = useRoutes()
  const createMutation = useCreateNotifier()
  const updateMutation = useUpdateNotifier()
  const testMutation = useTestNotifier()
  const putRoutes = usePutRoutes()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Notifier | null>(null)

  const notifiers = notifiersQuery.data ?? []
  const routes = routesQuery.data ?? []

  const add = (): void => {
    setEditing(null)
    setDialogOpen(true)
  }
  const edit = (n: Notifier): void => {
    setEditing(n)
    setDialogOpen(true)
  }

  return (
    <>
      <HeaderStrip
        title="Notifiers"
        meta={<span>Slack, Discord, Telegram, ntfy, email, webhook — 100+ more via Apprise</span>}
        right={
          <Button variant="primary" startSlot={<Plus size={14} strokeWidth={1.5} aria-hidden="true" />} onClick={add}>
            Add notifier
          </Button>
        }
      />

      <div className="flex flex-col gap-8 p-[var(--tm-pad)]">
        {notifiersQuery.isPending ? (
          <div
            aria-busy="true"
            aria-label="Loading notifiers"
            className="grid gap-[var(--tm-gap)]"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="row" height={150} />
            ))}
          </div>
        ) : notifiersQuery.isError ? (
          <ErrorState
            variant="page"
            headline="Couldn't load notifiers"
            raw={'GET /api/notifiers failed\nprobe_id=ntf-1 attempt=1/3 next_retry=4s'}
            onRetry={() => void notifiersQuery.refetch()}
          />
        ) : notifiers.length === 0 ? (
          <EmptyState
            title="No notifiers yet"
            body="tidemark can't tell you anything until it has somewhere to send it."
            action={{ label: 'Add notifier', onClick: add }}
          />
        ) : (
          <>
            <div
              className="grid gap-[var(--tm-gap)]"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
            >
              {notifiers.map((n) => (
                <NotifierCard key={n.id} notifier={n} onEdit={edit} />
              ))}
            </div>

            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display text-h3 text-ink">Routing</h3>
                <span className="text-caption text-ink-muted">
                  Who hears about what. Per-source and per-tag rows override global.
                </span>
              </div>
              <RoutingMatrix
                notifiers={notifiers}
                routes={routes}
                onChange={(next: RouteConfig[]) => putRoutes.mutate(next)}
                onAddNotifier={add}
              />
            </section>
          </>
        )}
      </div>

      <NotifierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        notifier={editing}
        onSubmit={(input) =>
          editing ? updateMutation.mutate({ id: editing.id, input }) : createMutation.mutate(input)
        }
        onTest={(input) => testMutation.mutate({ id: editing?.id ?? 'new', kind: input.kind })}
      />
    </>
  )
}
