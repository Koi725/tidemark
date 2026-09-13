# tidemark

**Know when your data stops arriving.**
Uptime Kuma for your data. One container, read-only toward your systems, zero telemetry.

tidemark watches your tables, topics, buckets and models for freshness, volume and
schema drift — and tells you the moment something stops arriving, through the channels
you already use.

![tidemark overview — screenshot placeholder](docs/design/screenshot.png)

> _Screenshot placeholder — drop a capture of the Overview grid at `docs/design/screenshot.png`._

## Quick start

```bash
# Run the container (read-only toward your sources)
docker run -p 3080:3080 ghcr.io/tidewatch/tidewatch

# open http://localhost:3080 and create the admin account
```

### Develop the frontend

```bash
cd frontend
pnpm install
pnpm dev            # runs against in-memory mocks — no backend needed

# point it at a real API instead:
VITE_API_BASE=https://your-host pnpm dev
```

```bash
pnpm lint           # eslint
pnpm typecheck      # tsc
pnpm test           # vitest (unit + a11y)
pnpm build          # production build
pnpm e2e            # playwright: responsive + axe across all screens
```

The frontend runs entirely on mock fixtures until `VITE_API_BASE` is set; the service
seam (`src/services`) swaps to the real API transparently. The API contract lives in
[`openapi.yaml`](./openapi.yaml); the design spec in
[`docs/design/HANDOFF.md`](./docs/design/HANDOFF.md).

## Features

- **Freshness, volume & schema-drift checks** with learned ±2σ baselines.
- **Connect anything read-only** — Postgres, MySQL, ClickHouse, Trino, DuckDB,
  Iceberg, S3/Garage, Kafka/Redpanda, Airflow, dbt — via generated forms.
- **Incidents** with evidence, timeline and one-click ack / snooze / resolve.
- **Notifiers & routing** — Slack, Discord, Telegram, ntfy, email, webhook, or any
  Apprise URL; per-source and per-tag overrides.
- **Public status pages** with 90-day history strips, badges and an embeddable iframe.
- **Live updates** over SSE that patch the UI in place — no polling storms.
- **Keyboard-first** command palette (⌘K), dark/light themes, comfortable/compact
  density, and a full reduced-motion path.

## Security posture

- **Zero telemetry — not optional.** tidemark phones home to nobody.
- **Read-only toward your systems**, verified at connect time (the connection test
  proves the role can't write).
- **Strict egress policy** (default on): the container may only talk to your
  configured sources and notifiers; anything else is refused and logged.
- **Single admin + scoped API tokens.** Tokens are stored hashed and shown once.
- **Public status pages set no cookies and make no third-party requests.**
- Self-hosted, air-gap friendly: fonts and assets are bundled, nothing is fetched
  from a CDN.

## Layout

```
frontend/   Vite + React + TanStack Router SPA (this app)
docs/design/HANDOFF.md   the normative design + data spec
openapi.yaml             the API contract the backend implements
```

## License

Open source. © tidemark.
