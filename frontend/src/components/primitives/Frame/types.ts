import type { ElementType, HTMLAttributes } from 'react'

export type FrameAs = 'div' | 'button' | 'a' | 'aside' | 'section'
export type FrameElevation = 'none' | 'sm' | 'md' | 'lg'

export interface FrameProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default 'div'. */
  as?: FrameAs | ElementType
  /** Adds hover wash + strong border on pointer devices. */
  interactive?: boolean
  /** Accent fill — the primary button is the single exception to "no surface fill". */
  filled?: boolean
  /** Drop shadow token. Default 'none'. */
  elevation?: FrameElevation
  /** Anchor href when as="a". */
  href?: string
  /** Button type when as="button". */
  type?: 'button' | 'submit' | 'reset'
  /** Disabled flag when as="button". */
  disabled?: boolean
}
