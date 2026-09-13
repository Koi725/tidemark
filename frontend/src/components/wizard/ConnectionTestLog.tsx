import { useEffect, useRef } from 'react'
import { CircleCheck, OctagonAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { LogLine, LogTone, TestStatus } from './testLines'

export type { LogLine, LogTone, TestStatus }

export interface ConnectionTestLogProps {
  lines: LogLine[]
  status: TestStatus
  rawError?: string
}

const TONE_CLASS: Record<LogTone, string> = {
  normal: 'text-ink',
  ok: 'text-ok',
  warn: 'text-warn',
  alert: 'text-alert',
}

/** Live output of "Test connection" — the product's trust moment (§3.19). */
export function ConnectionTestLog({ lines, status, rawError }: ConnectionTestLogProps): React.JSX.Element {
  const preRef = useRef<HTMLPreElement>(null)
  const pinnedRef = useRef(true)

  useEffect(() => {
    const el = preRef.current
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight
  }, [lines])

  const onScroll = (): void => {
    const el = preRef.current
    if (!el) return
    pinnedRef.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-body-sm">
        {status === 'running' ? (
          <span className="animate-[tw-blink_1s_steps(1,end)_infinite] text-ink-muted">running…</span>
        ) : status === 'ok' ? (
          <span className="flex items-center gap-1.5 text-ok">
            <CircleCheck size={16} strokeWidth={1.8} aria-hidden="true" /> connected · read-only verified
          </span>
        ) : status === 'failed' ? (
          <span className="flex items-center gap-1.5 text-alert">
            <OctagonAlert size={16} strokeWidth={1.8} aria-hidden="true" /> connection failed
          </span>
        ) : (
          <span className="text-ink-muted">idle</span>
        )}
      </div>

      <pre
        ref={preRef}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
        className="m-0 max-h-[240px] min-h-[160px] overflow-auto border border-hairline bg-sunken p-3.5 font-mono text-mono-sm whitespace-pre-wrap"
      >
        {lines.map((line, i) => (
          <div key={i} className="animate-[tw-fade_160ms_var(--ease-out)]">
            <span className="inline-block w-[7ch] text-right text-ink-muted">{`+${String(line.ms).padStart(3, ' ')}ms`}</span>
            {'  '}
            <span className={cn(TONE_CLASS[line.tone])}>{line.text}</span>
          </div>
        ))}
      </pre>

      {status === 'failed' && rawError ? (
        <details>
          <summary className="cursor-pointer text-caption text-ink-muted">Raw error</summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap border border-hairline bg-sunken p-2.5 font-mono text-mono-xs text-ink-2">
            {rawError}
          </pre>
        </details>
      ) : null}
    </div>
  )
}
