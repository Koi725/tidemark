import { useState } from 'react'
import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Button,
  Frame,
  Input,
  Kbd,
  Segmented,
  Switch,
  Tag,
} from '@/components/primitives'
import type { ButtonVariant, TagVariant } from '@/components/primitives'
import {
  EMPTY,
  formatAge,
  formatBytes,
  formatCount,
  formatDelta,
  formatLag,
  formatPct,
  formatSnapshot,
} from '@/lib/format'
import { severityOrder, stateMeta } from '@/lib/state'
import { durations, easings } from '@/lib/motion'
import { useDensity } from '@/providers/density'
import { useTheme } from '@/providers/theme'
import type { ResolvedTheme } from '@/providers/theme'

export const Route = createFileRoute('/dev/tokens')({
  component: TokensRoute,
})

/* ---- Token catalogues (corrected §1.1 names) ------------------------------- */

const SURFACE_TOKENS = [
  '--tm-bg-canvas',
  '--tm-bg-sunken',
  '--tm-bg-raised',
  '--tm-bg-overlay',
  '--tm-bg-faint',
  '--tm-bg-fainter',
]
const TEXT_TOKENS = [
  '--tm-text-primary',
  '--tm-text-secondary',
  '--tm-text-muted',
  '--tm-text-faint',
  '--tm-text-inverse',
]
const LINE_TOKENS = ['--tm-border-hairline', '--tm-border-strong']
const ACCENT_TOKENS = [
  '--tm-accent-100',
  '--tm-accent-200',
  '--tm-accent-300',
  '--tm-accent-400',
  '--tm-accent-500',
  '--tm-accent-600',
  '--tm-accent-700',
  '--tm-accent-800',
  '--tm-accent-900',
  '--tm-accent',
  '--tm-accent-hover',
  '--tm-accent-pressed',
]
const STATUS_TOKENS = [
  '--tm-ok-fg',
  '--tm-warn-fg',
  '--tm-alert-fg',
  '--tm-unknown-fg',
  '--tm-paused-fg',
]
const NEUTRAL_TOKENS = [
  '--tm-neutral-100',
  '--tm-neutral-200',
  '--tm-neutral-300',
  '--tm-neutral-400',
  '--tm-neutral-500',
  '--tm-neutral-600',
  '--tm-neutral-700',
  '--tm-neutral-800',
  '--tm-neutral-900',
]

const RADIUS_TOKENS: ReadonlyArray<[string, string]> = [
  ['none', 'var(--radius-none)'],
  ['sm', 'var(--radius-sm)'],
  ['md', 'var(--radius-md)'],
  ['lg', 'var(--radius-lg)'],
]

const TYPE_ROLES: ReadonlyArray<[string, string]> = [
  ['display', 'text-display font-display'],
  ['h1', 'text-h1 font-display'],
  ['h2', 'text-h2 font-display'],
  ['h3', 'text-h3 font-display'],
  ['h4', 'text-h4 font-display'],
  ['body', 'text-body'],
  ['body-sm', 'text-body-sm'],
  ['caption', 'text-caption'],
  ['label', 'text-label font-display uppercase tracking-[.1em]'],
  ['metric', 'text-metric font-mono'],
  ['metric-lg', 'text-metric-lg font-mono'],
  ['mono', 'text-mono font-mono'],
  ['mono-sm', 'text-mono-sm font-mono'],
  ['mono-xs', 'text-mono-xs font-mono'],
]

const BUTTON_VARIANTS: readonly ButtonVariant[] = [
  'primary',
  'secondary',
  'ghost',
  'destructive',
]
const TAG_VARIANTS: readonly TagVariant[] = ['accent', 'neutral', 'outline']

const SAMPLE = Date.parse('2026-09-13T14:22:35Z')
const iso = (msAgo: number): string => new Date(SAMPLE - msAgo).toISOString()

/* ---- Presentational helpers ----------------------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 font-display text-label uppercase tracking-[.1em] text-ink-faint">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Swatch({ token }: { token: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-8 shrink-0 border border-hairline"
        style={{ backgroundColor: `var(${token})` }}
      />
      <code className="font-mono text-mono-xs text-ink-muted">{token}</code>
    </div>
  )
}

function SwatchGrid({ tokens }: { tokens: readonly string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tokens.map((token) => (
        <Swatch key={token} token={token} />
      ))}
    </div>
  )
}

/* ---- The per-theme panel --------------------------------------------------- */

