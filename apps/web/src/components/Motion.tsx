'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Drives the scroll motion styled in globals.css:
 * - data-scrolled on <html> once the page leaves the top (frosted header);
 * - --p on every [data-drift] element: 0 as it enters the viewport, 1 as it leaves;
 * - data-shown on every [data-reveal] element the first time it scrolls into view.
 * Re-runs on each navigation so new pages are picked up.
 */
export function Motion() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-motion-ready', '')
    const animated = root.hasAttribute('data-motion')
    const drifts = animated ? Array.from(document.querySelectorAll<HTMLElement>('[data-drift]')) : []

    let frame = 0
    const update = () => {
      frame = 0
      root.toggleAttribute('data-scrolled', window.scrollY > 16)
      const vh = window.innerHeight
      for (const el of drifts) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) continue
        const p = (vh - r.top) / (vh + r.height)
        el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4))
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    let io: IntersectionObserver | undefined
    if (animated) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.setAttribute('data-shown', '')
            observer.unobserve(entry.target)
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      )
      document.querySelectorAll('[data-reveal]:not([data-shown])').forEach((el) => observer.observe(el))
      io = observer
    }

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
      io?.disconnect()
    }
  }, [pathname])

  return null
}
