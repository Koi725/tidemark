import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Frame } from './Frame'

describe('Frame', () => {
  it('renders four corner marks at every size', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container, unmount } = render(<Frame size={size} />)
      expect(container.querySelector(`.tm-frame--${size}`)).not.toBeNull()
      expect(container.querySelectorAll('.tm-corner')).toHaveLength(4)
      for (const position of ['tl', 'tr', 'bl', 'br']) {
        expect(container.querySelector(`.tm-corner--${position}`)).not.toBeNull()
      }
      unmount()
    }
  })

  it('can hide corners', () => {
    const { container } = render(<Frame showCorners={false} />)
    expect(container.querySelectorAll('.tm-corner')).toHaveLength(0)
  })

  it('renders a subset of corners', () => {
    const { container } = render(<Frame corners={['tl', 'br']} />)
    expect(container.querySelectorAll('.tm-corner')).toHaveLength(2)
    expect(container.querySelector('.tm-corner--tl')).not.toBeNull()
    expect(container.querySelector('.tm-corner--br')).not.toBeNull()
  })
})
