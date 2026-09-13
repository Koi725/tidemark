import { cn } from '@/lib/cn'

const NAMES: Record<string, string> = {
  PG: 'Postgres',
  MY: 'MySQL',
  CH: 'ClickHouse',
  TR: 'Trino',
  DK: 'DuckDB',
  IC: 'Iceberg REST',
  S3: 'S3 / Garage',
  KF: 'Kafka / Redpanda',
  AF: 'Airflow',
  DB: 'dbt',
  SL: 'Slack',
  DC: 'Discord',
  TG: 'Telegram',
  NT: 'ntfy',
  EM: 'Email',
  WH: 'Webhook',
}

export interface SourceIconProps {
  /** Two-letter monogram code (§3.30). Unknown codes fall back to ··. */
  code: string
  /** Tile size in px. 34 rows · 30 notifiers · 28 wizard · 22 group headers. */
  size?: number
  /** Set when the type name is already adjacent (renders decorative). */
  decorative?: boolean
  className?: string
}

/**
 * Source identity tile (§3.30): a square hairline tile with a 2-letter mono
 * monogram in tide. No third-party logos — the monogram is the shipped default.
 */
export function SourceIcon({
  code,
  size = 34,
  decorative = false,
  className,
}: SourceIconProps): React.JSX.Element {
  const key = code.toUpperCase()
  const glyph = NAMES[key] ? key : '··'
  const name = NAMES[key] ?? 'Unknown source'
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={cn(
        'grid shrink-0 place-items-center border border-hairline font-mono text-[11px] text-tide',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {glyph}
    </span>
  )
}
