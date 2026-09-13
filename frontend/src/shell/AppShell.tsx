import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from '@tanstack/react-router'
import { MobileBottomNav } from './MobileBottomNav'
import { MobileTopBar } from './MobileTopBar'
import { ScrollContext } from './scrollContext'
import { Sidebar } from './Sidebar'

/** The desktop/mobile app shell (§2). `main` is the single scroll container. */
export function AppShell({ children }: { children: ReactNode }): React.JSX.Element {
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const title = pathname.startsWith('/datasets') ? 'Dataset' : 'Overview'

  return (
    <ScrollContext value={mainRef}>
      <div className="flex h-svh overflow-hidden bg-canvas text-ink">
        <Sidebar />
        <div className="flex h-svh min-w-0 flex-1 flex-col">
          <MobileTopBar title={title} />
          <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </ScrollContext>
  )
}
