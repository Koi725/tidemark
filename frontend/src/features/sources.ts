import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sourceService } from '@/services'
import { notify } from '@/components/feedback/notify'
import type { Source } from '@/contracts'

export const sourceKeys = {
  all: ['sources'] as const,
  list: () => [...sourceKeys.all, 'list'] as const,
  connector: (type: string) => [...sourceKeys.all, 'connector', type] as const,
  discover: (type: string) => [...sourceKeys.all, 'discover', type] as const,
}

export function useSources() {
  return useQuery({ queryKey: sourceKeys.list(), queryFn: () => sourceService.list() })
}

export function useConnectorSchema(type: string | null) {
  return useQuery({
    queryKey: sourceKeys.connector(type ?? ''),
    queryFn: () => sourceService.connectorSchema(type as string),
    enabled: type !== null,
  })
}

export function useDiscover(type: string | null, enabled: boolean) {
  return useQuery({
    queryKey: sourceKeys.discover(type ?? ''),
    queryFn: () => sourceService.discover(type as string),
    enabled: enabled && type !== null,
  })
}

export function useProbeSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; name: string }) => sourceService.probe(v.id),
    onSuccess: (_d, v) => {
      notify('info', `Probe queued for ${v.name}`)
      void qc.invalidateQueries({ queryKey: sourceKeys.list() })
    },
  })
}

export function useDeleteSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; name: string }) => sourceService.remove(v.id),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: sourceKeys.list() })
      const prev = qc.getQueryData<Source[]>(sourceKeys.list())
      qc.setQueryData<Source[]>(sourceKeys.list(), (old) => old?.filter((s) => s.id !== v.id))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(sourceKeys.list(), ctx.prev)
      notify('alert', 'Couldn’t delete source — please retry')
    },
    onSuccess: (_d, v) => notify('ok', `Deleted ${v.name}`),
    onSettled: () => qc.invalidateQueries({ queryKey: sourceKeys.list() }),
  })
}
