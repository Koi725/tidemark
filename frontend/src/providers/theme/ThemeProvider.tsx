import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from './context'
import type { ResolvedTheme, ThemeContextValue, ThemeMode } from './types'

const STORAGE_KEY = 'tm.ui.theme'
const MODES: readonly ThemeMode[] = ['light', 'dark', 'system']
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (MODES as readonly string[]).includes(stored)) {
      return stored as ThemeMode
    }
  } catch {
    /* localStorage unavailable (private mode / SSR) */
  }
  return 'system'
}

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark'
  }
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function resolve(mode: ThemeMode, system: ResolvedTheme): ResolvedTheme {
  return mode === 'system' ? system : mode
}

export function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)
  const theme = resolve(mode, system)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mq = window.matchMedia(DARK_QUERY)
    const onChange = (): void => setSystem(mq.matches ? 'dark' : 'light')
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setMode = useCallback((next: ThemeMode): void => {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage unavailable */
    }
  }, [])

  const toggle = useCallback((): void => {
    setMode(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setMode])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, theme, setMode, toggle }),
    [mode, theme, setMode, toggle],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
