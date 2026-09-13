import type { ComponentPropsWithoutRef } from 'react'
// `Root` is imported as a value purely so `typeof` can derive its prop types.
import { Root } from '@radix-ui/react-switch'

export type SwitchProps = ComponentPropsWithoutRef<typeof Root>
