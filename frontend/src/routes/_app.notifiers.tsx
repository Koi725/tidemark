import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { NotifierCard } from '@/components/cards/NotifierCard'
import { RoutingMatrix } from '@/components/data/RoutingMatrix'
import { NotifierDialog } from '@/components/overlays/NotifierDialog'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Button } from '@/components/primitives'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { NOTIFIERS, ROUTES } from '@/mocks'
import type { Notifier } from '@/mocks'

interface NotifiersSearch {
  mock?: string
}

export const Route = createFileRoute('/_app/notifiers')({
  component: NotifiersRoute,
  validateSearch: (search: Record<string, unknown>): NotifiersSearch => ({
    mock: typeof search.mock === 'string' ? search.mock : undefined,
  }),
})

function NotifiersRoute() {
  const { mock } = Route.useSearch()
  const notifiers = mock === 'empty' ? [] : NOTIFIERS
  const routes = mock === 'empty' ? [] : ROUTES
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Notifier | null>(null)

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
        {notifiers.length === 0 ? (
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
              <RoutingMatrix notifiers={notifiers} routes={routes} onAddNotifier={add} />
            </section>
          </>
        )}
      </div>

      <NotifierDialog open={dialogOpen} onOpenChange={setDialogOpen} notifier={editing} />
    </>
  )
}
