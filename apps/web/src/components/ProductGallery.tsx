'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { Img } from '@/lib/media'

import { Credit } from './Credit'
import { PatternPanel, type PatternVariant } from './ornaments'

type Props = {
  title: string
  images: Img[]
  thumbs: Img[]
  video: { src: string; type: string } | null
  fallback: PatternVariant
  dimmed?: boolean
}

export function ProductGallery({ title, images, thumbs, video, fallback, dimmed }: Props) {
  const t = useTranslations('product')
  const [active, setActive] = useState(0) // index in images; images.length = the video
  const showingVideo = video !== null && active === images.length
  const current = images[active]

  return (
    <div>
      <div className="frame">
        <div className="frame-inner aspect-[4/5]">
          {showingVideo ? (
            <video
              className="h-full w-full object-cover"
              controls
              playsInline
              autoPlay
              preload="none"
              poster={images[0]?.src}
              aria-label={`${title} — ${t('video')}`}
            >
              <source src={video.src} type={video.type} />
            </video>
          ) : current ? (
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt || title}
              fill
              priority={active === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={`fade-in object-cover ${dimmed ? 'opacity-75 grayscale-[35%]' : ''}`}
            />
          ) : (
            <div className="relative h-full">
              <PatternPanel variant={fallback} />
              <p className="absolute inset-x-0 bottom-6 text-center text-ink-soft">{t('noPhoto')}</p>
            </div>
          )}
        </div>
      </div>
      {!showingVideo && <Credit img={current} />}

      {thumbs.length + (video ? 1 : 0) > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {thumbs.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t('showPhoto', { n: i + 1 })}
              aria-pressed={active === i}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border-2 ${active === i ? 'border-clay-strong' : 'border-transparent opacity-80 hover:opacity-100'}`}
            >
              <Image src={img.src} alt="" fill sizes="4rem" className="object-cover" />
            </button>
          ))}
          {video && (
            <button
              type="button"
              onClick={() => setActive(images.length)}
              aria-label={t('showVideo')}
              aria-pressed={showingVideo}
              className={`grid h-20 w-16 shrink-0 place-items-center rounded-sm border-2 bg-ink text-ivory ${showingVideo ? 'border-clay-strong' : 'border-transparent'}`}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
              <span className="text-xs">{t('video')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
