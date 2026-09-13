import type { z } from 'zod'

/*
 * Typed fetch wrapper + error normalisation (§8.3 lib/api.ts).
 *
 * Every response is parsed with its zod schema — `as X` at a fetch boundary is
 * banned. Query params are always encodeURIComponent-escaped. When VITE_API_BASE
 * is unset the services return mocks and this module is never called.
 */

export const API_BASE: string | undefined = import.meta.env.VITE_API_BASE

/** True when a real API base is configured; false → mocks. */
export function isLiveApi(): boolean {
  return typeof API_BASE === 'string' && API_BASE.length > 0
}

/* ── typed errors ── */

export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
export class NetworkError extends ApiError {
  constructor(message = 'Network request failed') {
    super(message, 0)
    this.name = 'NetworkError'
  }
}
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}
export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}
export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}
export class ServerError extends ApiError {
  constructor(message = 'Server error', status = 500) {
    super(message, status)
    this.name = 'ServerError'
  }
}
/** The server replied but the payload did not satisfy the contract. */
export class ContractError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContractError'
  }
}

function errorForStatus(status: number, message: string): ApiError {
  if (status === 401) return new UnauthorizedError(message)
  if (status === 404) return new NotFoundError(message)
  if (status === 409) return new ConflictError(message)
  if (status >= 500) return new ServerError(message, status)
  return new ApiError(message, status)
}

/* ── query string ── */

export type QueryValue = string | number | boolean | undefined | null

/** Build an escaped `?a=1&b=2` string; omits undefined/null values. */
export function buildQuery(params: Record<string, QueryValue>): string {
  const pairs: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }
  return pairs.length > 0 ? `?${pairs.join('&')}` : ''
}

/* ── request ── */

function authHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem('tm.auth.token')
    if (token) return { Authorization: `Bearer ${token}` }
  } catch {
    /* localStorage unavailable */
  }
  return {}
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

async function rawRequest(path: string, opts: RequestOptions): Promise<Response> {
  const init: RequestInit = {
    method: opts.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    signal: opts.signal,
  }
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body)
  let res: Response
  try {
    res = await fetch(`${API_BASE ?? ''}${path}`, init)
  } catch {
    throw new NetworkError()
  }
  if (!res.ok) {
    let message = res.statusText
    try {
      const problem = (await res.json()) as { message?: string }
      if (problem.message) message = problem.message
    } catch {
      /* non-JSON error body */
    }
    throw errorForStatus(res.status, message)
  }
  return res
}

/** Perform a request and parse the JSON response against `schema`. */
export async function apiRequest<T>(
  schema: z.ZodType<T>,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const res = await rawRequest(path, opts)
  const json: unknown = await res.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    throw new ContractError(`Response failed the contract at ${path}: ${parsed.error.message}`)
  }
  return parsed.data
}

/** Perform a request that returns no body (202/204). Throws on non-ok. */
export async function apiCommand(path: string, opts: RequestOptions = {}): Promise<void> {
  await rawRequest(path, opts)
}
