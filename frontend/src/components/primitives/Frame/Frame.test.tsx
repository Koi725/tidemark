import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Frame } from './Frame'

// The `+` registration marks are rendered as decorative <i> elements carrying the
// crossed-stroke before/after pseudo-classes (§3.0).
const cornerSelector = 'i.size-\\[7px\\]'

describe('Frame (§3.0)', () => {
  it('always renders four corner registration marks', () => {
    const { container } = render(<Frame />)
    expect(container.querySelectorAll(cornerSelector)).toHaveLength(4)
  })

  it('renders as a button and stays square + transparent by default', () => {
    const { container } = render(<Frame as="button" type="button" />)
    const el = container.querySelector('button')
    expect(el).not.toBeNull()
    expect(el?.className).toContain('bg-transparent')
    expect(el?.className).not.toContain('rounded')
  })

  it('accent-fills only when asked (primary button exception)', () => {
    const { container } = render(<Frame filled />)
    expect(container.firstElementChild?.className).toContain('bg-tide')
  })
})
