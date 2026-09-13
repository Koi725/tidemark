import type { ComponentType } from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { Route } from '@/routes/dev/tokens'
import { DensityProvider } from '@/providers/density'
import { ThemeProvider } from '@/providers/theme'

// The route renders both the dark and light panels simultaneously, so a single
// axe pass exercises both themes (spec §8.4 definition of done).
const TokensPage = Route.options.component as ComponentType

describe('/dev/tokens accessibility', () => {
  it('reports no axe violations across both themes', async () => {
    const { container } = render(
      <ThemeProvider>
        <DensityProvider>
          <TokensPage />
        </DensityProvider>
      </ThemeProvider>,
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
