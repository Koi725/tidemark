import { clsx, type ClassValue } from 'clsx'

/**
 * Merge conditional class values into a single className string. Thin wrapper over
 * clsx so call sites depend on `@/lib/cn` rather than the vendor directly.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
