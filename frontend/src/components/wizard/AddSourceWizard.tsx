import { useMemo, useRef, useState } from 'react'
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
import { Skeleton } from '@/components/feedback/Skeleton'
import { notify } from '@/components/feedback/notify'
import { useConnectorSchema, useDiscover } from '@/features/sources'
import { cn } from '@/lib/cn'
import { formatCount } from '@/lib/format'

const CORNERS: readonly CornerPosition[] = ['tl', 'tr', 'bl', 'br']
const STEPS = ['Type', 'Configure', 'Test', 'Discover']

// Type-picker metadata (presentation only, like the nav). The full JSON schema is
// fetched per type via the connector service.
const CONNECTOR_TYPES: ReadonlyArray<{ type: string; code: string; name: string; kinds: string }> = [
  { type: 'postgres', code: 'PG', name: 'Postgres', kinds: 'tables · views' },
  { type: 'mysql', code: 'MY', name: 'MySQL', kinds: 'tables' },
  { type: 'clickhouse', code: 'CH', name: 'ClickHouse', kinds: 'tables · parts' },
  { type: 'trino', code: 'TR', name: 'Trino', kinds: 'catalogs · tables' },
  { type: 'duckdb', code: 'DK', name: 'DuckDB', kinds: 'file · tables' },
  { type: 'iceberg', code: 'IC', name: 'Iceberg REST', kinds: 'snapshots' },
  { type: 's3', code: 'S3', name: 'S3 / Garage', kinds: 'prefixes · objects' },
  { type: 'kafka', code: 'KF', name: 'Kafka / Redpanda', kinds: 'topics · lag' },
  { type: 'airflow', code: 'AF', name: 'Airflow', kinds: 'DAG runs' },
  { type: 'dbt', code: 'DB', name: 'dbt', kinds: 'run results' },
]

const TEST_FOOTER: Record<string, string> = {
  kafka: 'Fetches metadata and checks the ACLs are read-only.',
  s3: 'Lists the prefix and checks writes are denied.',
}

export interface AddSourceWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function WizardBody({
  onDirtyChange,
  onDone,
}: {
  onDirtyChange: (dirty: boolean) => void
  onDone: () => void
}): React.JSX.Element {
  const [step, setStep] = useState(0)
  const [type, setType] = useState<string | null>(null)
  const [values, setValues] = useState<FormValues>({})
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [lines, setLines] = useState<LogLine[]>([])
  const [attempts, setAttempts] = useState(0)
  const [discoverEnabled, setDiscoverEnabled] = useState(false)
  const [userSelection, setUserSelection] = useState<Set<string> | null>(null)

  const meta = CONNECTOR_TYPES.find((c) => c.type === type) ?? null
  const schemaQuery = useConnectorSchema(type)
  const schema = schemaQuery.data
  const discoverQuery = useDiscover(type, discoverEnabled)
  const discovered = useMemo(() => discoverQuery.data ?? [], [discoverQuery.data])

  const defaultSelection = useMemo(
    () => new Set(discovered.length <= 200 ? discovered.slice(0, 8).map((d) => d.key) : []),
    [discovered],
  )
  const selected = userSelection ?? defaultSelection

  const markDirty = (): void => onDirtyChange(true)

  const runTest = (): void => {
    if (!type) return
    const host = String(values.host ?? values.endpoint ?? values.brokers ?? meta?.name ?? type)
    const fail = host.toLowerCase().includes('fail')
    const full = buildTestLines(type, host || `${type}.internal`, fail)
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
    setUserSelection(null)
    setDiscoverEnabled(true)
    setStep(3)
  }

  const finishMonitoring = (): void => {
    notify('ok', `Monitoring ${formatCount(selected.size)} datasets from ${meta?.name ?? 'source'}`)
    onDone()
  }
  const saveAnyway = (): void => {
    notify('warn', `Saved ${meta?.name ?? 'source'} — it will show UNKNOWN until a probe succeeds.`)
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
            {CONNECTOR_TYPES.map((c) => (
              <button
                key={c.type}
                type="button"
                onClick={() => {
                  setType(c.type)
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

      {step === 1 && meta ? (
        <>
          <div className="flex items-center gap-2.5">
            <SourceIcon code={meta.code} size={28} decorative />
            <span className="text-body font-medium text-ink">{meta.name}</span>
            {schema ? <span className="text-caption text-ink-muted">schema v{schema.version}</span> : null}
            <Button variant="ghost" className="ml-auto" onClick={() => setStep(0)}>
              Change
            </Button>
          </div>
          {schema ? (
            <SchemaDrivenForm
              schema={schema}
              values={values}
              onChange={(v) => {
                markDirty()
                setValues(v)
              }}
            />
          ) : (
            <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading form">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="row" />
              <Skeleton variant="row" />
            </div>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-hairline pt-3">
            <Button variant="primary" disabled={!schema || !isSchemaComplete(schema, values)} onClick={runTest}>
              Test connection
            </Button>
            <span className="text-caption text-ink-muted">
              {TEST_FOOTER[meta.type] ?? 'Runs SELECT 1 and checks the role is read-only.'}
            </span>
          </div>
        </>
      ) : null}

      {step === 2 && meta ? (
        <>
          <span className="text-body text-ink">Testing {meta.name}</span>
          <ConnectionTestLog
            lines={lines}
            status={testStatus}
            rawError={
              testStatus === 'failed'
                ? `authentication failed for role\nendpoint=${String(values.host ?? meta.type)}\nprobe_id=test-${attempts} attempt=${attempts}/3 next_retry=5s`
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

      {step === 3 && meta ? (
        <>
          {discovered.length > 200 ? (
            <p className="text-caption text-ink-muted">Too many to select by default — search or use a pattern.</p>
          ) : null}
          <DiscoveryList
            discovered={discovered}
            selected={selected}
            onSelectedChange={setUserSelection}
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
