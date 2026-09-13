import { useEffect, useRef, useState } from 'react'
import { Content, Description, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog'
import { Button, Corner } from '@/components/primitives'
import type { CornerPosition } from '@/components/primitives'
import { SourceIcon } from '@/components/status/SourceIcon'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { ConnectionTestLog } from '@/components/wizard/ConnectionTestLog'
import { buildTestLines } from '@/components/wizard/testLines'
import type { LogLine, TestStatus } from '@/components/wizard/testLines'
import { DiscoveryList } from '@/components/wizard/DiscoveryList'
import { SchemaDrivenForm } from '@/components/forms/SchemaDrivenForm'
import { isSchemaComplete } from '@/components/forms/isSchemaComplete'
import type { FormValues } from '@/components/forms/isSchemaComplete'
import { WizardStepper } from '@/components/wizard/WizardStepper'
import { notify } from '@/components/feedback/notify'
import { cn } from '@/lib/cn'
import { formatCount } from '@/lib/format'
import { CONNECTORS, discoveredFor } from '@/mocks'
import type { ConnectorSchema, DiscoveredDataset } from '@/mocks'

const CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']
const STEPS = ['Type', 'Configure', 'Test', 'Discover']

const TEST_FOOTER: Record<string, string> = {
  kafka: 'Fetches metadata and checks the ACLs are read-only.',
  s3: 'Lists the prefix and checks writes are denied.',
}

export interface AddSourceWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * All wizard state lives here so it mounts fresh each time the dialog opens
 * (Radix unmounts Content on close) — no reset-on-open effect needed.
 */
function WizardBody({
  onDirtyChange,
  onDone,
}: {
  onDirtyChange: (dirty: boolean) => void
  onDone: () => void
}): React.JSX.Element {
  const [step, setStep] = useState(0)
  const [connector, setConnector] = useState<ConnectorSchema | null>(null)
  const [values, setValues] = useState<FormValues>({})
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [lines, setLines] = useState<LogLine[]>([])
  const [discovered, setDiscovered] = useState<DiscoveredDataset[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    onDirtyChange(false)
  }, [onDirtyChange])

  const markDirty = (): void => onDirtyChange(true)

  const runTest = (): void => {
    if (!connector) return
    const host = String(values.host ?? values.endpoint ?? values.brokers ?? connector.name)
    const fail = host.toLowerCase().includes('fail')
    const full = buildTestLines(connector.type, host || `${connector.type}.internal`, fail)
    setAttempts((a) => a + 1)
    setLines([])
    setTestStatus('running')
    setStep(2)
    full.forEach((line, i) => {
      window.setTimeout(() => {
        setLines((prev) => [...prev, line])
        if (i === full.length - 1) setTestStatus(fail ? 'failed' : 'ok')
      }, 180 * (i + 1))
    })
  }

  const startDiscovery = (): void => {
    if (!connector) return
    const list = discoveredFor(connector.type)
    setDiscovered(list)
    setSelected(list.length <= 200 ? new Set(list.slice(0, 8).map((d) => d.key)) : new Set())
    setStep(3)
  }

  const finishMonitoring = (): void => {
    notify('ok', `Monitoring ${formatCount(selected.size)} datasets from ${connector?.name ?? 'source'}`)
    onDone()
  }
  const saveAnyway = (): void => {
    notify('warn', `Saved ${connector?.name ?? 'source'} — it will show UNKNOWN until a probe succeeds.`)
    onDone()
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Title className="font-display text-h2 text-ink">Add source</Title>
        <div className="ml-auto">
          <WizardStepper steps={STEPS} current={step} />
        </div>
      </div>

      {step === 0 ? (
        <>
          <Description className="text-caption text-ink-muted">
            Pick a type. The form is generated from the connector's JSON schema.
          </Description>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 md:grid-cols-[repeat(auto-fill,minmax(130px,1fr))]">
            {CONNECTORS.map((c) => (
              <button
                key={c.type}
                type="button"
                onClick={() => {
                  setConnector(c)
                  setValues({})
                  markDirty()
                  setStep(1)
                }}
                className="tm-touch flex flex-col items-start gap-2 border border-hairline p-2.5 text-left transition-colors duration-fast hover:border-strong hover:bg-faint"
              >
                <SourceIcon code={c.code} size={28} decorative />
                <span className="text-body-sm font-medium text-ink">{c.name}</span>
                <span className="text-caption text-ink-muted">{c.kinds}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 1 && connector ? (
        <>
          <div className="flex items-center gap-2.5">
            <SourceIcon code={connector.code} size={28} decorative />
            <span className="text-body font-medium text-ink">{connector.name}</span>
            <span className="text-caption text-ink-muted">schema v{connector.version}</span>
            <Button variant="ghost" className="ml-auto" onClick={() => setStep(0)}>
              Change
            </Button>
          </div>
          <SchemaDrivenForm
            schema={connector}
            values={values}
            onChange={(v) => {
              markDirty()
              setValues(v)
            }}
          />
          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-hairline pt-3">
            <Button variant="primary" disabled={!isSchemaComplete(connector, values)} onClick={runTest}>
              Test connection
            </Button>
            <span className="text-caption text-ink-muted">
              {TEST_FOOTER[connector.type] ?? 'Runs SELECT 1 and checks the role is read-only.'}
            </span>
          </div>
        </>
      ) : null}

      {step === 2 && connector ? (
        <>
          <span className="text-body text-ink">Testing {connector.name}</span>
          <ConnectionTestLog
            lines={lines}
            status={testStatus}
            rawError={
              testStatus === 'failed'
                ? `authentication failed for role\nendpoint=${String(values.host ?? connector.type)}\nprobe_id=test-${attempts} attempt=${attempts}/3 next_retry=5s`
                : undefined
            }
          />
          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
            {testStatus === 'failed' ? (
              <>
                <Button variant="primary" onClick={runTest}>
                  Retry test
                </Button>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="ghost" onClick={saveAnyway}>
                  Save anyway
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" disabled={testStatus !== 'ok'} onClick={startDiscovery}>
                  Discover datasets
                </Button>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
              </>
            )}
          </div>
        </>
      ) : null}

      {step === 3 && connector ? (
        <>
          {discovered.length > 200 ? (
            <p className="text-caption text-ink-muted">Too many to select by default — search or use a pattern.</p>
          ) : null}
          <DiscoveryList
            discovered={discovered}
            selected={selected}
            onSelectedChange={setSelected}
            onMonitor={finishMonitoring}
          />
        </>
      ) : null}
    </>
  )
}

export function AddSourceWizard({ open, onOpenChange }: AddSourceWizardProps): React.JSX.Element {
  const dirtyRef = useRef(false)
  const [discardOpen, setDiscardOpen] = useState(false)

  return (
    <>
      <Root
        open={open}
        onOpenChange={(o) => {
          if (o) return
          if (dirtyRef.current) setDiscardOpen(true)
          else onOpenChange(false)
        }}
      >
        <Portal>
          <Overlay className="fixed inset-0 z-40 bg-scrim data-[state=open]:animate-[tw-fade_160ms_var(--ease-out)]" />
          <Content
            aria-describedby={undefined}
            className={cn(
              'fixed z-40 flex flex-col gap-4 border border-hairline bg-overlay shadow-lg',
              'inset-0 overflow-auto p-2 md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:w-[min(760px,100%)] md:-translate-x-1/2 md:-translate-y-1/2 md:p-[var(--tm-pad)]',
              'data-[state=open]:animate-[tw-pop_200ms_var(--ease-out)]',
            )}
          >
            <WizardBody
              onDirtyChange={(d) => {
                dirtyRef.current = d
              }}
              onDone={() => onOpenChange(false)}
            />
            {CORNERS.map((p) => (
              <Corner key={p} position={p} />
            ))}
          </Content>
        </Portal>
      </Root>

      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        variant="simple"
        destructive={false}
        title="Discard this source?"
        body="The form isn't saved. Your connection details will be lost."
        actionLabel="Discard"
        onConfirm={() => {
          setDiscardOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
