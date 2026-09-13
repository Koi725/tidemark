import { CircleCheck, Info, OctagonAlert, TriangleAlert, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

export type ToastTone = 'ok' | 'warn' | 'alert' | 'info'

interface NotifyAction {
  label: string
  onClick: () => void
}

const TONE: Record<ToastTone, { icon: LucideIcon; color: string }> = {
  ok: { icon: CircleCheck, color: 'var(--tm-ok-fg)' },
  warn: { icon: TriangleAlert, color: 'var(--tm-warn-fg)' },
  alert: { icon: OctagonAlert, color: 'var(--tm-alert-fg)' },
  info: { icon: Info, color: 'var(--tm-accent)' },
}

/**
 * Fire a toast (§3.32): left edge state colour, leading icon, text, optional
 * action. Alerts last 8s and read assertively; others 4.2s. The card markup is
 * inlined (no exported component) so this stays a fast-refresh-safe module.
 */
export function notify(
  tone: ToastTone,
  message: string,
  options: { action?: NotifyAction; persistent?: boolean; id?: string } = {},
): void {
  const spec = TONE[tone]
  const Icon = spec.icon
  const { action } = options
  toast.custom(
    (id) => (
      <div
        className="flex min-w-[240px] max-w-[360px] items-center gap-2.5 border border-l-2 border-hairline bg-overlay px-3.5 py-2.5 text-body-sm text-ink shadow-md animate-[tw-pop_200ms_var(--ease-out)]"
        style={{ borderLeftColor: spec.color }}
      >
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" style={{ color: spec.color }} />
        <span className="flex-1">{message}</span>
        {action ? (
          <button
            type="button"
            onClick={() => {
              action.onClick()
              toast.dismiss(id)
            }}
            className="tm-touch rounded-none px-2 text-caption text-ink-muted hover:text-ink"
          >
            {action.label}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => toast.dismiss(id)}
          className="tm-touch grid size-7 place-items-center rounded-md text-ink-muted hover:bg-faint hover:text-ink"
        >
          <X size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    ),
    {
      id: options.id,
      duration: options.persistent ? Infinity : tone === 'alert' ? 8000 : 4200,
    },
  )
}

/** Dismiss a toast by id (used for the transient live-offline banner). */
export function dismissToast(id: string): void {
  toast.dismiss(id)
}
