import { StatusDot } from '@/components/status/StatusDot'
import { useLiveStatus } from '@/lib/sse'

/**
 * The Overview "live" indicator (§4 Screen 2 / §5.8): connected (tide, pulsing),
 * reconnecting (amber, blinking), or offline (grey, static). Driven by the SSE
 * connection state.
 */
export function LiveIndicator(): React.JSX.Element {
  const status = useLiveStatus()

  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1.5" title="Live · SSE connected">
        <StatusDot state="ok" pulse="live" />
        <span className="sr-only">Live · SSE connected</span>
      </span>
    )
  }
  if (status === 'reconnecting') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-caption text-warn"
        title="Reconnecting…"
      >
        <span
          className="inline-block size-2 rounded-full bg-warn animate-[tw-blink_1s_steps(1,end)_infinite]"
          aria-hidden="true"
        />
        Reconnecting…
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 text-caption text-ink-muted"
      title="Live updates offline — showing last known state"
    >
      <span className="inline-block size-2 rounded-full bg-unknown" aria-hidden="true" />
      Live updates offline
    </span>
  )
}
