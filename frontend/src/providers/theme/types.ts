export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** The user's chosen mode, including the special `system` value. */
  mode: ThemeMode
  /** The concrete theme currently applied to the document. */
  theme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  /** Flip between light and dark (leaves `system`). */
  toggle: () => void
}
