import { Segmented } from '@/components/primitives'
import type { TimeRange } from '@/mocks'

const OPTIONS = [
  { value: '1h', label: '1h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
] as const

export interface TimeRangePickerProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  /** Full-width segmented control (mobile). */
  fill?: boolean
}

/** Segmented 1h · 24h · 7d · 30d range control (§3.10). */
export function TimeRangePicker({ value, onChange, fill }: TimeRangePickerProps): React.JSX.Element {
  return (
    <Segmented
      ariaLabel="Time range"
      value={value}
      onValueChange={(next) => onChange(next as TimeRange)}
      options={OPTIONS}
      fill={fill}
    />
  )
}
