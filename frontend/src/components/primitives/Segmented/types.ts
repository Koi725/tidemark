import type { ReactNode } from 'react'

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
  disabled?: boolean
  /** Stretch each segment to fill the container (mobile full-width picker). */
  fill?: boolean
  className?: string
  ariaLabel?: string
}
