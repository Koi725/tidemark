# 0003 — Self-hosted fonts & preload strategy

- Status: accepted (provisional — pending real HANDOFF §8.1)
- Date: 2026-09-13

## Context

The brief requires self-hosted Barlow 400/500, Barlow Condensed 600 and the
JetBrains Mono variable face "with the preload strategy described there" (§8.1),
which was unavailable. The `@fontsource*` packages are already dependencies and
ship the woff2 files, but importing their per-weight CSS yields build-hashed font
URLs, which makes a static `<link rel="preload">` fragile.

## Decision

- Copy exactly the four woff2 faces the design uses from the `@fontsource*`
  packages into `public/fonts/` under **stable, unhashed names**.
- Declare `@font-face` in `src/styles/fonts.css` pointing at `/fonts/*.woff2` with
  `font-display: swap`.
- Preload the two above-the-fold faces (Barlow 400, JetBrains Mono variable) in
  `index.html` with `crossorigin`. Stable names keep those hints valid across
  builds; Vite copies `public/` verbatim into `dist/`.

## Consequences

- No network font fetches; deterministic, self-hosted delivery with working
  preloads (verified in `dist/`).
- The font files are duplicated from `node_modules` into `public/`. If the weight
  set changes, update both the copies and `fonts.css`.
- If the real §8.1 prescribes a different preload set or subsetting, adjust
  `fonts.css` + `index.html`; no code changes needed elsewhere.
