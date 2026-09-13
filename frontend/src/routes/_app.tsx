import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/shell/AppShell'
import { CommandPalette } from '@/components/overlays/CommandPalette'

/** Pathless layout: everything under it gets the app shell (§2) + command palette (§9). */
export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <CommandPalette />
    </AppShell>
  )
}
