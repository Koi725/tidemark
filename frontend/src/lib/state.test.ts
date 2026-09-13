import { describe, expect, it } from 'vitest'
import {
  DATASET_STATES,
  type DatasetState,
  compareBySeverity,
  isDatasetState,
  severityOrder,
  stateMeta,
  worstState,
} from './state'

describe('dataset states (§6.1)', () => {
  it('defines the five states', () => {
    expect([...DATASET_STATES]).toEqual(['ok', 'warn', 'alert', 'unknown', 'paused'])
  })

  it('orders by severity: alert > warn > unknown > ok > paused', () => {
    expect([...severityOrder]).toEqual(['alert', 'warn', 'unknown', 'ok', 'paused'])
  })

  it('sorts arrays with the comparator', () => {
    const sorted = (['ok', 'alert', 'warn'] as DatasetState[]).sort(compareBySeverity)
    expect(sorted).toEqual(['alert', 'warn', 'ok'])
  })

  it('exposes meta with an uppercase label and token-backed colour var', () => {
    expect(stateMeta.ok.label).toBe('OK')
    expect(stateMeta.alert.label).toBe('ALERT')
    expect(stateMeta.ok.cssVar).toBe('--tm-ok-fg')
    expect(stateMeta.alert.severity).toBeGreaterThan(stateMeta.ok.severity)
    expect(stateMeta.paused.icon).toBeTruthy()
  })

  it('rolls up to the worst state, ignoring paused', () => {
    expect(worstState(['ok', 'warn', 'paused'])).toBe('warn')
    expect(worstState(['ok', 'alert', 'warn'])).toBe('alert')
    expect(worstState(['paused'])).toBe('unknown')
    expect(worstState([])).toBe('unknown')
    expect(worstState(['paused'], { ignorePaused: false })).toBe('paused')
  })

  it('guards unknown strings', () => {
    expect(isDatasetState('ok')).toBe(true)
    expect(isDatasetState('nonsense')).toBe(false)
  })
})
