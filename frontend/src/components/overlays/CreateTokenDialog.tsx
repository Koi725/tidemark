import { useState } from 'react'
import { Content, Description, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog'
import { Button, Corner, Input, Segmented } from '@/components/primitives'
import type { CornerPosition } from '@/components/primitives'
import type { TokenScope } from '@/mocks'

const CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

export interface CreateTokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, scope: TokenScope) => void
}

function CreateTokenBody({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, scope: TokenScope) => void
  onCancel: () => void
}): React.JSX.Element {
  const [name, setName] = useState('')
  const [scope, setScope] = useState<TokenScope>('read')
  const [expires, setExpires] = useState('never')

  return (
    <>
      <Title className="font-display text-h2 text-ink">Create token</Title>
      <Description className="text-body-sm text-ink-muted">Shown once. Scope it narrowly.</Description>

      <label className="flex flex-col gap-1.5">
        <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Name</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus aria-label="Token name" placeholder="ci-probe-runner" />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Scope</span>
        <Segmented
          ariaLabel="Token scope"
          value={scope}
          onValueChange={(v) => setScope(v as TokenScope)}
          options={[
            { value: 'read', label: 'read' },
            { value: 'probe', label: 'probe' },
            { value: 'admin', label: 'admin' },
          ]}
        />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Expires</span>
        <select
          value={expires}
          onChange={(e) => setExpires(e.target.value)}
          aria-label="Token expiry"
          className="h-[38px] w-full rounded-md border border-hairline bg-raised px-2.5 text-[14px] text-ink focus:border-tide"
        >
          <option value="never">Never</option>
          <option value="30d">30 days</option>
          <option value="90d">90 days</option>
          <option value="1y">1 year</option>
        </select>
      </label>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" disabled={name.trim() === ''} onClick={() => onCreate(name.trim(), scope)}>
          Create token
        </Button>
      </div>
    </>
  )
}

/** Create-token dialog (§8 API tokens) → hands the raw token to TokenShowOnceModal. */
export function CreateTokenDialog({ open, onOpenChange, onCreate }: CreateTokenDialogProps): React.JSX.Element {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay className="fixed inset-0 z-40 bg-scrim data-[state=open]:animate-[tw-fade_160ms_var(--ease-out)]" />
        <Content
          aria-describedby={undefined}
          className="fixed inset-0 z-40 m-auto flex h-fit w-[min(460px,100%)] flex-col gap-3.5 border border-hairline bg-overlay p-[var(--tm-pad)] shadow-lg data-[state=open]:animate-[tw-pop_200ms_var(--ease-out)]"
        >
          <CreateTokenBody onCreate={onCreate} onCancel={() => onOpenChange(false)} />
          {CORNERS.map((p) => (
            <Corner key={p} position={p} />
          ))}
        </Content>
      </Portal>
    </Root>
  )
}
