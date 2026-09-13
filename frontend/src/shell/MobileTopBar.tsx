import { Moon, Search, Sun } from 'lucide-react'
import { TidemarkMark } from '@/components/brand/TidemarkMark'
import { Button } from '@/components/primitives'
import { useTheme } from '@/providers/theme'

export interface MobileTopBarProps {
  title: string
}

/** Mobile top bar (§2): 52px — logo + screen title + search + theme, 44×44 targets. */
export function MobileTopBar({ title }: MobileTopBarProps): React.JSX.Element {
  const { theme, toggle } = useTheme()
  return (
    <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-hairline px-3 lg:hidden">
      <TidemarkMark size={22} className="shrink-0 text-tide" />
      <span className="min-w-0 flex-1 truncate font-display text-h3 text-ink">{title}</span>
      <Button variant="icon" aria-label="Search">
        <Search size={18} strokeWidth={1.5} aria-hidden="true" />
      </Button>
      <Button
        variant="icon"
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={toggle}
      >
        {theme === 'dark' ? (
          <Sun size={18} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Moon size={18} strokeWidth={1.5} aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}
