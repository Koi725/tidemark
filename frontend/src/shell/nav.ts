import {
  Bell,
  Database,
  Globe,
  LayoutGrid,
  Settings,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type NavTo = '/' | '/sources' | '/incidents' | '/notifiers'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  /** Present when the route exists; inert placeholder otherwise (screens 7/8 pending). */
  to?: NavTo
  /** Live alert count badge (Incidents). */
  badge?: number
}

/** Sidebar order (§2). Status + Settings routes are not built in this phase. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, to: '/' },
  { id: 'sources', label: 'Sources', icon: Database, to: '/sources' },
  { id: 'incidents', label: 'Incidents', icon: Zap, to: '/incidents', badge: 3 },
  { id: 'status', label: 'Status', icon: Globe },
  { id: 'notifiers', label: 'Notifiers', icon: Bell, to: '/notifiers' },
  { id: 'settings', label: 'Settings', icon: Settings },
]

/** Mobile bottom-nav subset (§2): 5 items. */
export const MOBILE_NAV_IDS = ['overview', 'sources', 'incidents', 'status', 'settings'] as const
