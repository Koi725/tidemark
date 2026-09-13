interface TideIllustrationProps {
  width?: number
  height?: number
  className?: string
}

/**
 * Empty-state illustration (§7.1): two tide lines, the back one at 50% opacity
 * (the "was", which draws in). Decorative — aria-hidden.
 */
export function TideIllustration({
  width = 72,
  height = 40,
  className,
}: TideIllustrationProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 72 40"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path
        opacity=".5"
        d="M2 24c6 0 6-8 12-8s6 8 12 8 6-8 12-8 6 8 12 8 6-8 12-8 6 8 8 8"
      />
      <path d="M2 32c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6 6-6 12-6 6 6 8 6" />
    </svg>
  )
}
