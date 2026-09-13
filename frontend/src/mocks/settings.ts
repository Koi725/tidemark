import type { ApiToken, Settings } from './types'

const NOW = Date.now()
const iso = (secondsAgo: number): string => new Date(NOW - secondsAgo * 1000).toISOString()

export const SETTINGS: Settings = {
  email: 'advicemicro@gmail.com',
  retention: {
    rawProbes: '14d',
    hourlyRollups: '400d',
    schemaSnapshots: 'keep all',
  },
  egressStrict: true,
}

export const API_TOKENS: readonly ApiToken[] = [
  {
    id: 'tok-ci',
    name: 'ci-probe-runner',
    prefix: 'twk_9f2a',
    scope: 'probe',
    lastUsedAt: iso(1.6 * 3600),
    createdAt: iso(86400 * 30),
  },
  {
    id: 'tok-readonly',
    name: 'grafana-readonly',
    prefix: 'twk_1c04',
    scope: 'read',
    lastUsedAt: iso(86400 * 2),
    createdAt: iso(86400 * 60),
  },
  {
    id: 'tok-admin',
    name: 'terraform-admin',
    prefix: 'twk_ab77',
    scope: 'admin',
    lastUsedAt: null,
    createdAt: iso(86400 * 5),
  },
]

/** Generate a fake full token for the show-once modal (mocks only). */
export function generateToken(): string {
  const rand = (): string => Math.random().toString(36).slice(2, 10)
  return `twk_${rand()}${rand()}${rand()}${rand()}`
}
