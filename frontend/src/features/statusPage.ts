import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { statusPageService } from '@/services'
import { notify } from '@/components/feedback/notify'
import type { StatusPageConfig } from '@/contracts'

export const statusPageKeys = {
  all: ['status-page'] as const,
  config: () => [...statusPageKeys.all, 'config'] as const,
  public: (slug: string) => ['public-status', slug] as const,
}

export function useStatusPage() {
  return useQuery({ queryKey: statusPageKeys.config(), queryFn: () => statusPageService.get() })
}

export function usePutStatusPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (config: StatusPageConfig) => statusPageService.put(config),
    onSuccess: (config) => {
      notify('ok', `Published to status.acme.dev/${config.slug}`)
      qc.setQueryData(statusPageKeys.config(), config)
    },
  })
}

export function usePreviewDatasets(datasetIds: string[]) {
  return useQuery({
    queryKey: [...statusPageKeys.all, 'preview', [...datasetIds].sort()],
    queryFn: () => statusPageService.preview(datasetIds),
  })
}

export function usePublicStatus(slug: string) {
  return useQuery({
    queryKey: statusPageKeys.public(slug),
    queryFn: () => statusPageService.publicStatus(slug),
    // Public page polls every 60s (no SSE) — §7b.
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}
