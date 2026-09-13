/** Shared helpers for the mock service implementations (no network). */

const MOCK_LATENCY_MS = 120

/** Resolve with a value after a small delay so loading states are exercisable. */
export function mock<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** Deep clone so callers can't mutate the in-memory mock store by reference. */
export function clone<T>(value: T): T {
  return structuredClone(value)
}
