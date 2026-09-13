import { TideIllustration } from '@/components/brand/TideIllustration'
import { Button } from '@/components/primitives'
import { cn } from '@/lib/cn'

interface Action {
  label: string
  onClick: () => void
}

export interface EmptyStateProps {
  title: string
  body: string
  action?: Action
  secondary?: Action
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Empty state (§3.25): dashed frame, tide illustration, 2–3 word title, one
 * sentence saying why it's empty and what to do, one action (never two primaries).
 */
export function EmptyState({
  title,
  body,
  action,
  secondary,
  size = 'md',
  className,
}: EmptyStateProps): React.JSX.Element {
  const sm = size === 'sm'
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 border border-dashed border-hairline text-center',
        sm ? 'p-7' : 'p-12',
        className,
      )}
    >
      <TideIllustration
        width={sm ? 56 : 72}
        height={sm ? 32 : 40}
        className="text-tide max-[390px]:hidden"
      />
      <h3 className="font-display text-h3 text-ink">{title}</h3>
      <p className="max-w-[320px] text-body-sm text-ink-muted">{body}</p>
      {action || secondary ? (
        <div className="mt-1 flex items-center gap-2">
          {action ? (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          ) : null}
          {secondary ? (
            <Button variant="secondary" onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
