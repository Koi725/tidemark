import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * Static source scan. Walks the production source tree and fails if any file
 * contains a banned construct. The scan deliberately covers src/ only (not this
 * test, which necessarily names the patterns) and skips the generated route tree.
 */

// Vitest runs from the frontend project root, so src is resolved from cwd.
const SRC_DIR = resolve(process.cwd(), 'src')
const IGNORED_FILES = new Set(['routeTree.gen.ts'])

interface Rule {
  name: string
  test: (source: string) => boolean
}

const RULES: readonly Rule[] = [
  {
    name: 'dangerouslySetInnerHTML',
    test: (s) => /dangerouslySetInnerHTML/.test(s),
  },
  {
    name: 'eval()',
    test: (s) => /\beval\s*\(/.test(s),
  },
  {
    name: 'new Function()',
    test: (s) => /\bnew\s+Function\s*\(/.test(s),
  },
  {
    name: 'console.*',
    test: (s) => /\bconsole\s*\.\s*[a-zA-Z]/.test(s),
  },
  {
    name: 'the `any` type',
    test: (s) =>
      /:\s*any\b/.test(s) ||
      /\bas\s+any\b/.test(s) ||
      /<\s*any[\s,>]/.test(s) ||
      /\bany\[\]/.test(s) ||
      /Array<\s*any\s*>/.test(s),
  },
  {
    name: 'target="_blank" without rel="noopener noreferrer"',
    test: (s) => {
      const hasBlank = /target\s*=\s*(["'{]\s*)?_blank/.test(s)
      if (!hasBlank) return false
      return !(/noopener/.test(s) && /noreferrer/.test(s))
    },
  },
]

function collectSourceFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = `${dir}/${entry.name}`
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full))
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.test\.(ts|tsx)$/.test(entry.name) &&
      !IGNORED_FILES.has(entry.name)
    ) {
      files.push(full)
    }
  }
  return files
}

describe('frontend security source scan', () => {
  const files = collectSourceFiles(SRC_DIR)

  it('finds source files to scan', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('contains no banned constructs', () => {
    const violations: string[] = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      const relative = file.slice(SRC_DIR.length + 1)
      for (const rule of RULES) {
        if (rule.test(source)) {
          violations.push(`${relative}: ${rule.name}`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})
