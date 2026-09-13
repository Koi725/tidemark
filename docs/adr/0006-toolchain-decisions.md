# 0006 — Toolchain & structure decisions

- Status: accepted
- Date: 2026-09-13

Small decisions neither binding document specified, recorded for traceability.

## Exact dependency pins

CLAUDE.md requires exact pins and forbids hand-editing `package.json`. The Vite
scaffold left `^`/`~` ranges, and pnpm would not rewrite specifiers that were
already satisfied. Decision: add `frontend/.npmrc` with `save-exact=true` (and
`engine-strict=true`), then re-pin via `pnpm remove` + `pnpm add` (tool-managed,
not hand-edited) at the installed versions. Scripts were set with `pnpm pkg set`.
Result: every dependency is an exact version.

## `noUncheckedIndexedAccess` and `paths` without `baseUrl`

`tsconfig.app.json` enables `strict` + `noUncheckedIndexedAccess` (per brief) and
declares the `@/*` alias via `paths` **without** `baseUrl` (deprecated in TS 6;
paths resolve relative to the config). The alias is declared in all three places
required: `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`.

## `node` types in the app project

`tests/frontend-security.test.tsx` scans source with `node:fs`/`node:path`, and
tests are typechecked in the app project. `"node"` was added to `tsconfig.app`
`types` so tests typecheck. Minor: Node globals become visible to app source;
acceptable for phase 1.

## Provider file split

Theme and density providers are split into `context.ts` / `Provider.tsx` /
`useX.ts` / `index.ts` so each module has a single concern and route/provider files
don't trip `react-refresh/only-export-components`. Persisted to `localStorage`
under `tm.ui.theme` / `tm.ui.density`; the resolved value is written to
`data-theme` / `data-density` on `<html>`.

## ESLint: Fast Refresh rule off for routes

TanStack route modules export a `Route` object beside their component, which the
`react-refresh/only-export-components` rule cannot accommodate in this plugin
version (`allowExportNames` had no effect). The rule is disabled for
`src/routes/**` only; those modules are driven by the router's own HMR.

## a11y assertion style

`vitest-axe`'s type augmentation targets the legacy `Vi` global namespace, which
Vitest 5 no longer maps onto `expect()`. Rather than add an `any`-typed matcher
augmentation, the a11y test asserts `expect(results.violations).toEqual([])`
directly. `/dev/tokens` renders both themes at once, so one axe pass covers both.
