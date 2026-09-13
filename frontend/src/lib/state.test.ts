import { describe, expect, it } from 'vitest'
import {
  DATASET_STATES,
  type DatasetState,
  compareBySeverity,
  isDatasetState,
  severityOrder,
  stateMeta,
} from './state'

describe('dataset states', () => {
  it('defines the six states', () => {
    expect(DATASET_STATES).toHaveLength(6)
  })

  it('orders by severity, most urgent first', () => {
    expect([...severityOrder]).toEqual([
      'error',
      'late',
      'stale',
      'unknown',
      'fresh',
      'paused',
    ])
  })

  it('sorts arrays with the comparator', () => {
    const sorted = (['fresh', 'error', 'stale'] as DatasetState[]).sort(
      compareBySeverity,
    )
    expect(sorted).toEqual(['error', 'stale', 'fresh'])
  })

  it('exposes meta with a token-backed colour var', () => {
    expect(stateMeta.fresh.label).toBe('Fresh')
    expect(stateMeta.fresh.cssVar).toBe('--tm-state-fresh')
    expect(stateMeta.error.severity).toBeGreaterThan(stateMeta.fresh.severity)
    expect(stateMeta.paused.icon).toBeTruthy()
  })

  it('guards unknown strings', () => {
    expect(isDatasetState('fresh')).toBe(true)
    expect(isDatasetState('nonsense')).toBe(false)
  })
})
