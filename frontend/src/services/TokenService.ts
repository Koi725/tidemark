import { apiTokenListSchema, createdTokenSchema } from '@/contracts'
import type { ApiToken, CreatedToken, TokenScope } from '@/contracts'
import { apiCommand, apiRequest, isLiveApi } from '@/lib/api'
import { API_TOKENS, generateToken } from '@/mocks/settings'
import { clone, mock } from './mock'

export interface TokenService {
  list(): Promise<ApiToken[]>
  create(name: string, scope: TokenScope): Promise<CreatedToken>
  revoke(id: string): Promise<void>
}

/* ── mock (stateful) ── */

const store: ApiToken[] = clone([...API_TOKENS])

const mockTokenService: TokenService = {
  list: () => mock(clone(store)),
  create: (name, scope) => {
    const token = generateToken()
    const record: ApiToken = {
      id: `tok-${Date.now()}`,
      name,
      prefix: token.slice(0, 8),
      scope,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
    }
    store.unshift(record)
    return mock({ token, record })
  },
  revoke: (id) => {
    const i = store.findIndex((t) => t.id === id)
    if (i >= 0) store.splice(i, 1)
    return mock(undefined)
  },
}

/* ── real ── */

const realTokenService: TokenService = {
  list: () => apiRequest(apiTokenListSchema, '/api/tokens'),
  create: (name, scope) =>
    apiRequest(createdTokenSchema, '/api/tokens', { method: 'POST', body: { name, scope } }),
  revoke: (id) => apiCommand(`/api/tokens/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export const tokenService: TokenService = isLiveApi() ? realTokenService : mockTokenService
