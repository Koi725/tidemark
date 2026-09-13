# 0004 — Formatter, dataset-state and clock rules

- Status: accepted (provisional — pending real HANDOFF §3.3/§6.1–§6.4)
- Date: 2026-09-13

## Context

HANDOFF §6.2/§6.3/§6.4 (formatters), §6.1 (dataset states) and §3.3 (the single
ticker) were to specify exact rules; they were unavailable. These are pure logic,
so the defaults below are implemented to be deterministic and fully unit-tested,
and are easy to re-point to the real rules.

## Decision

**`src/lib/format.ts`** — non-finite/unparseable input renders `—`; durations are
milliseconds; the typographic minus (U+2212) is used for signs:

- `formatAge` — compact single-unit (`45s`, `3m`, `2h`, `4d`, `3w`, `2y`), optional
  `maxUnits` for precision (`3m 5s`).
- `formatAgo` — `just now` (<5s), else `Xm ago` / `in Xm`.
- `formatCount` — `1.2k`, `3.4M`, `…B`, `…T` (1 decimal below 10 of a unit).
- `formatBytes` — binary (1024) units, `1.5 KB`, `5 MB`.
- `formatPct` — from a 0..1 ratio; auto decimals (1 below 10%, else 0).
- `formatDelta` — signed, magnitude via `formatCount` by default.
- `formatTs` — `YYYY-MM-DD HH:mm` (24h, local; `utc`/`seconds`/`dateOnly`/
  `timeOnly` options).

**`src/lib/state.ts`** — states `fresh | stale | late | error | unknown | paused`;
severity most-urgent-first is `error > late > stale > unknown > fresh > paused`;
`stateMeta` maps each to a label, a Lucide icon and its `--tm-state-*` token
(colours are not hard-coded in JS).

**`src/lib/clock.ts`** — one shared ticker: 1s cadence while visible, downshifting
to 5s after 60s and 30s after 5min of continuous running; pauses on `hidden` and
resets to 1s (with an immediate tick) on `visible`; idles with no subscribers.

## Consequences

- Behaviour is locked by `format.test.ts`, `state.test.ts`, `clock.test.ts`.
- Thresholds/labels/severity are placeholders; changing them means editing these
  files and their tests. Any UI reads colour from tokens, so state recolouring is a
  token change.
