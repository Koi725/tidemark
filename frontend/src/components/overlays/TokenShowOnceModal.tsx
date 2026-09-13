import { useEffect, useState } from 'react'
import { Content, Description, Overlay, Portal, Root, Title } from '@radix-ui/react-alert-dialog'
import { Copy } from 'lucide-react'
import { Button, Corner } from '@/components/primitives'
import type { CornerPosition } from '@/components/primitives'
import { notify } from '@/components/feedback/notify'

const CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

export interface TokenShowOnceModalProps {
  open: boolean
  token: string
  onClose: () => void
}

/** Inner body — mounted only while open, so state starts fresh (no reset effect). */
function TokenBody({ token, onClose }: { token: string; onClose: () => void }): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setUnlocked(true), 10_000)
    return () => window.clearTimeout(id)
  }, [])

  const copy = (): void => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(token)
    setCopied(true)
    setUnlocked(true)
    notify('ok', 'Token copied')
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Title className="font-display text-h2 text-ink">Token created</Title>
      <Description className="text-body-sm text-ink-muted">
        Copy it now. For your safety it is stored hashed and can't be shown again.
      </Description>
      <div className="flex gap-1.5">
        <code className="flex-1 break-all border border-hairline bg-sunken p-2.5 font-mono text-[12.5px] text-ink">
          {token}
        </code>
        <Button variant="secondary" onClick={copy} startSlot={<Copy size={14} strokeWidth={1.5} aria-hidden="true" />}>
          {copied ? 'Copied ✓' : 'Copy'}
        </Button>
      </div>
      {!unlocked ? <p className="text-[11px] text-ink-muted">Copy the token to continue</p> : null}
      <div className="flex justify-end">
        <Button variant="primary" disabled={!unlocked} onClick={onClose}>
          I've saved it
        </Button>
      </div>
    </>
  )
}

/** Show-once token modal (§3.21). Un-dismissable until copied or 10s elapse. */
export function TokenShowOnceModal({ open, token, onClose }: TokenShowOnceModalProps): React.JSX.Element {
  return (
    <Root open={open}>
      <Portal>
        <Overlay className="fixed inset-0 z-[60] bg-scrim data-[state=open]:animate-[tw-fade_160ms_var(--ease-out)]" />
        <Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="fixed inset-0 z-[60] m-auto flex h-fit w-[min(520px,100%)] flex-col gap-3.5 border border-hairline bg-overlay p-[var(--tm-pad)] shadow-lg data-[state=open]:animate-[tw-pop_200ms_var(--ease-out)]"
        >
          <TokenBody token={token} onClose={onClose} />
          {CORNERS.map((p) => (
            <Corner key={p} position={p} />
          ))}
        </Content>
      </Portal>
    </Root>
  )
}
