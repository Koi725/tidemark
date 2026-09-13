import { useEffect } from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/feedback/Toast'
import { DensityProvider } from '@/providers/density'
import { ThemeProvider } from '@/providers/theme'
import { useUiStore } from '@/stores/ui'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const reduceMotion = useUiStore((s) => s.reduceMotion)

  // Mirror the manual reduce-motion override onto <html> for the CSS fallback (§8.4).
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? 'true' : 'false'
  }, [reduceMotion])

  return (
    <ThemeProvider>
      <DensityProvider>
        <Outlet />
        <Toaster />
      </DensityProvider>
    </ThemeProvider>
  )
}
