import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/*
 * Responsive + a11y audit across every screen × width × theme (§8.4 step 11).
 * Reduced motion is forced so layout is deterministic for the geometry checks.
 */

const SCREENS = [
  { name: 'onboarding', path: '/onboarding' },
  { name: 'overview', path: '/' },
  { name: 'sources', path: '/sources' },
  { name: 'dataset-detail', path: '/datasets/ds-0?tab=timeline&range=24h' },
  { name: 'incidents', path: '/incidents' },
  { name: 'notifiers', path: '/notifiers' },
  { name: 'status-editor', path: '/status' },
  { name: 'status-public', path: '/status/acme' },
  { name: 'settings', path: '/settings' },
]

const WIDTHS = [390, 768, 1024, 1440, 1920]
const THEMES = ['dark', 'light'] as const

async function primeStorage(page: Page, theme: string): Promise<void> {
  await page.addInitScript((t) => {
    localStorage.setItem('tm.ui.theme', t)
    localStorage.setItem(
      'tm.ui',
      JSON.stringify({
        state: { sidebarCollapsed: false, lastVisited: [], tz: 'local', reduceMotion: true },
        version: 0,
      }),
    )
  }, theme)
}

/** Outermost visible interactive elements that overlap each other by >25% area. */
async function overlaps(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const sel =
      'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="radio"], [role="checkbox"]'
    const desc = (el: Element): string => {
      const label = el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 24)
      return `${el.tagName.toLowerCase()}[${label}]`
    }
    type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number }
    // Clip an element's box to its scroll-clipping ancestors + the viewport, so
    // content scrolled behind chrome (e.g. cards under the mobile nav) doesn't
    // register as an overlap.
    const visibleRect = (el: Element): Rect => {
      const b = el.getBoundingClientRect()
      let left = b.left
      let top = b.top
      let right = b.right
      let bottom = b.bottom
      const clip = (cl: number, ct: number, cr: number, cb: number): void => {
        left = Math.max(left, cl)
        top = Math.max(top, ct)
        right = Math.min(right, cr)
        bottom = Math.min(bottom, cb)
      }
      let p = el.parentElement
      while (p) {
        const s = getComputedStyle(p)
        if (/(auto|scroll|hidden)/.test(s.overflow + s.overflowX + s.overflowY)) {
          const pr = p.getBoundingClientRect()
          clip(pr.left, pr.top, pr.right, pr.bottom)
        }
        p = p.parentElement
      }
      clip(0, 0, window.innerWidth, window.innerHeight)
      return { left, top, right, bottom, width: right - left, height: bottom - top }
    }
    const els = [...document.querySelectorAll(sel)].filter((el) => {
      const s = getComputedStyle(el)
      if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false
      if (el.closest('[aria-hidden="true"]')) return false
      const r = visibleRect(el)
      if (r.width < 2 || r.height < 2) return false
      if (el.parentElement?.closest(sel)) return false // outermost only
      return true
    })
    const rects = els.map((el) => ({ el, r: visibleRect(el) }))
    const out: string[] = []
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i].r
        const b = rects[j].r
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
        const area = ix * iy
        if (area <= 0) continue
        const minArea = Math.min(a.width * a.height, b.width * b.height)
        if (area > minArea * 0.25) out.push(`${desc(rects[i].el)} ⨯ ${desc(rects[j].el)}`)
      }
    }
    return out
  })
}

for (const theme of THEMES) {
  for (const screen of SCREENS) {
    for (const width of WIDTHS) {
      test(`${screen.name} @ ${width} · ${theme}`, async ({ page }) => {
        await primeStorage(page, theme)
        await page.setViewportSize({ width, height: 900 })
        await page.goto(screen.path)
        await page.locator('h1, h2').first().waitFor({ state: 'visible' })
        await page.waitForTimeout(500) // let mock queries resolve + render

        // No horizontal overflow.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow, `horizontal overflow on ${screen.name} @${width}`).toBeLessThanOrEqual(1)

        // No overlapping interactive elements.
        expect(await overlaps(page), `overlapping controls on ${screen.name} @${width}`).toEqual([])

        // axe — no serious/critical violations.
        const results = await new AxeBuilder({ page }).analyze()
        const serious = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        )
        expect(
          serious.map((v) => `${v.id} (${v.nodes.length})`),
          `axe on ${screen.name} @${width} ${theme}`,
        ).toEqual([])
      })
    }
  }
}
