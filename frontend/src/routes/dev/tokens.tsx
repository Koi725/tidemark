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
  formatAge,
  formatAgo,
  formatBytes,
  formatCount,
  formatDelta,
  formatPct,
  formatTs,
} from '@/lib/format'
import { DATASET_STATES, severityOrder, stateMeta } from '@/lib/state'
import { durations, easings } from '@/lib/motion'
import { useDensity } from '@/providers/density'
import { useTheme } from '@/providers/theme'
import type { ResolvedTheme } from '@/providers/theme'

export const Route = createFileRoute('/dev/tokens')({
  component: TokensRoute,
})

/* ---- Token catalogues ------------------------------------------------------ */

const SURFACE_TOKENS = ['--tm-bg', '--tm-surface', '--tm-surface-2', '--tm-overlay']
const TEXT_TOKENS = ['--tm-fg', '--tm-fg-muted', '--tm-fg-subtle', '--tm-fg-on-accent']
const LINE_TOKENS = ['--tm-border', '--tm-border-strong']
const ACCENT_TOKENS = [
  '--tm-accent',
  '--tm-accent-fg',
  '--tm-accent-muted',
  '--tm-accent-border',
  '--tm-ring',
]
const STATE_COLOR_TOKENS = [
  '--tm-state-fresh',
  '--tm-state-stale',
  '--tm-state-late',
  '--tm-state-error',
  '--tm-state-unknown',
  '--tm-state-paused',
]

const RADIUS_TOKENS = [
  '--tm-radius-xs',
  '--tm-radius-sm',
  '--tm-radius-md',
  '--tm-radius-lg',
]
const SPACE_TOKENS = [
  '--tm-space-1',
  '--tm-space-2',
  '--tm-space-3',
  '--tm-space-4',
  '--tm-space-6',
  '--tm-space-8',
]
const TEXT_SCALE = [
  '--tm-text-2xs',
  '--tm-text-xs',
  '--tm-text-sm',
  '--tm-text-base',
  '--tm-text-md',
  '--tm-text-lg',
  '--tm-text-xl',
  '--tm-text-2xl',
  '--tm-text-3xl',
]

const BUTTON_VARIANTS: readonly ButtonVariant[] = ['solid', 'outline', 'ghost', 'subtle']
const TAG_VARIANTS: readonly TagVariant[] = ['soft', 'solid', 'outline']

const SAMPLE_NOW = Date.parse('2026-09-13T14:22:35Z')

/* ---- Small presentational helpers ----------------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 font-display text-xs uppercase tracking-[0.14em] text-fg-subtle">
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
        className="size-8 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <code className="text-2xs text-fg-muted">{token}</code>
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="w-40 shrink-0 text-2xs text-fg-muted">{label}</code>
      {children}
    </div>
  )
}

/* ---- The per-theme panel --------------------------------------------------- */

