import { Provider, Root, Trigger, Portal, Content } from '@radix-ui/react-tooltip'
import { cn } from '@/lib/cn'

export type DayState = 'ok' | 'warn' | 'alert' | 'none'

export interface StripDay {
  date: string
  state: DayState
  freshPct: number
}

export interface NinetyDayBarStripProps {
  /** Length 90 (oldest first). Partial history left-pads with no-data cells. */
  days: StripDay[]
  size?: 'lg' | 'sm'
  /** Accessible key name for the aria-label summary. */
  label: string
  className?: string
}

const CELL_BG: Record<DayState, string> = {
  ok: 'var(--tm-ok-fg)',
  warn: 'var(--tm-warn-fg)',
  alert: 'var(--tm-alert-fg)',
  none: 'var(--tm-unknown-bg)',
}

/** Public-page / status-preview history strip (§3.13). Hand-rolled (§9). */
export function NinetyDayBarStrip({
  days,
  size = 'lg',
  label,
  className,
}: NinetyDayBarStripProps): React.JSX.Element {
  const fresh = days.filter((d) => d.state === 'ok').length
  const degraded = days.filter((d) => d.state === 'warn').length
  const stale = days.filter((d) => d.state === 'alert').length

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Provider delayDuration={80}>
        <div
          role="img"
          aria-label={`90 day freshness history for ${label}: ${fresh} fresh days, ${degraded} degraded, ${stale} stale`}
          className={cn('flex w-full', size === 'lg' ? 'h-[26px] gap-[2px]' : 'h-[14px] gap-px')}
        >
          {days.map((day, i) => (
            <Root key={`${day.date}-${i}`}>
              <Trigger asChild>
                <div
                  aria-hidden="true"
                  className="h-full flex-1"
                  style={{ background: CELL_BG[day.state] }}
                />
              </Trigger>
              <Portal>
                <Content
                  sideOffset={6}
                  className="z-50 border border-hairline bg-overlay px-2 py-1 font-mono text-mono-sm text-ink shadow-md"
                >
                  {day.date} · {day.state === 'none' ? 'no data' : day.state}
                </Content>
              </Portal>
            </Root>
          ))}
        </div>
      </Provider>
      <div className="flex justify-between text-caption text-ink-muted">
        <span>90 days ago</span>
        <span>today</span>
      </div>
    </div>
  )
}
