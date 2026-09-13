export type LogTone = 'normal' | 'ok' | 'warn' | 'alert'

export interface LogLine {
  ms: number
  text: string
  tone: LogTone
}

export type TestStatus = 'idle' | 'running' | 'ok' | 'failed'

/** Canonical read-only proof line sets per connector (§3.19). */
export function buildTestLines(type: string, host: string, fail = false): LogLine[] {
  const base: LogLine[] = [{ ms: 12, text: `connecting to ${host} (tls)`, tone: 'normal' }]
  if (fail) {
    return [
      ...base,
      { ms: 53, text: 'handshake ok · 38ms', tone: 'normal' },
      { ms: 402, text: 'authentication failed: password authentication failed for role', tone: 'alert' },
    ]
  }
  if (type === 'kafka') {
    return [
      ...base,
      { ms: 53, text: 'handshake ok · 38ms', tone: 'normal' },
      { ms: 94, text: 'SASL SCRAM-SHA-256 authenticated', tone: 'normal' },
      { ms: 135, text: 'ACLs: Describe, Read (no Write) ✓', tone: 'ok' },
      { ms: 176, text: 'metadata: 42 topics, 3 brokers', tone: 'normal' },
      { ms: 217, text: 'ready', tone: 'ok' },
    ]
  }
  if (type === 's3') {
    return [
      ...base,
      { ms: 53, text: 'handshake ok · 38ms', tone: 'normal' },
      { ms: 94, text: 'ListBucket, GetObject only ✓ — PutObject denied as expected', tone: 'ok' },
      { ms: 176, text: 'listed 1,092 objects under raw/', tone: 'normal' },
      { ms: 217, text: 'ready', tone: 'ok' },
    ]
  }
  return [
    ...base,
    { ms: 53, text: 'handshake ok · 38ms', tone: 'normal' },
    { ms: 94, text: 'authenticated as tidewatch_ro', tone: 'normal' },
    { ms: 135, text: 'role is read-only: INSERT denied as expected ✓', tone: 'ok' },
    { ms: 176, text: 'information_schema readable · 12 tables in 3 schemas', tone: 'normal' },
    { ms: 217, text: 'ready', tone: 'ok' },
  ]
}
