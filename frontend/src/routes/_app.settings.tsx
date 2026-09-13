import { useState } from 'react'
import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { Button, Frame, Input, Kbd, Switch } from '@/components/primitives'
import { ThemeToggle } from '@/components/controls/ThemeToggle'
import { DensityToggle } from '@/components/controls/DensityToggle'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { CreateTokenDialog } from '@/components/overlays/CreateTokenDialog'
import { TokenShowOnceModal } from '@/components/overlays/TokenShowOnceModal'
import { notify } from '@/components/feedback/notify'
import { HeaderStrip } from '@/shell/HeaderStrip'
import { cn } from '@/lib/cn'
import { useNow } from '@/lib/clock'
import { formatAgo } from '@/lib/format'
import { useUiStore } from '@/stores/ui'
import { API_TOKENS, SETTINGS, generateToken } from '@/mocks'
import type { ApiToken, TokenScope } from '@/mocks'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsRoute,
})

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[var(--tm-gap)]">
      <div className="flex flex-col gap-1">
        <h4 className="font-display text-h4 uppercase tracking-[.04em] text-ink">{title}</h4>
        {description ? <p className="text-caption text-ink-muted">{description}</p> : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

const KEYBOARD: Array<[string, ReactNode]> = [
  ['Command palette', <><Kbd>⌘</Kbd> <Kbd>K</Kbd></>],
  ['Go to overview', <><Kbd>g</Kbd> <Kbd>o</Kbd></>],
  ['Go to incidents', <><Kbd>g</Kbd> <Kbd>i</Kbd></>],
  ['Probe focused dataset', <Kbd>p</Kbd>],
  ['Acknowledge incident', <Kbd>a</Kbd>],
  ['Toggle theme', <Kbd>t</Kbd>],
  ['Toggle density', <Kbd>d</Kbd>],
  ['This list', <Kbd>?</Kbd>],
]

function EgressToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Frame
      as="button"
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className="flex w-full items-start gap-3 p-[var(--tm-pad)] text-left"
    >
      <span
        className={cn(
          'mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-none border',
          on ? 'border-tide bg-tide' : 'border-hairline bg-transparent',
        )}
      >
        <span
          className="size-[14px] rounded-sm bg-ink transition-transform duration-fast ease-out"
          style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)', background: on ? 'var(--tm-accent-on)' : undefined }}
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-body font-medium text-ink">Strict egress policy · {on ? 'on' : 'off'}</span>
        <span className="text-body-sm text-ink-muted">
          When on, the container can only talk to your sources and the notifiers you've listed. Any other outbound
          connection is refused and logged. Turn it off only if a notifier needs a redirect you can't predict.
        </span>
      </span>
    </Frame>
  )
}

