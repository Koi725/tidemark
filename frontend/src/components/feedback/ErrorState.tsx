import { OctagonAlert } from 'lucide-react'
import { Button } from '@/components/primitives'
import { cn } from '@/lib/cn'

export interface ErrorStateProps {
  headline: string
  /** Raw driver/transport message + endpoint + probe trailer (§3.26). */
  raw: string
  onRetry?: () => void
  variant?: 'inline' | 'block' | 'page'
  retrying?: boolean
  /** Count of consecutive failures — 3 flips the retry label (§3.26). */
  failures?: number
  onOpenSettings?: () => void
  className?: string
}

/**
 * Error surface (§3.26): headline + retry, and a keyboard-native <details> with
 * the raw error in a sunken mono well. role="alert" on mount.
 */
export function ErrorState({
  headline,
  raw,
  onRetry,
  variant = 'block',
  retrying = false,
  failures = 0,
  onOpenSettings,
  className,
}: ErrorStateProps): React.JSX.Element {
  const exhausted = failures >= 3
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-2 border border-alert-border p-3.5 text-body-sm',
        variant === 'page' && 'items-center p-12 text-center',
        className,
      )}
    >
      <div className="flex w-full items-center gap-2">
        <OctagonAlert size={14} strokeWidth={1.8} className="shrink-0 text-alert" aria-hidden="true" />
        <strong className="font-medium text-ink">{headline}</strong>
        {onRetry ? (
          <span className="ml-auto flex items-center gap-2">
            {exhausted && onOpenSettings ? (
              <Button variant="secondary" onClick={onOpenSettings}>
                Open settings
              </Button>
            ) : null}
            <Button variant="ghost" onClick={onRetry} loading={retrying}>
              {retrying ? 'Retrying…' : exhausted ? 'Retry (3 failed)' : 'Retry'}
            </Button>
          </span>
        ) : null}
      </div>
      <details className="w-full">
        <summary className="cursor-pointer text-caption text-ink-muted">Raw error</summary>
        <pre className="mt-2 overflow-auto whitespace-pre-wrap border border-hairline bg-sunken p-2.5 font-mono text-mono-xs text-ink-2">
          {raw}
        </pre>
      </details>
    </div>
  )
}
