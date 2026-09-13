import type { DatasetState } from '@/lib/state'

// Fixed dark-theme fg hexes — the badge is a standalone asset, theme-independent.
const RIGHT_BG: Record<DatasetState, string> = {
  ok: '#4ecb85',
  warn: '#f0b33a',
  alert: '#ff7b72',
  unknown: '#9aa0a6',
  paused: '#9aa0a6',
}

const CHAR = 6.6 // JetBrains Mono 11px advance
const PAD = 8
const H = 20

export interface BadgeSvgProps {
  label: string
  value: string
  state: DatasetState
  className?: string
}

/**
 * Shields-style status badge (§7b). 20px tall; left block #2b2b2d with the short
 * name, right block the state colour with the value. Uses explicit textLength so
 * it renders correctly even without JetBrains Mono installed.
 */
export function BadgeSvg({ label, value, state, className }: BadgeSvgProps): React.JSX.Element {
  const leftW = Math.round(label.length * CHAR + PAD * 2)
  const rightW = Math.round(value.length * CHAR + PAD * 2)
  const total = leftW + rightW
  const leftTextLen = label.length * CHAR
  const rightTextLen = value.length * CHAR

  return (
    <svg
      width={total}
      height={H}
      viewBox={`0 0 ${total} ${H}`}
      role="img"
      aria-label={`${label}: ${value}`}
      className={className}
    >
      <rect width={leftW} height={H} fill="#2b2b2d" />
      <rect x={leftW} width={rightW} height={H} fill={RIGHT_BG[state]} />
      <text
        x={leftW / 2}
        y={14}
        textAnchor="middle"
        textLength={leftTextLen}
        lengthAdjust="spacingAndGlyphs"
        fontFamily="JetBrains Mono, monospace"
        fontSize={11}
        fill="#e6e8ea"
      >
        {label}
      </text>
      <text
        x={leftW + rightW / 2}
        y={14}
        textAnchor="middle"
        textLength={rightTextLen}
        lengthAdjust="spacingAndGlyphs"
        fontFamily="JetBrains Mono, monospace"
        fontSize={11}
        fill="#0f1113"
      >
        {value}
      </text>
    </svg>
  )
}
