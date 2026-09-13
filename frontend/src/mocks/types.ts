/*
 * The domain types now live in the contract layer (zod-inferred, camelCase). This
 * file re-exports them so the mock fixtures — the wire-side seed data behind the
 * services — stay typed by the single source of truth.
 */
export * from '@/contracts'
