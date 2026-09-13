import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
 * Cross-cutting UI state (spec §8.3). Theme + density keep their existing
 * providers; this store holds:
 *  - sidebar collapse (persisted)
 *  - the session-only `hasStaggered` flag guarding the one-time Overview stagger (§5.2)
 *  - command-palette open state + recents (§3.27 / Screen 9)
 *  - timezone preference (§6.4) and a manual reduce-motion override (§8.4 Appearance)
 */

const MAX_RECENTS = 5

export interface RecentDataset {
  id: string
  key: string
}

interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebar: (collapsed: boolean) => void

  hasStaggered: boolean
  markStaggered: () => void

  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  togglePalette: () => void

  lastVisited: RecentDataset[]
  pushRecent: (dataset: RecentDataset) => void

  tz: 'local' | 'utc'
  setTz: (tz: 'local' | 'utc') => void

  /** Manual reduce-motion override for this browser (§8.4). */
  reduceMotion: boolean
  setReduceMotion: (on: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),

      hasStaggered: false,
      markStaggered: () => set({ hasStaggered: true }),

      paletteOpen: false,
      setPaletteOpen: (open) => set({ paletteOpen: open }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),

      lastVisited: [],
      pushRecent: (dataset) =>
        set((s) => ({
          lastVisited: [dataset, ...s.lastVisited.filter((d) => d.id !== dataset.id)].slice(
            0,
            MAX_RECENTS,
          ),
        })),

      tz: 'local',
      setTz: (tz) => set({ tz }),

      reduceMotion: false,
      setReduceMotion: (on) => set({ reduceMotion: on }),
    }),
    {
      name: 'tm.ui',
      // hasStaggered + paletteOpen reset each session; the rest is durable.
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        lastVisited: s.lastVisited,
        tz: s.tz,
        reduceMotion: s.reduceMotion,
      }),
    },
  ),
)
