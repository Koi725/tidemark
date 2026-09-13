import { useState } from 'react'
import {
  Action,
  Cancel,
  Content,
  Overlay,
  Portal,
  Root,
  Title,
  Description,
} from '@radix-ui/react-alert-dialog'
import { Button, Corner, Input } from '@/components/primitives'
import type { CornerPosition } from '@/components/primitives'

const CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  body: string
  /** Typed-confirm string (destructive). Omitted / variant simple → no field. */
  match?: string
  actionLabel: string
  onConfirm: () => void | Promise<void>
  variant?: 'typed' | 'simple'
  /** Destructive styling on the confirm button. */
  destructive?: boolean
}

/**
 * Inner body — mounted only while open (Radix unmounts Content on close), so its
 * state initialises fresh each time without a reset-on-open effect.
 */
function ConfirmBody({
  title,
  body,
  match,
  actionLabel,
  onConfirm,
  onOpenChange,
  variant,
  destructive,
}: Omit<ConfirmDialogProps, 'open'>): React.JSX.Element {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typed = variant === 'typed' && Boolean(match)
  const matched = !typed || value.trim() === match
  const mismatch = typed && touched && !matched

  const handleConfirm = async (): Promise<void> => {
    if (!matched || pending) return
    setPending(true)
    setError(null)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setPending(false)
    }
  }

  return (
    <>
      <Title className="font-display text-h2 text-ink">{title}</Title>
      <Description className="text-body-sm text-ink-2">{body}</Description>

      {typed ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm text-ink-muted">
            Type <span className="font-mono text-ink">{match}</span> to confirm
          </label>
          <Input
            mono
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            invalid={mismatch}
            aria-label={`Type ${match} to confirm`}
          />
          {mismatch ? (
            <p className="text-[11px] text-alert" role="alert">
              Doesn't match {match}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="border border-alert-border p-2.5 text-body-sm text-alert" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Cancel asChild>
          <Button variant="secondary" disabled={pending}>
            Cancel
          </Button>
        </Cancel>
        {/* Not AlertDialog.Action — we control close so typed/pending gating holds. */}
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          disabled={!matched}
          loading={pending}
          onClick={() => void handleConfirm()}
        >
          {pending ? 'Deleting…' : actionLabel}
        </Button>
      </div>
      {/* Keep a hidden Action so Radix a11y wiring stays complete. */}
      <Action className="hidden" aria-hidden="true" tabIndex={-1} />
    </>
  )
}

/** All destructive confirms (§3.23). Destructive = typed confirm. */
export function ConfirmDialog({ open, onOpenChange, ...rest }: ConfirmDialogProps): React.JSX.Element {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay className="fixed inset-0 z-[60] bg-scrim data-[state=open]:animate-[tw-fade_160ms_var(--ease-out)]" />
        <Content className="fixed inset-0 z-[60] m-auto flex h-fit w-[min(460px,100%)] flex-col gap-3.5 border border-hairline bg-overlay p-[var(--tm-pad)] shadow-lg data-[state=open]:animate-[tw-pop_200ms_var(--ease-out)]">
          <ConfirmBody onOpenChange={onOpenChange} {...rest} />
          {CORNERS.map((p) => (
            <Corner key={p} position={p} />
          ))}
        </Content>
      </Portal>
    </Root>
  )
}
