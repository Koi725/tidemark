import { Link, useLocation } from '@tanstack/react-router'
import {
  Content,
  Portal,
  Provider,
  Root,
  Trigger,
} from '@radix-ui/react-tooltip'
import { Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TidemarkMark } from '@/components/brand/TidemarkMark'
import { cn } from '@/lib/cn'
import { useTheme } from '@/providers/theme'
import { useUiStore } from '@/stores/ui'
import { NAV_ITEMS } from './nav'
import type { NavItem, NavTo } from './nav'

function isActive(pathname: string, item: NavItem): boolean {
  if (item.id === 'overview') return pathname === '/' || pathname.startsWith('/datasets')
  return item.to ? pathname.startsWith(item.to) : false
}

interface RowProps {
  icon: LucideIcon
  label: string
  active?: boolean
  badge?: number
  collapsed: boolean
  to?: NavTo
  onClick?: () => void
}

function NavRow({ icon: Icon, label, active, badge, collapsed, to, onClick }: RowProps) {
  const className = cn(
    'tm-touch flex h-[36px] items-center gap-2.5 border-l-2 px-2.5 text-body transition-[background,color] duration-fast ease-out',
    collapsed && 'justify-center px-0',
    active
      ? 'border-tide bg-faint text-ink'
      : 'border-transparent text-ink-muted hover:bg-faint hover:text-ink',
  )
  const inner = (
    <>
      <Icon size={18} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="flex-1 truncate">{label}</span> : null}
      {!collapsed && badge ? (
        <span className="rounded-md bg-alert-bg px-1.5 font-mono text-mono-sm text-alert">{badge}</span>
      ) : null}
    </>
  )

  const node =
    to !== undefined ? (
      <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        aria-label={label}
        className={cn(className, 'no-underline')}
      >
        {inner}
      </Link>
    ) : (
      <button type="button" onClick={onClick} aria-label={label} className={cn(className, 'w-full text-left')}>
        {inner}
      </button>
    )

  if (!collapsed) return node
  return (
    <Root>
      <Trigger asChild>{node}</Trigger>
      <Portal>
        <Content
          side="right"
          sideOffset={8}
          className="z-50 border border-hairline bg-overlay px-2 py-1 text-caption text-ink shadow-md"
        >
          {label}
          {badge ? ` · ${badge}` : ''}
        </Content>
      </Portal>
    </Root>
  )
}

/** Desktop sidebar (§2): expanded 216px / collapsed 56px, manual persisted collapse. */
export function Sidebar(): React.JSX.Element {
  const { pathname } = useLocation()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <Provider delayDuration={120}>
      <aside
        className={cn(
          'sticky top-0 hidden h-svh shrink-0 flex-col border-r border-hairline px-[10px] py-[14px] transition-[width] duration-slow ease-out lg:flex',
          collapsed ? 'w-[56px]' : 'w-[216px]',
        )}
      >
        <div className={cn('mb-4 flex items-center gap-2.5 px-1', collapsed && 'justify-center px-0')}>
          <TidemarkMark size={22} className="shrink-0 text-tide" />
          {!collapsed ? (
            <span className="font-display text-h3 tracking-[.02em] text-ink">tidemark</span>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-[4px]">
          {NAV_ITEMS.map((item) => (
            <NavRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={isActive(pathname, item)}
              badge={item.badge}
              collapsed={collapsed}
              to={item.to}
            />
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-hairline pt-2">
          <NavRow
            icon={theme === 'dark' ? Sun : Moon}
            label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            collapsed={collapsed}
            onClick={toggleTheme}
          />
          <NavRow
            icon={collapsed ? PanelLeftOpen : PanelLeftClose}
            label={collapsed ? 'Expand' : 'Collapse'}
            collapsed={collapsed}
            onClick={toggle}
          />
        </div>
      </aside>
    </Provider>
  )
}
