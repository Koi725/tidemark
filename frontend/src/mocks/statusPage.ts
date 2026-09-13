import { worstState } from '@/lib/state'
import type { DatasetState } from '@/lib/state'
import { DATASETS } from './datasets'
import { INCIDENTS } from './incidents'
import { formatDuration } from '@/lib/format'
import type {
  DayState,
  PublicDataset,
  PublicStatus,
  StatusDay,
  StatusPageConfig,
} from './types'

const NOW = Date.now()
const DAY = 86_400_000

/** Editor config — a published page with 6 datasets selected. */
export const STATUS_PAGE: StatusPageConfig = {
  title: 'Acme Data Status',
  slug: 'acme',
  theme: 'auto',
  datasetIds: ['ds-0', 'ds-1', 'ds-2', 'ds-15', 'ds-24', 'ds-30'],
  showIncidents: true,
  published: true,
  publishedAt: new Date(NOW - 3 * DAY).toISOString(),
}

function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedOf(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function toDayState(state: DatasetState): DayState {
  if (state === 'ok') return 'ok'
  if (state === 'warn') return 'warn'
  if (state === 'alert') return 'alert'
  return 'none'
}

/** 90-day history seeded by key; today's cell reflects the live state. */
function ninetyDays(key: string, liveState: DatasetState): StatusDay[] {
  const next = rng(seedOf(key))
  const out: StatusDay[] = []
  for (let i = 0; i < 90; i += 1) {
    const date = new Date(NOW - (89 - i) * DAY).toISOString().slice(0, 10)
    let state: DayState = 'ok'
    const r = next()
    if (r > 0.97) state = 'alert'
    else if (r > 0.9) state = 'warn'
    else if (r > 0.88) state = 'none'
    const freshPct = state === 'ok' ? 100 : state === 'warn' ? 82 : state === 'alert' ? 40 : 0
    out.push({ date, state, freshPct })
  }
  const today = out[89]
  if (today) today.state = toDayState(liveState)
  return out
}

function shortName(key: string): string {
  const tail = key.replace(/\/$/, '').split(/[./]/).filter(Boolean).pop() ?? key
  return tail
}

function buildDatasets(ids: string[]): PublicDataset[] {
  return ids
    .map((id) => DATASETS.find((d) => d.id === id))
    .filter((d): d is (typeof DATASETS)[number] => Boolean(d))
    .map((d) => {
      const days = ninetyDays(d.key, d.state)
      const freshDays = days.filter((x) => x.state === 'ok').length
      return {
        id: d.id,
        key: d.key,
        shortName: shortName(d.key),
        state: d.state,
        uptimePct: Math.round((freshDays / 90) * 1000) / 10,
        lastRowAt: d.lastRowAt,
        days,
      }
    })
}

/** Assemble the public status payload for a slug (mocks; no network). */
export function getPublicStatus(slug: string): PublicStatus | null {
  if (slug !== STATUS_PAGE.slug || !STATUS_PAGE.published) return null
  const datasets = buildDatasets(STATUS_PAGE.datasetIds)
  const recentIncidents = INCIDENTS.filter((i) => i.resolvedAt)
    .slice(0, 5)
    .map((i) => ({
      date: new Date(i.openedAt).toISOString().slice(0, 10),
      title: i.title,
      duration: formatDuration(
        Date.parse(i.resolvedAt ?? i.openedAt) - Date.parse(i.openedAt),
      ),
    }))
  return {
    title: STATUS_PAGE.title,
    slug: STATUS_PAGE.slug,
    theme: STATUS_PAGE.theme,
    updatedAt: new Date(NOW - 40 * 1000).toISOString(),
    datasets,
    showIncidents: STATUS_PAGE.showIncidents,
    recentIncidents,
  }
}

/** Worst public state across datasets, ignoring paused (banner + drives copy). */
export function publicBannerState(datasets: PublicDataset[]): DatasetState {
  return worstState(datasets.map((d) => d.state))
}

/** Live preview datasets for the editor (selected ids, in order). */
export function previewDatasets(ids: string[]): PublicDataset[] {
  return buildDatasets(ids)
}
