import { useState } from 'react'
import {
  Content,
  Item,
  Portal,
  Root as MenuRoot,
  Trigger,
} from '@radix-ui/react-dropdown-menu'
import { Content as TipContent, Portal as TipPortal, Provider, Root as TipRoot, Trigger as TipTrigger } from '@radix-ui/react-tooltip'
import { Check, ChevronDown, RotateCcw } from 'lucide-react'
import { Button, Switch } from '@/components/primitives'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { StatusBadge } from '@/components/status/StatusBadge'
import { cn } from '@/lib/cn'
import type { IncidentSeverity, Notifier, Route } from '@/mocks'

export interface RoutingMatrixProps {
  notifiers: readonly Notifier[]
  routes: readonly Route[]
  loading?: boolean
  onAddNotifier?: () => void
}

const menuContentClass =
  'z-[30] min-w-[140px] border border-hairline bg-overlay p-1 shadow-md data-[state=open]:animate-[tw-pop_160ms_var(--ease-out)]'
const menuItemClass =
  'flex min-h-9 cursor-pointer items-center px-2.5 text-body-sm text-ink outline-none data-[highlighted]:bg-faint'

function SeveritySelect({
  value,
  onChange,
}: {
  value: IncidentSeverity
  onChange: (v: IncidentSeverity) => void
}) {
  return (
    <MenuRoot>
      <Trigger asChild>
        <button type="button" className="inline-flex items-center gap-1" aria-label="Minimum severity">
          <StatusBadge state={value} />
          <ChevronDown size={14} strokeWidth={1.5} className="text-ink-muted" aria-hidden="true" />
        </button>
      </Trigger>
      <Portal>
        <Content align="end" className={menuContentClass}>
          {(['warn', 'alert'] as IncidentSeverity[]).map((s) => (
            <Item key={s} className={menuItemClass} onSelect={() => onChange(s)}>
              <StatusBadge state={s} />
            </Item>
          ))}
        </Content>
      </Portal>
    </MenuRoot>
  )
}

export function RoutingMatrix({ notifiers, routes, loading = false, onAddNotifier }: RoutingMatrixProps): React.JSX.Element {
  const [rows, setRows] = useState<Route[]>(routes.map((r) => ({ ...r, notifierIds: [...r.notifierIds] })))

  const globalRow = rows.find((r) => r.scope === 'global')
  const inheritedFor = (nid: string): boolean => Boolean(globalRow?.notifierIds.includes(nid))

  const toggle = (routeId: string, nid: string): void => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== routeId) return r
        const on = r.notifierIds.includes(nid)
        return { ...r, notifierIds: on ? r.notifierIds.filter((x) => x !== nid) : [...r.notifierIds, nid] }
      }),
    )
  }

  const setSeverity = (routeId: string, sev: IncidentSeverity): void =>
    setRows((prev) => prev.map((r) => (r.id === routeId ? { ...r, minSeverity: sev } : r)))

  const resetRow = (routeId: string): void =>
    setRows((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, notifierIds: [...(globalRow?.notifierIds ?? [])] } : r)),
    )

  if (loading) {
    return (
      <div className="flex flex-col gap-2 border border-hairline p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="row" />
        ))}
      </div>
    )
  }

  if (notifiers.length === 0) {
    return (
      <EmptyState
        title="No notifiers yet"
        body="Routing needs at least one notifier."
        action={onAddNotifier ? { label: 'Add notifier', onClick: onAddNotifier } : undefined}
      />
    )
  }

  return (
    <Provider delayDuration={200}>
      {/* ≥768 table */}
      <div className="hidden overflow-x-auto border border-hairline md:block">
        <table className="w-full min-w-[560px]">
          <caption className="sr-only">Notifier routing by scope</caption>
          <thead>
            <tr className="border-b border-hairline bg-raised">
              <th className="sticky left-0 z-[1] bg-raised px-3 py-2 text-left text-label font-display uppercase tracking-[.1em] text-ink-muted">
                Scope
              </th>
              {notifiers.map((n) => (
                <th key={n.id} className="px-2 py-2 text-center text-label font-display uppercase tracking-[.1em] text-ink-muted">
                  {n.name}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-label font-display uppercase tracking-[.1em] text-ink-muted">
                Min severity
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((route) => (
              <tr key={route.id} className="border-b border-hairline hover:bg-faint">
                <td className="sticky left-0 z-[1] bg-canvas px-3 py-2">
                  <span className="mr-1.5 text-label uppercase tracking-[.1em] text-ink-muted">{route.scope}</span>
                  <span className="font-mono text-mono text-ink">{route.scopeLabel}</span>
                </td>
                {notifiers.map((n) => {
                  const on = route.notifierIds.includes(n.id)
                  const inherited = route.scope !== 'global' && !on && inheritedFor(n.id)
                  return (
                    <td key={n.id} className="text-center">
                      <TipRoot>
                        <TipTrigger asChild>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on || inherited}
                            aria-label={`${n.name} for ${route.scopeLabel}`}
                            onClick={() => toggle(route.id, n.id)}
                            className="tm-touch inline-grid h-9 w-11 place-items-center"
                          >
                            <span
                              className={cn(
                                'grid size-4 place-items-center border',
                                on
                                  ? 'border-tide bg-tide'
                                  : inherited
                                    ? 'border-dashed border-strong opacity-45'
                                    : 'border-hairline bg-transparent',
                              )}
                            >
                              {on ? (
                                <Check size={12} strokeWidth={2.4} style={{ color: 'var(--tm-accent-on)' }} aria-hidden="true" />
                              ) : inherited ? (
                                <Check size={12} strokeWidth={2} className="text-ink-muted" aria-hidden="true" />
                              ) : null}
                            </span>
                          </button>
                        </TipTrigger>
                        {inherited ? (
                          <TipPortal>
                            <TipContent side="top" className="z-50 border border-hairline bg-overlay px-2 py-1 text-caption text-ink shadow-md">
                              inherited from global
                            </TipContent>
                          </TipPortal>
                        ) : null}
                      </TipRoot>
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <SeveritySelect value={route.minSeverity} onChange={(s) => setSeverity(route.id, s)} />
                    {route.scope !== 'global' ? (
                      <Button variant="icon" aria-label="Reset to inherited" onClick={() => resetRow(route.id)}>
                        <RotateCcw size={14} strokeWidth={1.5} aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <768 accordion */}
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((route) => (
          <div key={route.id} className="border border-hairline">
            <div className="flex items-center gap-2 border-b border-hairline bg-raised px-3 py-2">
              <span className="text-label uppercase tracking-[.1em] text-ink-muted">{route.scope}</span>
              <span className="font-mono text-mono text-ink">{route.scopeLabel}</span>
              <span className="ml-auto">
                <SeveritySelect value={route.minSeverity} onChange={(s) => setSeverity(route.id, s)} />
              </span>
            </div>
            {notifiers.map((n) => (
              <label key={n.id} className="flex min-h-[44px] items-center gap-3 border-b border-hairline px-3 last:border-b-0">
                <span className="flex-1 text-body-sm text-ink">{n.name}</span>
                <Switch
                  checked={route.notifierIds.includes(n.id)}
                  onCheckedChange={() => toggle(route.id, n.id)}
                  aria-label={`${n.name} for ${route.scopeLabel}`}
                />
              </label>
            ))}
          </div>
        ))}
      </div>
    </Provider>
  )
}
