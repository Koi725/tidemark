import type { InputHTMLAttributes } from 'react'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Apply the invalid styling and set aria-invalid. */
  invalid?: boolean
  /** Render the value in the mono face (hosts, DSNs, durations, numbers). */
  mono?: boolean
}
