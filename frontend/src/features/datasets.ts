import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { datasetService } from '@/services'
import type { DatasetPatch } from '@/services'
import { notify } from '@/components/feedback/notify'
import type { TimeRange } from '@/contracts'

export const datasetKeys = {
  all: ['datasets'] as const,
  list: () => [...datasetKeys.all, 'list'] as const,
  detail: (id: string) => [...datasetKeys.all, 'detail', id] as const,
  rows: (id: string, range: TimeRange) => [...datasetKeys.all, 'rows', id, range] as const,
  freshness: (id: string, range: TimeRange) => [...datasetKeys.all, 'freshness', id, range] as const,
  schemaDiff: (id: string) => [...datasetKeys.all, 'schema', id] as const,
  incidents: (id: string) => [...datasetKeys.all, 'incidents', id] as const,
}

export function useDatasets() {
  return useQuery({ queryKey: datasetKeys.list(), queryFn: () => datasetService.list() })
}

export function useDataset(id: string) {
  return useQuery({ queryKey: datasetKeys.detail(id), queryFn: () => datasetService.get(id), retry: false })
}

export function useRowsSeries(id: string, range: TimeRange, enabled = true) {
  return useQuery({
    queryKey: datasetKeys.rows(id, range),
    queryFn: () => datasetService.rowsSeries(id, range),
    enabled,
  })
}

export function useFreshnessSeries(id: string, range: TimeRange, enabled = true) {
  return useQuery({
    queryKey: datasetKeys.freshness(id, range),
    queryFn: () => datasetService.freshnessSeries(id, range),
    enabled,
  })
}

export function useDatasetIncidents(id: string) {
  return useQuery({ queryKey: datasetKeys.incidents(id), queryFn: () => datasetService.incidents(id) })
}

function useDatasetInvalidation() {
  const qc = useQueryClient()
  return (id: string) => {
    void qc.invalidateQueries({ queryKey: datasetKeys.list() })
    void qc.invalidateQueries({ queryKey: datasetKeys.detail(id) })
  }
}

export function useProbeDataset() {
  const invalidate = useDatasetInvalidation()
  return useMutation({
    mutationFn: (v: { id: string; displayName: string }) => datasetService.probe(v.id),
    onSuccess: (_data, v) => {
      notify('info', `Probe queued for ${v.displayName}`)
      invalidate(v.id)
    },
  })
}

export function usePauseDataset() {
  const invalidate = useDatasetInvalidation()
  return useMutation({
    mutationFn: (id: string) => datasetService.pause(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}

export function useResumeDataset() {
  const invalidate = useDatasetInvalidation()
  return useMutation({
    mutationFn: (id: string) => datasetService.resume(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}

export function usePatchDataset() {
  const invalidate = useDatasetInvalidation()
  return useMutation({
    mutationFn: (v: { id: string; body: DatasetPatch }) => datasetService.patch(v.id, v.body),
    onSuccess: (_data, v) => {
      notify('ok', 'Saved')
      invalidate(v.id)
    },
  })
}

export function useStopMonitoring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => datasetService.stopMonitoring(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: datasetKeys.list() }),
  })
}