function ThemedPanel({ theme }: { theme: ResolvedTheme }) {
  const [segment, setSegment] = useState('24h')
  const [checked, setChecked] = useState(true)

  return (
    <div data-theme={theme} className="flex-1 border border-hairline bg-canvas p-5 text-ink">
      <h2 className="mb-5 font-display text-h2 capitalize">{theme} theme</h2>

      <Section title="Surfaces">
        <SwatchGrid tokens={SURFACE_TOKENS} />
      </Section>
      <Section title="Text">
        <SwatchGrid tokens={TEXT_TOKENS} />
      </Section>
      <Section title="Lines">
        <SwatchGrid tokens={LINE_TOKENS} />
      </Section>
      <Section title="Accent ramp — tide">
        <SwatchGrid tokens={ACCENT_TOKENS} />
      </Section>
      <Section title="Status">
        <SwatchGrid tokens={STATUS_TOKENS} />
      </Section>
      <Section title="Neutral ramp">
        <SwatchGrid tokens={NEUTRAL_TOKENS} />
      </Section>

      <Section title="Radius">
        <div className="flex flex-wrap items-end gap-4">
          {RADIUS_TOKENS.map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <span
                className="size-10 border border-strong bg-faint"
                style={{ borderRadius: value }}
              />
              <code className="font-mono text-mono-xs text-ink-muted">{name}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="flex flex-col gap-2">
          {TYPE_ROLES.map(([name, cls]) => (
            <div key={name} className="flex items-baseline gap-3">
              <code className="w-24 shrink-0 font-mono text-mono-xs text-ink-muted">
                {name}
              </code>
              <span className={cls}>Freshness 1,284</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion">
        <div className="flex flex-col gap-1 font-mono text-mono-xs text-ink-muted">
          {Object.entries(durations).map(([name, value]) => (
            <span key={name}>
              duration.{name} = {value}ms
            </span>
          ))}
          {Object.entries(easings).map(([name, value]) => (
            <span key={name}>
              ease.{name} = {value}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Dataset states (§6.1, severity order)">
        <div className="flex flex-wrap gap-2">
          {severityOrder.map((state) => {
            const meta = stateMeta[state]
            const Icon = meta.icon
            return (
              <span
                key={state}
                className="inline-flex items-center gap-1 rounded-md border px-[7px] py-[2px] text-[11px] font-medium tracking-[.04em]"
                style={{
                  color: `var(${meta.cssVar})`,
                  background: `var(--tm-${state}-bg)`,
                  borderColor: `var(--tm-${state}-border)`,
                }}
              >
                <Icon size={12} strokeWidth={1.8} aria-hidden="true" />
                {meta.label}
              </span>
            )
          })}
        </div>
      </Section>

      <Section title="Frame — elevation + interactive">
        <div className="flex flex-wrap gap-5">
          {(['none', 'sm', 'md', 'lg'] as const).map((elevation) => (
            <Frame
              key={elevation}
              elevation={elevation}
              className="grid size-24 place-items-center"
            >
              <span className="text-caption text-ink-muted">{elevation}</span>
            </Frame>
          ))}
          <Frame interactive className="grid size-24 place-items-center">
            <span className="text-caption text-ink-muted">hover</span>
          </Frame>
        </div>
      </Section>

      <Section title="Button — variants">
        <div className="flex flex-wrap items-center gap-3">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
          <Button variant="secondary" loading>
            Probing…
          </Button>
          <Button variant="secondary" disabled>
            disabled
          </Button>
        </div>
      </Section>

      <Section title="Input">
        <div className="grid max-w-md gap-3">
          <Input placeholder="Default" aria-label="Default input" />
          <Input mono placeholder="postgres://…" aria-label="Mono input" />
          <Input invalid placeholder="Invalid" aria-label="Invalid input" />
          <Input disabled placeholder="Disabled" aria-label="Disabled input" />
        </div>
      </Section>

      <Section title="Tag / Kbd">
        <div className="flex flex-wrap items-center gap-2">
          {TAG_VARIANTS.map((variant) => (
            <Tag key={variant} variant={variant}>
              {variant}
            </Tag>
          ))}
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </div>
      </Section>

      <Section title="Switch / Segmented">
        <div className="flex flex-wrap items-center gap-5">
          <Switch checked={checked} onCheckedChange={setChecked} aria-label="Demo toggle" />
          <Segmented
            ariaLabel="Range"
            value={segment}
            onValueChange={setSegment}
            options={[
              { value: '1h', label: '1h' },
              { value: '24h', label: '24h' },
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
            ]}
          />
        </div>
      </Section>

      <Section title="Formatters (§6)">
        <div className="flex flex-col gap-1 font-mono text-mono-sm text-ink-muted">
          <span>formatAge(31m 4s) → {formatAge(iso(1_864_000), { now: SAMPLE })}</span>
          <span>formatAge(null) → {formatAge(null)}</span>
          <span>formatCount(1284310) → {formatCount(1_284_310)}</span>
          <span>formatCount(18.2M) → {formatCount(18_200_000)}</span>
          <span>formatBytes(3.1MiB) → {formatBytes(3_250_585)}</span>
          <span>formatPct(99.2 uptime) → {formatPct(99.2, { uptime: true })}</span>
          <span>
            formatDelta(−78%) →{' '}
            {formatDelta(-78, { format: (v) => formatPct(v) })}
          </span>
          <span>formatLag(1.2M) → {formatLag(1_200_000)}</span>
          <span>formatSnapshot → {formatSnapshot(SAMPLE, { utc: true })}</span>
          <span>EMPTY → {EMPTY}</span>
        </div>
      </Section>
    </div>
  )
}

/* ---- Route ----------------------------------------------------------------- */

function TokensRoute() {
  const { mode, setMode } = useTheme()
  const { density, toggle: toggleDensity } = useDensity()

  return (
    <main className="min-h-svh bg-canvas px-6 py-8 text-ink">
      <header className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h1">tidemark · tokens</h1>
          <p className="text-body-sm text-ink-muted">
            Acceptance surface — every token, type role and primitive, both themes.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-caption text-ink-muted">
            Compact
            <Switch
              checked={density === 'compact'}
              onCheckedChange={toggleDensity}
              aria-label="Toggle compact density"
            />
          </label>
          <Segmented
            ariaLabel="Theme mode"
            value={mode}
            onValueChange={(next) => setMode(next as 'light' | 'dark' | 'system')}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <ThemedPanel theme="dark" />
        <ThemedPanel theme="light" />
      </div>
    </main>
  )
}
