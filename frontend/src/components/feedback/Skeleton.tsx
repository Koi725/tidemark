import { cn } from '@/lib/cn'

export type SkeletonVariant =
  | 'text'
  | 'title'
  | 'badge'
  | 'metric'
  | 'chart'
  | 'strip'
  | 'row'

export interface SkeletonProps {
  variant?: SkeletonVariant
  /** Overrides the default width (CSS length). */
  width?: string
  /** Overrides the default height (px) — used by chart. */
  height?: number
  className?: string
}

const SHIMMER =
  'bg-[linear-gradient(90deg,var(--tm-skeleton-base)_25%,var(--tm-skeleton-highlight)_50%,var(--tm-skeleton-base)_75%)] bg-[length:200%_100%] animate-[tw-shimmer_1400ms_linear_infinite]'

// Geometry must match the final element it stands in for (§3.24).
const VARIANT: Record<SkeletonVariant, { className: string; width: string; height: number }> = {
  text: { className: 'rounded-md', width: '55%', height: 12 },
  title: { className: 'rounded-md', width: '40%', height: 18 },
  badge: { className: 'rounded-md', width: '52px', height: 18 },
  metric: { className: 'rounded-md', width: '40%', height: 30 },
  chart: { className: 'rounded-none', width: '100%', height: 28 },
  strip: { className: 'rounded-none', width: '100%', height: 26 },
  row: { className: 'rounded-none', width: '100%', height: 44 },
}

/** A single shimmer placeholder (§3.24). Decorative — aria-hidden. */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps): React.JSX.Element {
  const spec = VARIANT[variant]
  return (
    <span
      aria-hidden="true"
      className={cn('block', SHIMMER, spec.className, className)}
      style={{ width: width ?? spec.width, height: height ?? spec.height }}
    />
  )
}

/**
 * DatasetCard skeleton (§3.24 `card`): the real hairline border, corner marks
 * dropped so a loading card reads as unfinished. Geometry mirrors DatasetCard.
 */
export function SkeletonDatasetCard(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-[132px] flex-col gap-[10px] border border-hairline p-[var(--tm-pad)]"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton variant="text" width="55%" />
        <Skeleton variant="badge" />
      </div>
      <Skeleton variant="metric" />
      <Skeleton variant="chart" />
      <Skeleton variant="text" width="70%" />
    </div>
  )
}
