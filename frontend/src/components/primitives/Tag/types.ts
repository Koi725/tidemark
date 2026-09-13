import type { HTMLAttributes } from 'react'

export type TagVariant = 'accent' | 'neutral' | 'outline'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant
}
