import type { ConnectorSchema } from '@/contracts'

export type FormValues = Record<string, unknown>

/** True when every required field has a value (drives the wizard's Test button). */
export function isSchemaComplete(schema: ConnectorSchema, values: FormValues): boolean {
  return schema.required.every((name) => {
    const v = values[name] ?? schema.properties[name]?.default
    return v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  })
}
