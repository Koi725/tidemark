import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/feedback/Toast'
import { DensityProvider } from '@/providers/density'
import { ThemeProvider } from '@/providers/theme'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <Outlet />
        <Toaster />
      </DensityProvider>
    </ThemeProvider>
  )
}
