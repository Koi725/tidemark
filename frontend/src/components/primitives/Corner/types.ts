import type { HTMLAttributes } from 'react'

export type CornerPosition = 'tl' | 'tr' | 'bl' | 'br'

export interface CornerProps extends HTMLAttributes<HTMLElement> {
  position: CornerPosition
}
