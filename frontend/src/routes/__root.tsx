import { Outlet, createRootRoute } from '@tanstack/react-router'
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
      </DensityProvider>
    </ThemeProvider>
  )
}
