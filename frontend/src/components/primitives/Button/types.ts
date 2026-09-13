import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'subtle'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Show a spinner and mark the control busy + disabled. */
  loading?: boolean
  /** Optional leading adornment (e.g. an icon). */
  startSlot?: ReactNode
  /** Optional trailing adornment. */
  endSlot?: ReactNode
}
