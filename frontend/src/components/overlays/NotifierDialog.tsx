import { useState } from 'react'
import { Content, Description, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog'
import { Button, Corner } from '@/components/primitives'
import type { CornerPosition } from '@/components/primitives'
import { SourceIcon } from '@/components/status/SourceIcon'
import { SchemaDrivenForm } from '@/components/forms/SchemaDrivenForm'
import { isSchemaComplete } from '@/components/forms/isSchemaComplete'
import type { FormValues } from '@/components/forms/isSchemaComplete'
import { notify } from '@/components/feedback/notify'
import { cn } from '@/lib/cn'
import type { ConnectorSchema, Notifier } from '@/mocks'

const CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']

function pwd(title: string, order: number): ConnectorSchema['properties'][string] {
  return { type: 'string', title, format: 'password', writeOnly: true, 'x-order': order }
}

const NOTIFIER_TYPES: readonly ConnectorSchema[] = [
  {
    type: 'slack', code: 'SL', name: 'Slack', kinds: '', version: 1, required: ['webhook_url'],
    properties: {
      webhook_url: { type: 'string', title: 'Webhook URL', format: 'uri', 'x-mono': true, 'x-span': 2, 'x-order': 1 },
      channel: { type: 'string', title: 'Channel', 'x-order': 2, placeholder: '#data-alerts' },
    },
  },
  {
    type: 'discord', code: 'DC', name: 'Discord', kinds: '', version: 1, required: ['webhook_url'],
    properties: {
      webhook_url: { type: 'string', title: 'Webhook URL', format: 'uri', 'x-mono': true, 'x-span': 2, 'x-order': 1 },
    },
  },
  {
    type: 'telegram', code: 'TG', name: 'Telegram', kinds: '', version: 1, required: ['bot_token', 'chat_id'],
    properties: {
      bot_token: pwd('Bot token', 1),
      chat_id: { type: 'string', title: 'Chat ID', 'x-mono': true, 'x-order': 2 },
    },
  },
  {
    type: 'ntfy', code: 'NT', name: 'ntfy', kinds: '', version: 1, required: ['topic_url'],
    properties: {
      topic_url: { type: 'string', title: 'Topic URL', format: 'uri', 'x-mono': true, 'x-span': 2, 'x-order': 1 },
    },
  },
  {
    type: 'email', code: 'EM', name: 'Email', kinds: '', version: 1, required: ['to', 'smtp_host'],
    properties: {
      to: { type: 'string', title: 'To', 'x-order': 1 },
      smtp_host: { type: 'string', title: 'SMTP host', 'x-mono': true, 'x-order': 2 },
      smtp_port: { type: 'integer', title: 'Port', default: 587, 'x-order': 3 },
      username: { type: 'string', title: 'Username', 'x-order': 4 },
      password: pwd('Password', 5),
    },
  },
  {
    type: 'webhook', code: 'WH', name: 'Webhook', kinds: '', version: 1, required: ['url'],
    properties: {
      url: { type: 'string', title: 'URL', format: 'uri', 'x-mono': true, 'x-span': 2, 'x-order': 1 },
      secret: pwd('Signing secret', 2),
    },
  },
  {
    type: 'apprise', code: '··', name: 'Apprise URL', kinds: '', version: 1, required: ['url'],
    properties: {
      url: {
        type: 'string', title: 'Apprise URL', 'x-mono': true, 'x-span': 2, 'x-order': 1,
        placeholder: 'tgram://token/chat_id',
        description: 'Any Apprise URL — e.g. tgram://token/chat_id. See the Apprise docs for the full list.',
      },
    },
  },
]

export interface NotifierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present → edit mode. */
  notifier?: Notifier | null
}

function NotifierBody({ notifier, onDone }: { notifier?: Notifier | null; onDone: () => void }): React.JSX.Element {
  const initial = notifier ? NOTIFIER_TYPES.find((t) => t.code === notifier.code) ?? null : null
  const [schema, setSchema] = useState<ConnectorSchema | null>(initial)
  const [values, setValues] = useState<FormValues>({})

  if (!schema) {
    return (
      <>
        <Title className="font-display text-h2 text-ink">Add notifier</Title>
        <Description className="text-caption text-ink-muted">
          Slack, Discord, Telegram, ntfy, email, webhook — or any Apprise URL.
        </Description>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
          {NOTIFIER_TYPES.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => setSchema(t)}
              className="tm-touch flex flex-col items-start gap-2 border border-hairline p-2.5 text-left transition-colors duration-fast hover:border-strong hover:bg-faint"
            >
              <SourceIcon code={t.code} size={28} decorative />
              <span className="text-body-sm font-medium text-ink">{t.name}</span>
            </button>
          ))}
        </div>
      </>
    )
  }

  const complete = isSchemaComplete(schema, values)
  return (
    <>
      <div className="flex items-center gap-2.5">
        <SourceIcon code={schema.code} size={28} decorative />
        <Title className="font-display text-h2 text-ink">
          {notifier ? `Edit ${notifier.name}` : schema.name}
        </Title>
        {!notifier ? (
          <Button variant="ghost" className="ml-auto" onClick={() => setSchema(null)}>
            Change
          </Button>
        ) : null}
      </div>
      <SchemaDrivenForm schema={schema} values={values} onChange={setValues} />
      <div className="mt-2 flex items-center gap-2 border-t border-hairline pt-3">
        <Button
          variant="secondary"
          disabled={!complete}
          onClick={() => notify('ok', `Test delivered to ${schema.name} · 212ms`)}
        >
          Send test
        </Button>
        <Button
          variant="primary"
          className="ml-auto"
          disabled={!complete}
          onClick={() => {
            notify('ok', notifier ? `Saved ${notifier.name}` : `Added ${schema.name} notifier`)
            onDone()
          }}
        >
          {notifier ? 'Save' : 'Add notifier'}
        </Button>
      </div>
    </>
  )
}

/** Add/Edit notifier dialog (§4 Screen 6). Type picker → SchemaDrivenForm. */
export function NotifierDialog({ open, onOpenChange, notifier }: NotifierDialogProps): React.JSX.Element {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay className="fixed inset-0 z-40 bg-scrim data-[state=open]:animate-[tw-fade_160ms_var(--ease-out)]" />
        <Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-40 flex flex-col gap-4 border border-hairline bg-overlay shadow-lg',
            'inset-0 overflow-auto p-2 md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:w-[min(620px,100%)] md:-translate-x-1/2 md:-translate-y-1/2 md:p-[var(--tm-pad)]',
            'data-[state=open]:animate-[tw-pop_200ms_var(--ease-out)]',
          )}
        >
          <NotifierBody notifier={notifier} onDone={() => onOpenChange(false)} />
          {CORNERS.map((p) => (
            <Corner key={p} position={p} />
          ))}
        </Content>
      </Portal>
    </Root>
  )
}
