import { cn } from '@/lib/cn'

export interface WizardStepperProps {
  steps: string[]
  /** Zero-based current step. */
  current: number
  variant?: 'bars' | 'labelled'
}

/** Wizard progress (§3.17). role=progressbar; not clickable. */
export function WizardStepper({
  steps,
  current,
  variant = 'bars',
}: WizardStepperProps): React.JSX.Element {
  const common = {
    role: 'progressbar' as const,
    'aria-label': 'Progress',
    'aria-valuemin': 1,
    'aria-valuemax': steps.length,
    'aria-valuenow': current + 1,
    'aria-valuetext': `Step ${current + 1} of ${steps.length}, ${steps[current] ?? ''}`,
  }

  if (variant === 'labelled') {
    return (
      <div className="flex gap-1.5" {...common}>
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1">
            <span
              className="h-[2px]"
              style={{ background: i <= current ? 'var(--tm-accent)' : 'var(--tm-border-hairline)' }}
            />
            <span
              className={cn(
                'text-label font-display uppercase tracking-[.1em]',
                i === current ? 'text-tide' : 'text-ink-muted',
              )}
            >
              {String(i + 1).padStart(2, '0')} · {label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-1" {...common}>
      {steps.map((label, i) => (
        <span
          key={label}
          className="h-[3px] w-[22px]"
          style={{ background: i <= current ? 'var(--tm-accent)' : 'var(--tm-border-hairline)' }}
        />
      ))}
    </div>
  )
}
