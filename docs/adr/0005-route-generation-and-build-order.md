# 0005 — Route-tree generation & build ordering

- Status: accepted
- Date: 2026-09-13

## Context

CLAUDE.md mandates TanStack Router with file-based routes and a generated,
gitignored `src/routeTree.gen.ts`. The tree is emitted by the `tanstackRouter`
Vite plugin during a Vite run. But the build script is `tsc -b && vite build`, and
`tsc` fails if `routeTree.gen.ts` is absent (unresolved import). No standalone
route-generator CLI ships with the installed packages, and
`@tanstack/router-generator` is not resolvable from the project root under pnpm's
strict layout — so generation can only be triggered by invoking Vite.

## Decision

- Add a `generate` script — `vite optimize --force` — whose sole purpose is to make
  the `tanstackRouter` plugin resolve config and emit `routeTree.gen.ts`. It is a
  one-shot command that exits.
- Chain it explicitly: `typecheck` = `generate && tsc -b`; `build` =
  `generate && tsc -b && vite build` (the plugin regenerates during `vite build`
  too, harmlessly). CI runs lint → typecheck → test → build.
- The generated file carries `@ts-nocheck` and `eslint-disable`, and is added to
  `.gitignore` and the ESLint ignore list.

## Consequences

- Cold `tsc`, tests and build all work without a committed route tree.
- `vite optimize` prints a deprecation notice ("manually calling optimizeDeps is
  deprecated"); it still functions and exits 0. If a future Vite removes it, swap
  the `generate` script for the router CLI (once a compatible one is a dependency)
  or a small script using the Vite JS API — nothing else changes.
