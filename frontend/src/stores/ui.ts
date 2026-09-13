import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
 * Cross-cutting UI state (spec §8.3). Theme + density keep their existing
 * providers; this store holds the sidebar collapse (persisted at tm.ui.sidebar)
 * and the session-only `hasStaggered` flag that guards the one-time Overview card
 * stagger (§5.2 — fires once per session, never on filter/SSE/route changes).
 */

interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebar: (collapsed: boolean) => void
  /** Session flag: has the Overview grid played its entrance stagger yet? */
  hasStaggered: boolean
  markStaggered: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),
      hasStaggered: false,
      markStaggered: () => set({ hasStaggered: true }),
    }),
    {
      name: 'tm.ui.sidebar',
      // Only the collapse pref is durable; hasStaggered resets each session.
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
)
