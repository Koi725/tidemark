interface TidemarkMarkProps {
  size?: number
  className?: string
  title?: string
}

/**
 * The tidemark logomark (§7.1): an eye whose iris is a tide line that breaks into
 * a pulse. currentColor via stroke; stroke-width 1.8 (1.6 at ≥48px).
 */
export function TidemarkMark({
  size = 24,
  className,
  title = 'tidemark',
}: TidemarkMarkProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={size >= 48 ? 1.6 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={className}
    >
      <path d="M2 16c4-6 24-6 28 0c-4 6-24 6-28 0z" />
      <path d="M6 16c2 0 2-3 4-3s2 3 4 3l1.5-5 2 9 1.5-4h7" />
    </svg>
  )
}
