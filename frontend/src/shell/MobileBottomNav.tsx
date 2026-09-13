import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/cn'
import { MOBILE_NAV_IDS, NAV_ITEMS } from './nav'

/** Mobile bottom nav (§2): 5 items, 60px + safe area, 2px accent top edge when active. */
export function MobileBottomNav(): React.JSX.Element {
  const { pathname } = useLocation()
  const items = MOBILE_NAV_IDS.map((id) => NAV_ITEMS.find((n) => n.id === id)).filter(
    (n): n is (typeof NAV_ITEMS)[number] => Boolean(n),
  )

  return (
    <nav
      className="flex shrink-0 border-t border-hairline pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Primary"
    >
      {items.map((item) => {
        const Icon = item.icon
        const active =
          item.id === 'overview'
            ? pathname === '/' || pathname.startsWith('/datasets')
            : item.to
              ? pathname.startsWith(item.to)
              : false
        const content = (
          <>
            <span className="relative">
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              {item.badge ? (
                <span className="absolute -right-3 -top-1.5 rounded-full bg-alert-bg px-1 font-mono text-[10px] leading-[18px] text-alert">
                  {item.badge}
                </span>
              ) : null}
            </span>
            <span className="text-[10px]">{item.label}</span>
          </>
        )
        const className = cn(
          'tm-touch flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 border-t-2 py-1.5',
          active ? 'border-tide text-ink' : 'border-transparent text-ink-muted',
        )
        return item.to ? (
          <Link key={item.id} to={item.to} aria-current={active ? 'page' : undefined} className={cn(className, 'no-underline')}>
            {content}
          </Link>
        ) : (
          <button key={item.id} type="button" aria-label={item.label} className={className}>
            {content}
          </button>
        )
      })}
    </nav>
  )
}
