import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService, tokenService } from '@/services'
import type { SettingsPatch } from '@/services'
import { notify } from '@/components/feedback/notify'
import type { ApiToken, TokenScope } from '@/contracts'

export const settingsKeys = {
  all: ['settings'] as const,
  root: () => [...settingsKeys.all] as const,
}
export const tokenKeys = {
  all: ['tokens'] as const,
  list: () => [...tokenKeys.all, 'list'] as const,
}

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.root(), queryFn: () => settingsService.get() })
}

export function usePatchSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SettingsPatch) => settingsService.patch(body),
    onSuccess: (settings) => qc.setQueryData(settingsKeys.root(), settings),
  })
}

export function useTokens() {
  return useQuery({ queryKey: tokenKeys.list(), queryFn: () => tokenService.list() })
}

export function useCreateToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { name: string; scope: TokenScope }) => tokenService.create(v.name, v.scope),
    onSuccess: () => qc.invalidateQueries({ queryKey: tokenKeys.list() }),
  })
}

export function useRevokeToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; name: string }) => tokenService.revoke(v.id),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: tokenKeys.list() })
      const prev = qc.getQueryData<ApiToken[]>(tokenKeys.list())
      qc.setQueryData<ApiToken[]>(tokenKeys.list(), (old) => old?.filter((t) => t.id !== v.id))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(tokenKeys.list(), ctx.prev)
      notify('alert', 'Couldn’t revoke — please retry')
    },
    onSuccess: (_d, v) => notify('ok', `Revoked ${v.name}`),
    onSettled: () => qc.invalidateQueries({ queryKey: tokenKeys.list() }),
  })
}
