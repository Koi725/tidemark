import { useEffect, useRef, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button, Frame } from '@/components/primitives'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SourceIcon } from '@/components/status/SourceIcon'
import { notify } from '@/components/feedback/notify'
import { cn } from '@/lib/cn'
import { useNow } from '@/lib/clock'
import { formatAgo } from '@/lib/format'
import type { Notifier } from '@/mocks'

export interface NotifierCardProps {
  notifier: Notifier
  onEdit: (notifier: Notifier) => void
}

type TestState = 'idle' | 'sending' | 'sent' | 'failed'

const RAW_FAIL =
  'transport error: 401 Unauthorized from https://discord.com/api/webhooks/…\nlast 3 attempts failed\nnext_retry=manual'

/** One configured notifier (§3.8) with all test states. */
export function NotifierCard({ notifier, onEdit }: NotifierCardProps): React.JSX.Element {
  const now = useNow()
  const [test, setTest] = useState<TestState>('idle')
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t)
    },
    [],
  )

  const runTest = (): void => {
    setTest('sending')
    timers.current.push(
      window.setTimeout(() => {
        if (notifier.failing) {
          setTest('failed')
          notify('alert', `Test to ${notifier.kind} failed`)
        } else {
          setTest('sent')
          notify('ok', `Test delivered to ${notifier.kind} · 212ms`)
          timers.current.push(window.setTimeout(() => setTest('idle'), 2600))
        }
      }, 1000),
    )
  }

  const meta = notifier.failing
    ? 'last 3 sends failed'
    : notifier.lastSentAt === null
      ? 'last sent never · 0 events / 7d'
      : `last sent ${formatAgo(notifier.lastSentAt, { now })} · ${notifier.events7d} events / 7d`

  return (
    <Frame className="flex min-h-[150px] flex-col gap-[10px] p-[var(--tm-pad)]">
      <div className="flex items-center gap-2.5">
        <SourceIcon code={notifier.code} size={30} decorative />
        <div className="min-w-0">
          <div className="text-body font-medium text-ink">{notifier.name}</div>
          <div className="truncate font-mono text-[11px] text-ink-muted" title={notifier.target}>
            {notifier.target}
          </div>
        </div>
      </div>

      <div className={cn('flex items-center gap-1.5 text-caption', notifier.failing ? 'text-warn' : 'text-ink-muted')}>
        {notifier.failing ? <TriangleAlert size={13} strokeWidth={1.8} aria-hidden="true" /> : null}
        {meta}
      </div>

      {test === 'failed' ? (
        <ErrorState headline="Delivery failed" raw={RAW_FAIL} onRetry={runTest} />
      ) : null}

      <div className="mt-auto flex items-center gap-1.5">
        <Button
          variant="secondary"
          className="flex-1"
          loading={test === 'sending'}
          onClick={runTest}
        >
          {test === 'sending' ? (
            'Sending…'
          ) : test === 'sent' ? (
            <span className="text-ok">Sent ✓</span>
          ) : test === 'failed' ? (
            'Retry'
          ) : (
            'Send test'
          )}
        </Button>
        <Button variant="ghost" onClick={() => onEdit(notifier)}>
          Edit
        </Button>
      </div>
    </Frame>
  )
}
