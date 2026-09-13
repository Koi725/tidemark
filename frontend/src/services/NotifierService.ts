import { notifierListSchema, notifierSchema } from '@/contracts'
import type { Notifier } from '@/contracts'
import { apiCommand, apiRequest, isLiveApi } from '@/lib/api'
import { NOTIFIERS } from '@/mocks/notifiers'
import { clone, mock } from './mock'

export interface NotifierInput {
  kind: string
  code: string
  name: string
  target: string
}

export interface NotifierService {
  list(): Promise<Notifier[]>
  test(id: string): Promise<void>
  create(input: NotifierInput): Promise<Notifier>
  update(id: string, input: NotifierInput): Promise<Notifier>
}

/* ── mock (stateful) ── */

const store: Notifier[] = clone([...NOTIFIERS])

const mockNotifierService: NotifierService = {
  list: () => mock(clone(store)),
  test: () => mock(undefined),
  create: (input) => {
    const notifier: Notifier = {
      id: `ntf-${Date.now()}`,
      kind: input.kind,
      code: input.code,
      name: input.name,
      target: input.target,
      lastSentAt: null,
      events7d: 0,
      enabled: true,
    }
    store.unshift(notifier)
    return mock(clone(notifier))
  },
  update: (id, input) => {
    const n = store.find((x) => x.id === id)
    if (n) {
      n.name = input.name
      n.target = input.target
    }
    return mock(clone(n ?? store[0]!))
  },
}

/* ── real ── */

const enc = encodeURIComponent
const realNotifierService: NotifierService = {
  list: () => apiRequest(notifierListSchema, '/api/notifiers'),
  test: (id) => apiCommand(`/api/notifiers/${enc(id)}/test`, { method: 'POST' }),
  create: (input) => apiRequest(notifierSchema, '/api/notifiers', { method: 'POST', body: input }),
  update: (id, input) =>
    apiRequest(notifierSchema, `/api/notifiers/${enc(id)}`, { method: 'PUT', body: input }),
}

export const notifierService: NotifierService = isLiveApi()
  ? realNotifierService
  : mockNotifierService
