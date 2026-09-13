import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/shell/AppShell'
import { CommandPalette } from '@/components/overlays/CommandPalette'
import { useLiveUpdates } from '@/lib/sse'

/** Pathless layout: app shell (§2) + command palette (§9) + live SSE updates (§5.8). */
export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  useLiveUpdates()
  return (
    <AppShell>
      <Outlet />
      <CommandPalette />
    </AppShell>
  )
}
