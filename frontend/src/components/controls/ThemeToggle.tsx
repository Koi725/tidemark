import { MonitorCog, Moon, Sun } from 'lucide-react'
import { Segmented } from '@/components/primitives'
import { useTheme } from '@/providers/theme'
import type { ThemeMode } from '@/providers/theme'

/** 3-option theme control (§3.28) — the Settings radiogroup form. */
export function ThemeToggle(): React.JSX.Element {
  const { mode, setMode } = useTheme()
  return (
    <Segmented
      ariaLabel="Theme"
      value={mode}
      onValueChange={(v) => setMode(v as ThemeMode)}
      options={[
        { value: 'dark', label: 'Dark', icon: <Moon size={14} strokeWidth={1.5} aria-hidden="true" /> },
        { value: 'light', label: 'Light', icon: <Sun size={14} strokeWidth={1.5} aria-hidden="true" /> },
        { value: 'system', label: 'System', icon: <MonitorCog size={14} strokeWidth={1.5} aria-hidden="true" /> },
      ]}
    />
  )
}
