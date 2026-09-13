import type { ElementType, HTMLAttributes } from 'react'
import type { CornerPosition } from '@/components/primitives/Corner'

export type FrameSize = 'sm' | 'md' | 'lg'

export interface FrameProps extends HTMLAttributes<HTMLElement> {
  /** Controls corner-mark length via the --tm-corner-len token. Default 'md'. */
  size?: FrameSize
  /** Element to render. Default 'div'. */
  as?: ElementType
  /** Render corner marks. Default true. */
  showCorners?: boolean
  /** Which corners to mark. Default all four. */
  corners?: readonly CornerPosition[]
}
