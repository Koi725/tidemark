import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, Segmented, Switch } from '@/components/primitives'
import { TagInput } from '@/components/forms/TagInput'
import { cn } from '@/lib/cn'
import { parseDuration } from '@/lib/format'
import type { FormValues } from '@/components/forms/isSchemaComplete'
import type { ConnectorSchema, JsonSchemaProperty } from '@/mocks'

export type { FormValues }

export interface SchemaDrivenFormProps {
  schema: ConnectorSchema
  values: FormValues
  onChange: (values: FormValues) => void
}

function orderedEntries(
  schema: ConnectorSchema,
): Array<[string, JsonSchemaProperty]> {
  return Object.entries(schema.properties).sort(
    ([, a], [, b]) => (a['x-order'] ?? 99) - (b['x-order'] ?? 99),
  )
}

function spans(prop: JsonSchemaProperty): boolean {
  return prop['x-span'] === 2 || (prop.maxLength ?? 0) > 80 || prop.format === 'uri'
}

/** Per-property validation (§3.18): required, number range, duration parse. */
function validate(
  prop: JsonSchemaProperty,
  value: unknown,
  required: boolean,
): string | null {
  const empty =
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  if (required && empty) return 'Required'
  if (empty) return null
  if (prop.type === 'integer' || prop.type === 'number') {
    const n = Number(value)
    if (!Number.isFinite(n)) return 'Must be a number'
    if (prop.minimum !== undefined && n < prop.minimum) return `Min ${prop.minimum}`
    if (prop.maximum !== undefined && n > prop.maximum) return `Max ${prop.maximum}`
  }
  if (prop['x-format'] === 'duration' && parseDuration(String(value)) === null) {
    return 'Use e.g. 30s, 5m, 26h, 14d'
  }
  return null
}

interface FieldProps {
  name: string
  prop: JsonSchemaProperty
  required: boolean
  value: unknown
  onChange: (value: unknown) => void
}

function Field({ name, prop, required, value, onChange }: FieldProps): React.JSX.Element {
  const [touched, setTouched] = useState(false)
  const [reveal, setReveal] = useState(false)
  const error = touched ? validate(prop, value, required) : null
  const errorId = `${name}-error`
  const helpId = `${name}-help`
  const describedBy = error ? errorId : prop.description ? helpId : undefined

  const label = (
    <label htmlFor={name} className="text-label font-display uppercase tracking-[.1em] text-ink-muted">
      {prop.title}
      {required ? <span className="text-alert"> *</span> : null}
    </label>
  )

  const mono = prop['x-mono'] || prop.format === 'uri'

  let control: React.ReactNode

  if (prop.type === 'boolean') {
    control = (
      <div className="flex items-center gap-2">
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
          aria-label={prop.title}
          id={name}
        />
        {prop.description ? <span className="text-caption text-ink-muted">{prop.description}</span> : null}
      </div>
    )
  } else if (prop['x-widget'] === 'sql') {
    control = (
      <textarea
        id={name}
        rows={6}
        spellCheck={false}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-describedby={describedBy}
        className="w-full rounded-md border border-hairline bg-raised px-2.5 py-2 font-mono text-mono text-ink focus:border-tide"
      />
    )
  } else if (prop.enum && prop.enum.length <= 3) {
    control = (
      <Segmented
        ariaLabel={prop.title}
        value={String(value ?? prop.default ?? prop.enum[0])}
        onValueChange={onChange}
        options={prop.enum.map((o) => ({ value: o, label: o }))}
      />
    )
  } else if (prop.enum) {
    control = (
      <select
        id={name}
        value={String(value ?? prop.default ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className="h-[38px] w-full rounded-md border border-hairline bg-raised px-2.5 text-[14px] text-ink focus:border-tide"
      >
        {prop.enum.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    )
  } else if (prop.type === 'array') {
    control = (
      <TagInput
        id={name}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={onChange}
        mono={mono}
        placeholder="Type and press Enter"
        aria-describedby={describedBy}
      />
    )
  } else if (prop.format === 'password') {
    control = (
      <div className="relative">
        <Input
          id={name}
          type={reveal ? 'text' : 'password'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          invalid={Boolean(error)}
          className="pr-11"
          aria-describedby={describedBy}
        />
        <button
          type="button"
          aria-label={reveal ? 'Hide password' : 'Show password'}
          onClick={() => setReveal((r) => !r)}
          className="tm-touch absolute right-0 top-0 grid h-[38px] w-11 place-items-center text-ink-muted hover:text-ink"
        >
          {reveal ? <EyeOff size={16} strokeWidth={1.5} aria-hidden="true" /> : <Eye size={16} strokeWidth={1.5} aria-hidden="true" />}
        </button>
      </div>
    )
  } else if (prop.type === 'integer' || prop.type === 'number') {
    control = (
      <Input
        id={name}
        type="number"
        inputMode="numeric"
        mono
        className="w-[120px]"
        value={value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        onBlur={() => setTouched(true)}
        invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
    )
  } else if (prop['x-format'] === 'duration') {
    control = (
      <div className="relative">
        <Input
          id={name}
          mono
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          invalid={Boolean(error)}
          className="pr-16"
          aria-describedby={describedBy}
        />
        <span className="pointer-events-none absolute right-2.5 top-0 flex h-[38px] items-center font-mono text-mono-sm text-ink-faint">
          s / m / h / d
        </span>
      </div>
    )
  } else {
    control = (
      <Input
        id={name}
        mono={mono}
        placeholder={prop.placeholder}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', spans(prop) && 'sm:col-span-2')}>
      {label}
      {control}
      {error ? (
        <p id={errorId} role="alert" className="text-[11px] text-alert">
          {error}
        </p>
      ) : prop.description && prop.type !== 'boolean' ? (
        <p id={helpId} className="text-[11px] text-ink-muted">
          {prop.description}
        </p>
      ) : null}
    </div>
  )
}

/** Renders an add-source form from a connector JSON Schema (§3.18). Never hand-written per connector. */
export function SchemaDrivenForm({ schema, values, onChange }: SchemaDrivenFormProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
      {orderedEntries(schema).map(([name, prop]) => (
        <Field
          key={name}
          name={name}
          prop={prop}
          required={schema.required.includes(name)}
          value={values[name] ?? prop.default}
          onChange={(v) => onChange({ ...values, [name]: v })}
        />
      ))}
    </div>
  )
}
