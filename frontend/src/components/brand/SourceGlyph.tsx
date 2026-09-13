import type { ReactNode } from 'react'

/*
 * Original monoline source marks (§7.2) — 24×24, currentColor, stroke 1.5. No
 * official logos, no brand colours. The monogram tile (SourceIcon) is the shipped
 * default; this glyph set is an optional enhancement (e.g. wizard type-picker).
 */

const GLYPHS: Record<string, ReactNode> = {
  PG: (
    <g>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </g>
  ),
  MY: (
    <g>
      <ellipse cx="12" cy="7" rx="8" ry="3" />
      <path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
      <path d="M7 13c2 0 3-2 5-2s3 2 5 2" />
    </g>
  ),
  CH: (
    <g>
      <path d="M4 4v16M9 8v12M14 5v15M19 11v9" />
      <path d="M2 21h20" />
    </g>
  ),
  TR: (
    <g>
      <path d="M12 3v6" />
      <path d="M12 9 5 15v6M12 9l7 6v6M12 9v12" />
      <circle cx="12" cy="3" r="1.6" />
    </g>
  ),
  DK: (
    <g>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M8 15c1.5 0 1.5-2 3-2s1.5 2 3 2" />
    </g>
  ),
  IC: (
    <g>
      <path d="M3 15h18" />
      <path d="M12 3 5 15h14z" />
      <path d="M8 19h8M6 22h12" />
    </g>
  ),
  S3: (
    <g>
      <path d="M4 7h16l-1.5 13H5.5z" />
      <path d="M4 7 12 3l8 4" />
      <path d="M10 17l4-6" />
    </g>
  ),
  KF: (
    <g>
      <path d="M3 6h14M3 12h14M3 18h14" />
      <circle cx="20" cy="6" r="1.6" />
      <circle cx="20" cy="12" r="1.6" />
      <circle cx="20" cy="18" r="1.6" />
    </g>
  ),
  AF: (
    <g>
      <circle cx="5" cy="6" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
      <circle cx="5" cy="18" r="2.2" />
      <path d="M7 7l10 4M7 17l10-4" />
    </g>
  ),
  DB: (
    <g>
      <path d="M3 8h7a4 4 0 0 1 4 4v0a4 4 0 0 0 4 4h3" />
      <path d="M18 13l3 3-3 3" />
      <circle cx="3" cy="8" r="1.4" />
    </g>
  ),
  '··': (
    <g>
      <rect x="3" y="5" width="18" height="14" rx="0" />
      <path d="M7 10h4M7 14h8" />
    </g>
  ),
}

export interface SourceGlyphProps {
  code: string
  size?: number
  className?: string
}

/** A single monoline source mark (§7.2). Decorative — aria-hidden. */
export function SourceGlyph({ code, size = 24, className }: SourceGlyphProps): React.JSX.Element {
  const glyph = GLYPHS[code.toUpperCase()] ?? GLYPHS['··']
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {glyph}
    </svg>
  )
}
