import { useEffect, useState } from 'react'
import { Content, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import {
  Database,
  Globe,
  Moon,
  Plus,
  RefreshCw,
  Rows3,
  Search,
  Sun,
  Zap,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Corner, Kbd } from '@/components/primitives'
import type { CornerPosition } from '@/components/primitives'
import { notify } from '@/components/feedback/notify'
import { stateMeta } from '@/lib/state'
import { useTheme } from '@/providers/theme'
import { useDensity } from '@/providers/density'
import { useUiStore } from '@/stores/ui'
import { useDatasets } from '@/features/datasets'
import { useSources } from '@/features/sources'
import { useIncidents } from '@/features/incidents'
import { useStatusPage } from '@/features/statusPage'

const CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

const itemClass =
  'flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[13px] text-ink data-[selected=true]:bg-faint'
const groupClass =
  '[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[.1em] [&_[cmdk-group-heading]]:text-ink-muted'

/** Inner body — mounted only while open (Radix unmounts Content on close), so the
 * query resets fresh each time without a reset-on-open effect. */
function PaletteBody({ onClose }: { onClose: () => void }): React.JSX.Element {
  const recents = useUiStore((s) => s.lastVisited)
  const pushRecent = useUiStore((s) => s.pushRecent)
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useTheme()
  const { density, setDensity } = useDensity()
  const [query, setQuery] = useState('')

  const datasets = useDatasets().data ?? []
  const sources = useSources().data ?? []
  const incidents = useIncidents('all').data ?? []
  const statusSlug = useStatusPage().data?.slug ?? 'acme'

  const actionsOnly = query.trimStart().startsWith('>')
  const term = (actionsOnly ? query.replace(/^\s*>/, '') : query).trim().toLowerCase()

  const run = (fn: () => void): void => {
    fn()
    onClose()
  }

  const matchedDatasets =
    !actionsOnly && term ? datasets.filter((d) => d.key.toLowerCase().includes(term)).slice(0, 5) : []
  const matchedSources =
    !actionsOnly && term ? sources.filter((s) => s.name.toLowerCase().includes(term)).slice(0, 3) : []
  const matchedIncidents =
    !actionsOnly && term
      ? incidents.filter((i) => i.title.toLowerCase().includes(term) || i.datasetKey.toLowerCase().includes(term)).slice(0, 3)
      : []

  const actions = [
    {
      id: 'probe-all',
      label: 'Probe all sources now',
      hint: 'runs every check',
      icon: <RefreshCw size={14} strokeWidth={1.5} aria-hidden="true" />,
      run: () => notify('info', 'Probe queued for all sources'),
    },
    {
      id: 'toggle-theme',
      label: 'Toggle theme',
      hint: `switch to ${theme === 'dark' ? 'light' : 'dark'}`,
      icon: theme === 'dark' ? <Sun size={14} strokeWidth={1.5} aria-hidden="true" /> : <Moon size={14} strokeWidth={1.5} aria-hidden="true" />,
      run: () => toggleTheme(),
    },
    {
      id: 'add-source',
      label: 'Add source',
      hint: 'open wizard',
      icon: <Plus size={14} strokeWidth={1.5} aria-hidden="true" />,
      run: () => void navigate({ to: '/sources' }),
    },
    {
      id: 'status-page',
      label: 'Open status page',
      hint: `status.acme.dev/${statusSlug}`,
      icon: <Globe size={14} strokeWidth={1.5} aria-hidden="true" />,
      run: () => void navigate({ to: '/status/$slug', params: { slug: statusSlug } }),
    },
    {
      id: 'density',
      label: density === 'compact' ? 'Comfortable density' : 'Compact density',
      hint: `switch to ${density === 'compact' ? 'comfortable' : 'compact'}`,
      icon: <Rows3 size={14} strokeWidth={1.5} aria-hidden="true" />,
      run: () => setDensity(density === 'compact' ? 'comfortable' : 'compact'),
    },
  ].filter((a) => !term || a.label.toLowerCase().includes(term))

  const hasResults =
    matchedDatasets.length + matchedSources.length + matchedIncidents.length + actions.length > 0

  return (
    <Command shouldFilter={false} className={groupClass} loop>
      <div className="flex items-center gap-2.5 border-b border-hairline px-3">
        <Search size={16} strokeWidth={1.5} className="text-ink-muted" aria-hidden="true" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          autoFocus
          placeholder="Jump to dataset, source, incident… or type > for actions"
          className="h-11 flex-1 bg-transparent font-mono text-[14px] text-ink outline-none placeholder:text-ink-faint"
        />
        <Kbd>esc</Kbd>
      </div>

      <Command.List className="max-h-[360px] overflow-auto p-1.5">
        {!hasResults ? (
          <div className="flex min-h-10 items-center gap-2 px-2.5 text-[13px] text-ink-muted">
            No matches
            <span className="text-ink-faint">Try a table name or &gt;</span>
          </div>
        ) : null}

        {!term && !actionsOnly && recents.length > 0 ? (
          <Command.Group heading="Recent">
            {recents.map((r) => (
              <Command.Item
                key={r.id}
                value={`recent-${r.id}`}
                onSelect={() =>
                  run(() =>
                    void navigate({
                      to: '/datasets/$datasetId',
                      params: { datasetId: r.id },
                      search: { tab: 'timeline', range: '24h' },
                    }),
                  )
                }
                className={itemClass}
              >
                <Zap size={14} strokeWidth={1.5} className="text-ink-muted" aria-hidden="true" />
                <span className="font-mono">{r.key}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        {matchedDatasets.length > 0 ? (
          <Command.Group heading="Datasets">
            {matchedDatasets.map((d) => {
              const Icon = stateMeta[d.state].icon
              return (
                <Command.Item
                  key={d.id}
                  value={`ds-${d.id}`}
                  onSelect={() =>
                    run(() => {
                      pushRecent({ id: d.id, key: d.key })
                      void navigate({
                        to: '/datasets/$datasetId',
                        params: { datasetId: d.id },
                        search: { tab: 'timeline', range: '24h' },
                      })
                    })
                  }
                  className={itemClass}
                >
                  <Icon size={14} strokeWidth={1.8} aria-hidden="true" style={{ color: `var(${stateMeta[d.state].cssVar})` }} />
                  <span className="min-w-0 flex-1 truncate font-mono">{d.key}</span>
                  <span className="text-[11px] text-ink-muted">{d.sourceName}</span>
                </Command.Item>
              )
            })}
          </Command.Group>
        ) : null}

        {matchedSources.length > 0 ? (
          <Command.Group heading="Sources">
            {matchedSources.map((s) => (
              <Command.Item key={s.id} value={`src-${s.id}`} onSelect={() => run(() => void navigate({ to: '/sources' }))} className={itemClass}>
                <Database size={14} strokeWidth={1.5} className="text-ink-muted" aria-hidden="true" />
                <span className="flex-1">{s.name}</span>
                <span className="text-[11px] text-ink-muted">{s.type}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        {matchedIncidents.length > 0 ? (
          <Command.Group heading="Incidents">
            {matchedIncidents.map((i) => {
              const Icon = stateMeta[i.severity].icon
              return (
                <Command.Item
                  key={i.id}
                  value={`inc-${i.id}`}
                  onSelect={() => run(() => void navigate({ to: '/incidents', search: { filter: 'all', incident: i.id } }))}
                  className={itemClass}
                >
                  <Icon size={14} strokeWidth={1.8} aria-hidden="true" style={{ color: `var(${stateMeta[i.severity].cssVar})` }} />
                  <span className="min-w-0 flex-1 truncate">{i.title}</span>
                  <span className="truncate text-[11px] text-ink-muted">{i.datasetKey}</span>
                </Command.Item>
              )
            })}
          </Command.Group>
        ) : null}

        {actions.length > 0 ? (
          <Command.Group heading="Actions">
            {actions.map((a) => (
              <Command.Item key={a.id} value={`act-${a.id}`} onSelect={() => run(a.run)} className={itemClass}>
                <span className="text-ink-muted">{a.icon}</span>
                <span className="flex-1">{a.label}</span>
                <span className="text-[11px] text-ink-muted">{a.hint}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
    </Command>
  )
}

/** Command palette (§3.27 / Screen 9). Built on cmdk inside a Radix Dialog. */
export function CommandPalette(): React.JSX.Element {
  const open = useUiStore((s) => s.paletteOpen)
  const setOpen = useUiStore((s) => s.setPaletteOpen)
  const togglePalette = useUiStore((s) => s.togglePalette)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        togglePalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePalette])

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Portal>
        <Overlay className="fixed inset-0 z-[45] bg-scrim data-[state=open]:animate-[tw-fade_160ms_var(--ease-out)]" />
        <Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-3 z-[45] mx-auto w-[min(560px,100%)] -translate-x-1/2 border border-hairline bg-overlay shadow-lg data-[state=open]:animate-[tw-pop_200ms_var(--ease-out)] md:top-[80px]"
        >
          <Title className="sr-only">Command palette</Title>
          <PaletteBody onClose={() => setOpen(false)} />
          {CORNERS.map((p) => (
            <Corner key={p} position={p} />
          ))}
        </Content>
      </Portal>
    </Root>
  )
}
