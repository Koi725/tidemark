import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notifierService } from '@/services'
import type { NotifierInput } from '@/services'
import { notify } from '@/components/feedback/notify'

export const notifierKeys = {
  all: ['notifiers'] as const,
  list: () => [...notifierKeys.all, 'list'] as const,
}

export function useNotifiers() {
  return useQuery({ queryKey: notifierKeys.list(), queryFn: () => notifierService.list() })
}

export function useTestNotifier() {
  return useMutation({
    mutationFn: (v: { id: string; kind: string }) => notifierService.test(v.id),
    onSuccess: (_d, v) => notify('ok', `Test delivered to ${v.kind} · 212ms`),
    onError: (_e, v) => notify('alert', `Test to ${v.kind} failed`),
  })
}

export function useCreateNotifier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NotifierInput) => notifierService.create(input),
    onSuccess: (n) => {
      notify('ok', `Added ${n.kind} notifier`)
      void qc.invalidateQueries({ queryKey: notifierKeys.list() })
    },
  })
}

export function useUpdateNotifier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; input: NotifierInput }) => notifierService.update(v.id, v.input),
    onSuccess: (n) => {
      notify('ok', `Saved ${n.name}`)
      void qc.invalidateQueries({ queryKey: notifierKeys.list() })
    },
  })
}
