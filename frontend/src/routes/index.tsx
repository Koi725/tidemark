import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexRoute,
})

function IndexRoute() {
  return (
    <main className="grid min-h-svh place-items-center bg-bg text-fg">
      <div className="text-center">
        <p className="tm-display text-3xl">tidemark</p>
        <p className="mt-2 text-sm text-fg-muted">
          Foundations phase — no screens yet.
        </p>
        <Link
          to="/dev/tokens"
          className="tm-focusable mt-4 inline-block rounded-md border border-border px-4 py-2 text-sm text-accent hover:bg-surface-2"
        >
          Open /dev/tokens
        </Link>
      </div>
    </main>
  )
}
