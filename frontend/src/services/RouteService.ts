import { routeListSchema } from '@/contracts'
import type { Route } from '@/contracts'
import { apiRequest, isLiveApi } from '@/lib/api'
import { ROUTES } from '@/mocks/notifiers'
import { clone, mock } from './mock'

export interface RouteService {
  list(): Promise<Route[]>
  put(routes: Route[]): Promise<Route[]>
}

/* ── mock (stateful) ── */

let store: Route[] = clone([...ROUTES])

const mockRouteService: RouteService = {
  list: () => mock(clone(store)),
  put: (routes) => {
    store = clone(routes)
    return mock(clone(store))
  },
}

/* ── real ── */

function toWire(r: Route): Record<string, unknown> {
  return {
    id: r.id,
    scope: r.scope,
    scope_ref: r.scopeRef,
    scope_label: r.scopeLabel,
    notifier_ids: r.notifierIds,
    min_severity: r.minSeverity,
  }
}

const realRouteService: RouteService = {
  list: () => apiRequest(routeListSchema, '/api/routes'),
  put: (routes) => apiRequest(routeListSchema, '/api/routes', { method: 'PUT', body: routes.map(toWire) }),
}

export const routeService: RouteService = isLiveApi() ? realRouteService : mockRouteService