function ThemedPanel({ theme }: { theme: ResolvedTheme }) {
  const [segment, setSegment] = useState('day')
  const [checked, setChecked] = useState(true)

  return (
    <div
      data-theme={theme}
      className="flex-1 rounded-lg border border-border bg-bg p-5 text-fg"
    >
      <h2 className="mb-5 font-display text-lg capitalize">{theme} theme</h2>

      <Section title="Surfaces">
        <SwatchGrid tokens={SURFACE_TOKENS} />
      </Section>
      <Section title="Text">
        <SwatchGrid tokens={TEXT_TOKENS} />
      </Section>
      <Section title="Lines">
        <SwatchGrid tokens={LINE_TOKENS} />
      </Section>
      <Section title="Accent">
        <SwatchGrid tokens={ACCENT_TOKENS} />
      </Section>
      <Section title="State colours">
        <SwatchGrid tokens={STATE_COLOR_TOKENS} />
      </Section>

      <Section title="Radii">
        <div className="flex flex-wrap items-end gap-3">
          {RADIUS_TOKENS.map((token) => (
            <div key={token} className="flex flex-col items-center gap-1">
              <span
                className="size-10 border border-border-strong bg-surface-2"
                style={{ borderRadius: `var(${token})` }}
              />
              <code className="text-2xs text-fg-muted">{token}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing">
        <div className="flex flex-col gap-2">
          {SPACE_TOKENS.map((token) => (
            <Row key={token} label={token}>
              <span
                className="h-3 rounded-sm bg-accent"
                style={{ width: `var(${token})` }}
              />
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="flex flex-col gap-1">
          {TEXT_SCALE.map((token) => (
            <div key={token} className="flex items-baseline gap-3">
              <code className="w-28 shrink-0 text-2xs text-fg-muted">{token}</code>
              <span style={{ fontSize: `var(${token})` }}>Freshness</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion">
        <div className="flex flex-col gap-1 font-mono text-2xs text-fg-muted">
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

      <Section title="Type roles">
        <div className="flex flex-col gap-2">
          <p className="tm-display text-3xl">Display · Barlow Condensed</p>
          <p className="font-sans text-md font-medium">Heading · Barlow Medium</p>
          <p className="font-sans text-base">
            Body copy uses Barlow at the 14px UI baseline for legibility.
          </p>
          <p className="font-mono text-sm tabular-nums">
            Mono · 1234567890 · 09:41:07
          </p>
        </div>
      </Section>

      <Section title="Frame — sizes">
        <div className="flex flex-wrap gap-4">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Frame key={size} size={size} className="grid size-24 place-items-center">
              <span className="text-xs text-fg-muted">{size}</span>
            </Frame>
          ))}
        </div>
      </Section>

      <Section title="Button — variants × sizes">
        <div className="flex flex-col gap-3">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <Button variant={variant} size="sm">
                {variant} sm
              </Button>
              <Button variant={variant} size="md">
                {variant} md
              </Button>
              <Button variant={variant} size="lg">
                {variant} lg
              </Button>
              <Button variant={variant} disabled>
                disabled
              </Button>
              <Button variant={variant} loading>
                loading
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Input — states">
        <div className="grid max-w-md gap-3">
          <Input placeholder="Default" aria-label="Default input" />
          <Input placeholder="Invalid" invalid aria-label="Invalid input" />
          <Input placeholder="Disabled" disabled aria-label="Disabled input" />
          <Input inputSize="sm" placeholder="Small" aria-label="Small input" />
          <Input inputSize="lg" placeholder="Large" aria-label="Large input" />
        </div>
      </Section>

      <Section title="Tag — tones × variants">
        <div className="flex flex-col gap-2">
          {TAG_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              <Tag tone="neutral" variant={variant}>
                neutral
              </Tag>
              <Tag tone="accent" variant={variant}>
                accent
              </Tag>
              {DATASET_STATES.map((state) => (
                <Tag key={state} tone={state} variant={variant}>
                  {state}
                </Tag>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Dataset states (severity order)">
        <div className="flex flex-wrap gap-2">
          {severityOrder.map((state) => {
            const meta = stateMeta[state]
            const Icon = meta.icon
            return (
              <Tag key={state} tone={state} variant="soft">
                <Icon size={13} aria-hidden="true" />
                {meta.label}
              </Tag>
            )
          })}
        </div>
      </Section>

      <Section title="Kbd">
        <div className="flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span className="text-xs text-fg-subtle">to search</span>
        </div>
      </Section>

      <Section title="Switch">
        <div className="flex items-center gap-4">
          <Switch checked={checked} onCheckedChange={setChecked} aria-label="Demo toggle" />
          <Switch defaultChecked aria-label="On" />
          <Switch aria-label="Off" />
          <Switch disabled aria-label="Disabled" />
        </div>
      </Section>

      <Section title="Segmented">
        <Segmented
          ariaLabel="Range"
          value={segment}
          onValueChange={setSegment}
          options={[
            { value: 'hour', label: '1h' },
            { value: 'day', label: '24h' },
            { value: 'week', label: '7d' },
          ]}
        />
      </Section>

      <Section title="Formatters">
        <div className="flex flex-col gap-1 font-mono text-xs tabular-nums text-fg-muted">
          <span>formatAge(185000) → {formatAge(185_000)}</span>
          <span>
            formatAge(185000, {'{'}maxUnits:2{'}'}) → {formatAge(185_000, { maxUnits: 2 })}
          </span>
          <span>
            formatAgo(now-200000) → {formatAgo(SAMPLE_NOW - 200_000, { now: SAMPLE_NOW })}
          </span>
          <span>formatCount(1234000) → {formatCount(1_234_000)}</span>
          <span>formatBytes(1536) → {formatBytes(1536)}</span>
          <span>formatPct(0.042) → {formatPct(0.042)}</span>
          <span>formatDelta(-1200) → {formatDelta(-1200)}</span>
          <span>formatTs(now) → {formatTs(SAMPLE_NOW, { utc: true, seconds: true })}</span>
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
    <main className="min-h-svh bg-bg px-6 py-8 text-fg">
      <header className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="tm-display text-2xl">tidemark · tokens</h1>
          <p className="text-sm text-fg-muted">
            Acceptance surface — every token, type role and primitive, both themes.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-fg-muted">
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
