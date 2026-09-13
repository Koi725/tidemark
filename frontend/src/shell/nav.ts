import {
  Bell,
  Database,
  Globe,
  LayoutGrid,
  Settings,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  /** Present when the route exists; inert placeholder otherwise (screens 3/5/6/7/8 pending). */
  to?: '/'
  /** Live alert count badge (Incidents). */
  badge?: number
}

/** Sidebar order (§2). Only Overview routes in this build; the rest are placeholders. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, to: '/' },
  { id: 'sources', label: 'Sources', icon: Database },
  { id: 'incidents', label: 'Incidents', icon: Zap, badge: 3 },
  { id: 'status', label: 'Status', icon: Globe },
  { id: 'notifiers', label: 'Notifiers', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
]

/** Mobile bottom-nav subset (§2): 5 items. */
export const MOBILE_NAV_IDS = ['overview', 'sources', 'incidents', 'status', 'settings'] as const
