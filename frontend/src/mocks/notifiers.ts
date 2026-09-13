import type { Notifier, Route } from './types'

const NOW = Date.now()
const iso = (secondsAgo: number): string => new Date(NOW - secondsAgo * 1000).toISOString()

/** Notifiers (§4 Screen 6). `discord-1` has failed its last three deliveries. */
export const NOTIFIERS: readonly Notifier[] = [
  {
    id: 'ntf-slack',
    kind: 'Slack',
    code: 'SL',
    name: 'data-alerts',
    target: 'https://hooks.slack.com/services/T00/B00/xxxxxxxx',
    lastSentAt: iso(1.6 * 3600),
    events7d: 42,
    enabled: true,
  },
  {
    id: 'ntf-ntfy',
    kind: 'ntfy',
    code: 'NT',
    name: 'on-call phone',
    target: 'ntfy.sh/tidewatch-oncall',
    lastSentAt: iso(1.6 * 3600),
    events7d: 42,
    enabled: true,
  },
  {
    id: 'ntf-discord',
    kind: 'Discord',
    code: 'DC',
    name: '#observability',
    target: 'https://discord.com/api/webhooks/1234/xxxx',
    lastSentAt: iso(3 * 3600),
    events7d: 11,
    enabled: true,
    failing: true,
  },
  {
    id: 'ntf-email',
    kind: 'Email',
    code: 'EM',
    name: 'platform team',
    target: 'platform@acme.dev',
    lastSentAt: iso(2 * 86400),
    events7d: 6,
    enabled: true,
  },
  {
    id: 'ntf-webhook',
    kind: 'Webhook',
    code: 'WH',
    name: 'pagerduty bridge',
    target: 'https://events.pagerduty.com/v2/enqueue',
    lastSentAt: null,
    events7d: 0,
    enabled: true,
  },
]

/** Routing rows (§3.22). tag overrides source overrides global. */
export const ROUTES: readonly Route[] = [
  {
    id: 'route-global',
    scope: 'global',
    scopeRef: null,
    scopeLabel: 'all datasets',
    notifierIds: ['ntf-slack'],
    minSeverity: 'warn',
  },
  {
    id: 'route-src-pg',
    scope: 'source',
    scopeRef: 'src-pg',
    scopeLabel: 'warehouse-pg',
    notifierIds: ['ntf-slack', 'ntf-ntfy'],
    minSeverity: 'alert',
  },
  {
    id: 'route-tag-gold',
    scope: 'tag',
    scopeRef: 'gold',
    scopeLabel: 'gold',
    notifierIds: ['ntf-slack', 'ntf-ntfy', 'ntf-email'],
    minSeverity: 'warn',
  },
]

export function getNotifier(id: string): Notifier | undefined {
  return NOTIFIERS.find((n) => n.id === id)
}
