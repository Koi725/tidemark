import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/shell/AppShell'

/** Pathless layout: everything under it gets the app shell (§2). */
export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
