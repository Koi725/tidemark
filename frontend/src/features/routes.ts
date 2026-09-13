import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { routeService } from '@/services'
import { notify } from '@/components/feedback/notify'
import type { Route } from '@/contracts'

export const routeKeys = {
  all: ['routes'] as const,
  list: () => [...routeKeys.all, 'list'] as const,
}

export function useRoutes() {
  return useQuery({ queryKey: routeKeys.list(), queryFn: () => routeService.list() })
}

export function usePutRoutes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (routes: Route[]) => routeService.put(routes),
    onMutate: async (routes) => {
      await qc.cancelQueries({ queryKey: routeKeys.list() })
      const prev = qc.getQueryData<Route[]>(routeKeys.list())
      qc.setQueryData<Route[]>(routeKeys.list(), routes)
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(routeKeys.list(), ctx.prev)
      notify('alert', 'Couldn’t save routing — please retry')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: routeKeys.list() }),
  })
}
