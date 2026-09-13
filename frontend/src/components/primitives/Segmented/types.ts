import type { ReactNode } from 'react'

export type SegmentedSize = 'sm' | 'md'

export interface SegmentedOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  /** Accessible label when `label` is icon-only. */
  ariaLabel?: string
}

export interface SegmentedProps {
  options: readonly SegmentedOption[]
  value: string
  onValueChange: (value: string) => void
  size?: SegmentedSize
  disabled?: boolean
  className?: string
  ariaLabel?: string
}
