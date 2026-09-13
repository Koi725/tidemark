import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Frame, Button, Corner } from '@/components/primitives'
import { TidemarkMark } from '@/components/brand/TidemarkMark'
import { NinetyDayBarStrip } from '@/components/data/NinetyDayBarStrip'
import { BadgeSvg } from '@/components/data/BadgeSvg'
import { notify } from '@/components/feedback/notify'
import { useNow } from '@/lib/clock'
import { formatAgo, formatPct } from '@/lib/format'
import { stateMeta, worstState } from '@/lib/state'
import type { DatasetState } from '@/lib/state'
import { usePublicStatus } from '@/features/statusPage'
import type { PublicDataset, PublicStatus, PublicTheme } from '@/contracts'

export const Route = createFileRoute('/status/$slug')({
  component: PublicStatusRoute,
})

const EMBED_SNIPPET = '<iframe src="https://status.acme.dev/embed?theme=auto" height="480"></iframe>'

function resolveTheme(theme: PublicTheme): 'dark' | 'light' {
  if (theme !== 'auto') return theme
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

const BANNER: Record<
  DatasetState,
  (status: PublicStatus) => { title: string; sub: string }
> = {
  ok: (s) => ({ title: 'All datasets fresh', sub: `${s.datasets.length} datasets within their freshness windows` }),
  warn: (s) => ({
    title: 'Some datasets degraded',
    sub: `${s.datasets.filter((d) => d.state === 'warn').length} warning · rest fresh`,
  }),
  alert: (s) => ({
    title: 'Data incident in progress',
    sub: `${s.datasets.filter((d) => d.state === 'alert').map((d) => d.shortName).join(', ')} stale — team notified`,
  }),
  unknown: () => ({ title: 'Status unknown', sub: "tidemark hasn't probed these yet" }),
  paused: () => ({ title: 'Status unknown', sub: "tidemark hasn't probed these yet" }),
}

function badgeValue(d: PublicDataset, now: number): string {
  if (d.state === 'unknown' || d.lastRowAt === null) return 'unknown'
  const age = formatAgo(d.lastRowAt, { now }).replace(' ago', '')
  return d.state === 'ok' ? `fresh ${age}` : `stale ${age}`
}

function PublicStatusRoute() {
  const { slug } = Route.useParams()
  const now = useNow()
  const statusQuery = usePublicStatus(slug)
  const status = statusQuery.data ?? null
  const [theme, setTheme] = useState<'dark' | 'light'>(() => resolveTheme(status?.theme ?? 'dark'))

  useEffect(() => {
    if (!status || status.theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => setTheme(mq.matches ? 'dark' : 'light')
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [status])

  // Still loading — bare centered placeholder (no shell, no chrome).
  if (statusQuery.isPending) {
    return <div data-theme={theme} className="min-h-svh bg-canvas" aria-busy="true" />
  }

  // Unknown slug → bare centered page, no nav, no login link (§7b edge).
  if (!status) {
    return (
      <div data-theme={theme} className="grid min-h-svh place-items-center bg-canvas px-6 text-ink">
        <Frame className="flex max-w-[420px] flex-col gap-2 p-8 text-center">
          <h1 className="font-display text-h2 text-ink">No status page here</h1>
          <p className="text-body-sm text-ink-muted">The link may be wrong, or the page was unpublished.</p>
          {(['tl', 'tr', 'bl', 'br'] as const).map((p) => (
            <Corner key={p} position={p} />
          ))}
        </Frame>
      </div>
    )
  }

  const worst = worstState(status.datasets.map((d) => d.state))
  const banner = BANNER[worst](status)
  const BannerIcon = stateMeta[worst].icon

  const copyEmbed = (): void => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(EMBED_SNIPPET)
    notify('info', 'Embed snippet copied')
  }

  return (
    <div data-theme={theme} className="min-h-svh bg-canvas text-ink">
      <div className="mx-auto max-w-[880px] px-4 pb-20 pt-8 md:px-[var(--tm-pad)] md:pt-12">
        <div className="mb-6 flex items-center gap-2.5">
          <TidemarkMark size={24} className="text-tide" />
          <h2 className="font-display text-h2 text-ink max-[390px]:text-[20px]">{status.title}</h2>
        </div>

        <Frame className="mb-8 flex items-center gap-3 p-[var(--tm-pad)]">
          <BannerIcon size={22} strokeWidth={1.8} aria-hidden="true" style={{ color: `var(${stateMeta[worst].cssVar})` }} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-h3 text-ink max-[390px]:text-[17px]">{banner.title}</div>
            <div className="text-body-sm text-ink-muted">{banner.sub}</div>
          </div>
          <span className="whitespace-nowrap font-mono text-mono-sm text-ink-muted">
            updated {formatAgo(status.updatedAt, { now })}
          </span>
        </Frame>

        <div className="flex flex-col gap-6">
          {status.datasets.map((d) => {
            const Icon = stateMeta[d.state].icon
            return (
              <div key={d.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" style={{ color: `var(${stateMeta[d.state].cssVar})` }} />
                  <span className="min-w-0 flex-1 truncate font-mono text-mono text-ink">{d.key}</span>
                  <span className="text-caption text-ink-muted">
                    {stateMeta[d.state].label}
                  </span>
                  <span className="w-full text-caption text-ink-muted sm:ml-auto sm:w-auto">
                    {formatPct(d.uptimePct, { uptime: true })} fresh · 90 days
                  </span>
                </div>
                <NinetyDayBarStrip days={d.days} size="lg" label={d.key} />
              </div>
            )
          })}
        </div>

        {status.showIncidents && status.recentIncidents.length > 0 ? (
          <section className="mt-8 flex flex-col gap-2">
            <h3 className="font-display text-h3 text-ink">Recent incidents</h3>
            <div className="border border-hairline">
              {status.recentIncidents.map((i, idx) => (
                <div key={idx} className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-hairline px-3 py-2 font-mono text-mono-sm text-ink-muted last:border-b-0">
                  <span>{i.date}</span>
                  <span className="truncate text-ink">{i.title}</span>
                  <span>{i.duration}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-8 grid gap-[var(--tm-gap)] lg:grid-cols-2">
          <Frame className="flex flex-col gap-3 p-[var(--tm-pad)]">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Badge</span>
            <div className="flex flex-wrap gap-3">
              {status.datasets.slice(0, 2).map((d) => (
                <BadgeSvg key={d.id} label={d.shortName} value={badgeValue(d, now)} state={d.state} />
              ))}
            </div>
            <code className="break-all font-mono text-mono-xs text-ink-muted">
              https://status.acme.dev/badge/{status.datasets[0]?.shortName ?? 'orders'}.svg
            </code>
          </Frame>

          <Frame className="flex flex-col gap-3 p-[var(--tm-pad)]">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Embed</span>
            <code className="break-all border border-hairline bg-sunken p-2.5 font-mono text-mono-xs text-ink-2">
              {EMBED_SNIPPET}
            </code>
            <Button variant="secondary" className="w-fit" onClick={copyEmbed}>
              Copy
            </Button>
          </Frame>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4 text-caption text-ink-muted">
          <span>Powered by tidemark · open source</span>
          <span>No cookies. No tracking.</span>
        </footer>
      </div>
    </div>
  )
}
