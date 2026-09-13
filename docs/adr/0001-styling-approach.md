# 0001 — Styling approach & CLAUDE.md ↔ HANDOFF.md reconciliation

- Status: accepted
- Date: 2026-09-13

## Context

Two binding documents govern this codebase:

- `frontend/CLAUDE.md` — the engineering standard (structure, layering, naming,
  named exports, no `any`/`enum`/non-null, the component-folder trio, import order,
  pnpm + exact pins, TanStack Router with a generated route tree).
- `docs/design/HANDOFF.md` — the approved visual design spec.

The project brief states the precedence rule explicitly: **where the two disagree
on structure, CLAUDE.md wins; where they disagree on visual values, HANDOFF.md
wins.** It also clarifies that "zero Tailwind utility classes" is *not* the rule
here — HANDOFF specifies utility classes mapped to `@theme` tokens, and that spec
wins for the visual layer.

Two complications were discovered at implementation time:

1. `docs/design/HANDOFF.md` did not contain the spec. Its entire contents were a
   stray shell command (`pbpaste > …/HANDOFF.md`) — the redirect that was meant to
   populate it, saved as the file body. Every §1/§3/§6/§8 reference the brief
   relies on was therefore absent.
2. `frontend/CLAUDE.md` contains only the Toolchain and Git sections; the
   structural rules the brief cites (folder structure, layering, naming, the
   component-folder trio, import order) are not present in the file.

The owner directed that work proceed regardless of the missing HANDOFF.

## Decision

- **Visual layer:** Tailwind v4 (via `@tailwindcss/vite`) provides the reset
  (preflight) and utility generation. Design tokens are defined as CSS custom
  properties (`--tm-*`) in `src/styles/tokens.css` and exposed to utilities through
  a `@theme inline` block, so a single utility (e.g. `bg-surface`) follows the
  active `[data-theme]` at runtime. Components use these utility classes in JSX,
  per the (missing) HANDOFF direction the brief quotes.
- **Structure layer (from CLAUDE.md, binding):** folder-per-primitive with a
  Component / `types.ts` / `index.ts` trio, named exports only, no
  `any`/`enum`/non-null assertions, ordered imports, pnpm with exact pins, TanStack
  Router with a generated, gitignored `routeTree.gen.ts`.
- Because the concrete visual values were unavailable, every value that HANDOFF
  would have dictated (colours, geometry, type/space/motion scales, format and
  state rules) is a **documented default**, recorded in ADRs 0002–0004. These ADRs
  are the reconciliation surface: when the real HANDOFF arrives, differences are
  applied there and in `tokens.css`/`app.css` without structural change.

## Consequences

- The build is fully functional and themeable today.
- The visual defaults are explicitly *not* the approved spec and must be
  reconciled. `HANDOFF.md` was left untouched at the owner's instruction.
- If CLAUDE.md is later restored in full and adds structural rules that conflict
  with choices here, CLAUDE.md wins and this code is adjusted.
