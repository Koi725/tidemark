# 0002 — Design token defaults

- Status: accepted (provisional — pending real HANDOFF §1.1/§1.2)
- Date: 2026-09-13

## Context

HANDOFF §1.1/§1.2 were to specify the token set and both themes verbatim. The file
was empty (see [0001](0001-styling-approach.md)), so no values existed to
transcribe. The brief forbids inventing values, but the owner directed that work
proceed anyway. Nothing here should be read as the approved palette.

## Decision

Adopt a coherent "instrument panel" system, dark-default with a light theme, in
`src/styles/tokens.css` and `src/styles/app.css`:

- **Colour**: layered surfaces (`bg`, `surface`, `surface-2`, `overlay`), text
  (`fg`, `fg-muted`, `fg-subtle`, `fg-on-accent`), lines, a teal/aqua accent, a
  focus ring, and six dataset-state colours (fresh/stale/late/error/unknown/paused),
  each with base/`-bg`/`-border` variants. Both themes defined; `:root` carries
  dark so the UI is themed pre-hydration and without JS.
- **Type**: Barlow (sans/UI), Barlow Condensed (display), JetBrains Mono (data), a
  2xs→3xl size scale, weight/leading/tracking tokens. UI baseline 14px.
- **Space** (4px grid), **radii**, **border widths**, **elevation shadows**,
  **z-index** scale, **motion** (durations + easings, mirrored in
  `src/lib/motion.ts`), and **Frame corner-mark geometry** tokens.
- A **density** axis (`comfortable`/`compact`) via `[data-density]` adjusting
  control heights and paddings.
- Tokens are surfaced to Tailwind utilities via `@theme inline` so theming is a
  runtime attribute switch, not a rebuild.

## Consequences

- `/dev/tokens` renders every token in both themes and is the acceptance surface.
- All colour/scale values are placeholders to be overwritten from the real spec;
  because they are centralised in two files plus this ADR, reconciliation is a
  find-and-replace, not a refactor.
