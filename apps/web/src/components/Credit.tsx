import { useTranslations } from 'next-intl'

import type { Img } from '@/lib/media'

/** Photo credit under an image (required for CC BY-SA photos; optional for own photos). */
export function Credit({
  img,
  className,
  link = true,
}: {
  img: Pick<Img, 'credit' | 'creditUrl'> | null | undefined
  className?: string
  /** false inside another link (e.g. a card), where a nested <a> is invalid HTML. */
  link?: boolean
}) {
  const t = useTranslations('product')
  if (!img?.credit) return null
  const text = t('photoCredit', { credit: img.credit })
  return (
    <p className={`mt-1.5 text-[0.75rem] leading-snug text-ink-soft ${className ?? ''}`}>
      {link && img.creditUrl ? (
        <a href={img.creditUrl} target="_blank" rel="noopener license" className="underline decoration-dotted underline-offset-2 hover:text-ink">
          {text}
        </a>
      ) : (
        text
      )}
    </p>
  )
}
