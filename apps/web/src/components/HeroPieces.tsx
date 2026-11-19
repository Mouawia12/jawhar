'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'

import { DemoBadge } from './cards'

export type HeroPiece = {
  href: string
  title: string
  price: string
  img: { src: string; alt: string } | null
  isDemo: boolean
}

const DURATION = 5000

/**
 * A small card hanging off the hero photo that cycles through the pieces on sale.
 * It holds still while hovered or focused, can be paused, and does not cycle at all
 * for visitors who prefer reduced motion.
 */
export function HeroPieces({ pieces }: { pieces: HeroPiece[] }) {
  const t = useTranslations('hero')
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const [still, setStill] = useState(true)

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const cycles = pieces.length > 1 && !still
  const running = cycles && !paused && !held

  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => setIndex((n) => (n + 1) % pieces.length), DURATION)
    return () => window.clearTimeout(id)
  }, [running, index, pieces.length])

  const piece = pieces[index]
  if (!piece) return null

  return (
    <div
      className="relative w-[17.5rem] max-w-[calc(100vw-4rem)] rounded-md bg-ivory p-2.5 pe-3 shadow-[0_18px_40px_-18px_rgba(59,42,32,0.55)] ring-1 ring-gold/50"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false)
      }}
    >
      <Link key={piece.href} href={piece.href} className="piece-in group flex items-center gap-3">
        <span className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-sm bg-linen">
          {piece.img ? <Image src={piece.img.src} alt="" fill sizes="3.5rem" className="object-cover" /> : null}
        </span>
        <span className={`min-w-0 flex-1 ${cycles ? 'pe-6' : ''}`}>
          <span className="display block truncate text-lg leading-snug decoration-gold decoration-2 underline-offset-4 group-hover:underline">
            {piece.title}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold tabular-nums">{piece.price}</span>
            {piece.isDemo ? <DemoBadge /> : null}
          </span>
        </span>
      </Link>

      {cycles ? (
        <>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? t('play') : t('pause')}
            className="absolute end-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-linen hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              {paused ? <path d="M8 5v14l11-7z" fill="currentColor" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />}
            </svg>
          </button>
          <div className="absolute inset-x-3 bottom-1 h-[2px] overflow-hidden" aria-hidden="true">
            {running ? (
              <div
                key={index}
                className="progress-stitch stitch h-full w-full"
                style={{ '--dur': `${DURATION}ms` } as React.CSSProperties}
              />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