function SettingsRoute() {
  const now = useNow()
  const [email, setEmail] = useState(SETTINGS.email)
  const [password, setPassword] = useState('')
  const [tokens, setTokens] = useState<ApiToken[]>([...API_TOKENS])
  const [retention, setRetention] = useState(SETTINGS.retention)
  const [egress, setEgress] = useState(SETTINGS.egressStrict)
  const reduceMotion = useUiStore((s) => s.reduceMotion)
  const setReduceMotion = useUiStore((s) => s.setReduceMotion)
  const tz = useUiStore((s) => s.tz)
  const setTz = useUiStore((s) => s.setTz)

  const [createOpen, setCreateOpen] = useState(false)
  const [shownToken, setShownToken] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiToken | null>(null)
  const [egressConfirm, setEgressConfirm] = useState(false)

  const createToken = (name: string, scope: TokenScope): void => {
    const token = generateToken()
    setTokens((prev) => [
      { id: `tok-${Date.now()}`, name, prefix: token.slice(0, 8), scope, lastUsedAt: null, createdAt: new Date().toISOString() },
      ...prev,
    ])
    setCreateOpen(false)
    setShownToken(token)
  }

  const toggleEgress = (): void => {
    if (egress) setEgressConfirm(true)
    else setEgress(true)
  }

  return (
    <>
      <HeaderStrip title="Settings" />

      <div className="mx-auto flex max-w-[860px] flex-col gap-[34px] p-[var(--tm-pad)]">
        <Section title="Profile" description="Single admin by design. Add API tokens for automation.">
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">New password</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="New password" />
            <span className="text-[11px] text-ink-muted">Leave blank to keep the current one.</span>
          </label>
          <Button variant="primary" className="w-fit" onClick={() => notify('ok', 'Saved')}>
            Update
          </Button>
        </Section>

        <Section title="API tokens" description="Shown once. Scope them narrowly.">
          <div className="border border-hairline">
            {tokens.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0">
                <KeyRound size={16} strokeWidth={1.5} className="text-ink-muted" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-body-sm text-ink">{t.name}</div>
                  <div className="font-mono text-mono-sm text-ink-muted">
                    {t.prefix}… · {t.scope}
                  </div>
                </div>
                <span className="font-mono text-mono-sm text-ink-muted">used {formatAgo(t.lastUsedAt, { now })}</span>
                <Button variant="ghost" className="text-alert" onClick={() => setRevokeTarget(t)}>
                  Revoke
                </Button>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-fit" onClick={() => setCreateOpen(true)}>
            Create token
          </Button>
        </Section>

        <Section title="Security" description="tidemark never sends data anywhere you didn't configure.">
          <EgressToggle on={egress} onToggle={toggleEgress} />
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-2 text-body-sm text-ink">
              <ShieldCheck size={16} strokeWidth={1.8} className="text-ok" aria-hidden="true" /> Telemetry: none, not optional
            </span>
            <span className="flex items-center gap-2 text-body-sm text-ink">
              <ShieldCheck size={16} strokeWidth={1.8} className="text-ok" aria-hidden="true" /> Source access: read-only,
              verified at connect
            </span>
          </div>
        </Section>

        <Section title="Retention" description="Probe history lives in the container's SQLite volume.">
          <div className="flex flex-wrap gap-4">
            {(
              [
                ['Raw probes', 'rawProbes'],
                ['Hourly rollups', 'hourlyRollups'],
                ['Schema snapshots', 'schemaSnapshots'],
              ] as const
            ).map(([label, key]) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">{label}</span>
                <Input
                  mono
                  className="w-[120px]"
                  value={retention[key]}
                  onChange={(e) => setRetention((r) => ({ ...r, [key]: e.target.value }))}
                  aria-label={label}
                />
              </label>
            ))}
          </div>
          <span className="text-[11px] text-ink-muted">
            Shortening a window deletes older rows on the next nightly compaction.
          </span>
        </Section>

        <Section title="Appearance">
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Theme</span>
            <ThemeToggle />
          </div>
          <label className="flex items-center gap-2.5">
            <DensityToggle />
            <span className="text-body-sm text-ink">Compact density</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-2.5">
              <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} aria-label="Reduce motion" />
              <span className="text-body-sm text-ink">Reduce motion</span>
            </span>
            <span className="ml-[46px] text-[11px] text-ink-muted">Overrides your system setting for this browser.</span>
          </label>
          <label className="flex items-center gap-2.5">
            <Switch
              checked={tz === 'utc'}
              onCheckedChange={(on) => setTz(on ? 'utc' : 'local')}
              aria-label="Show times in UTC"
            />
            <span className="text-body-sm text-ink">Show times in UTC</span>
          </label>
        </Section>

        <Section title="Keyboard">
          <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {KEYBOARD.map(([action, keys]) => (
              <div key={action} className="flex items-center justify-between gap-3">
                <span className="text-body-sm text-ink">{action}</span>
                <span className="flex items-center gap-1">{keys}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <CreateTokenDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createToken} />
      <TokenShowOnceModal open={shownToken !== null} token={shownToken ?? ''} onClose={() => setShownToken(null)} />

      <ConfirmDialog
        open={revokeTarget !== null}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        title={revokeTarget ? `Revoke ${revokeTarget.name}?` : 'Revoke token?'}
        body="Anything using this token stops working immediately."
        match={revokeTarget?.name ?? ''}
        actionLabel="Revoke"
        onConfirm={() => {
          if (revokeTarget) {
            setTokens((prev) => prev.filter((t) => t.id !== revokeTarget.id))
            notify('ok', `Revoked ${revokeTarget.name}`)
          }
          setRevokeTarget(null)
        }}
      />

      <ConfirmDialog
        open={egressConfirm}
        onOpenChange={setEgressConfirm}
        variant="simple"
        destructive={false}
        title="Allow unlisted outbound traffic?"
        body="tidemark will stop refusing connections to hosts you haven't configured. Only do this if a notifier needs it."
        actionLabel="Turn off"
        onConfirm={() => {
          setEgress(false)
          setEgressConfirm(false)
        }}
      />
    </>
  )
}
