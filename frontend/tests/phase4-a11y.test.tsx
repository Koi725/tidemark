import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { BadgeSvg } from '@/components/data/BadgeSvg'
import { SourceGlyph } from '@/components/brand/SourceGlyph'
import { ThemeToggle } from '@/components/controls/ThemeToggle'
import { DensityToggle } from '@/components/controls/DensityToggle'
import { StatusBadge } from '@/components/status/StatusBadge'
import { StatusDot } from '@/components/status/StatusDot'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Kbd, Tag } from '@/components/primitives'
import { ThemeProvider } from '@/providers/theme'
import { DensityProvider } from '@/providers/density'
import type { ResolvedTheme } from '@/providers/theme'

function Panel({ theme }: { theme: ResolvedTheme }) {
  return (
    <div data-theme={theme} className="bg-canvas p-4 text-ink">
      <ThemeToggle />
      <DensityToggle />
      <StatusBadge state="ok" />
      <StatusBadge state="alert" size="md" />
      <StatusDot state="warn" />
      <Tag variant="accent">gold</Tag>
      <Kbd>⌘K</Kbd>
      <BadgeSvg label="orders" value="fresh 4m" state="ok" />
      <BadgeSvg label="payments" value="stale 31m" state="alert" />
      <SourceGlyph code="PG" />
      <EmptyState title="Calm seas" body="Nothing to see." />
      <ErrorState headline="Probe failed" raw="ECONNREFUSED\nendpoint=x\nprobe_id=1 attempt=1/3 next_retry=5s" />
    </div>
  )
}

describe('Phase 4 components accessibility', () => {
  it('reports no axe violations across both themes', async () => {
    const { container } = render(
      <ThemeProvider>
        <DensityProvider>
          <Panel theme="dark" />
          <Panel theme="light" />
        </DensityProvider>
      </ThemeProvider>,
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
