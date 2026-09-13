import type { HTMLAttributes } from 'react'
import type { DatasetState } from '@/lib/state'

export type TagTone = 'neutral' | 'accent' | DatasetState
export type TagVariant = 'soft' | 'solid' | 'outline'
export type TagSize = 'sm' | 'md'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone
  variant?: TagVariant
  size?: TagSize
}
