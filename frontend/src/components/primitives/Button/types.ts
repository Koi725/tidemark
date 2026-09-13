import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Show a blinking ● and mark the control busy + disabled (never a spinner). */
  loading?: boolean
  /** Optional leading adornment (e.g. an icon). */
  startSlot?: ReactNode
  /** Optional trailing adornment. */
  endSlot?: ReactNode
}
