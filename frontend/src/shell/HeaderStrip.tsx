import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { useScrollContainer } from './scrollContext'

export interface HeaderStripProps {
  title: string
  /** Inline meta beside the title (e.g. state counts). */
  meta?: ReactNode
  /** Right-aligned slot (e.g. last-probe + live dot). */
  right?: ReactNode
  /** Chips row — unmounts on scroll-condense (§2). */
  children?: ReactNode
}

/**
 * The per-screen sticky, self-condensing header strip (§2). Expanded 76px;
 * scroll-condensed (scrollTop > 40) to 45px with the chips row unmounting.
 */
export function HeaderStrip({ title, meta, right, children }: HeaderStripProps): React.JSX.Element {
  const scrollRef = useScrollContainer()
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    const el = scrollRef?.current
    if (!el) return
    const onScroll = (): void => setCondensed(el.scrollTop > 40)
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  return (
    <header
      className="sticky top-0 z-[5] border-b border-hairline backdrop-blur-[8px]"
      style={{ background: 'color-mix(in srgb, var(--tm-bg-canvas) 88%, transparent)' }}
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-1 px-[var(--tm-pad)] transition-[padding] duration-slow ease-out',
          condensed ? 'py-[8px]' : 'py-[16px]',
        )}
      >
        <h1
          className={cn(
            'font-display text-ink transition-[font-size] duration-slow ease-out',
            condensed ? 'text-[20px]' : 'text-h1',
          )}
        >
          {title}
        </h1>
        {meta ? <div className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">{meta}</div> : null}
        {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
      </div>
      <AnimatePresence initial={false}>
        {!condensed && children ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="px-[var(--tm-pad)] pb-3"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
