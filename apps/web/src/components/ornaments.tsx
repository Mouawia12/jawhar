/**
 * Decorative SVGs drawn from the three crafts. They stand in where a real photo is
 * missing and must never be mistaken for product photography.
 */
import { useId } from 'react'

export type PatternVariant = 'stitch' | 'weave' | 'dune'

/** Picks the motif of a craft from its slug: embroidery → stitch, palm → weave, sand → dune. */
export function variantFor(slug?: string | null, fallbackIndex = 0): PatternVariant {
  if (slug?.includes('palm') || slug?.includes('saaf')) return 'weave'
  if (slug?.includes('sand') || slug?.includes('raml')) return 'dune'
  if (slug?.includes('taqurt') || slug?.includes('embroid')) return 'stitch'
  return (['stitch', 'weave', 'dune'] as const)[fallbackIndex % 3]
}

export function Lozenge({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2.4" />
      <path d="M20 9 L24 13 L20 17 L16 13 Z M27 16 L31 20 L27 24 L23 20 Z M20 23 L24 27 L20 31 L16 27 Z M13 16 L17 20 L13 24 L9 20 Z" fill="currentColor" />
      <path d="M20 17.5 L22.5 20 L20 22.5 L17.5 20 Z" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

export function PatternPanel({
  variant,
  className,
  medallion = true,
}: {
  variant: PatternVariant
  className?: string
  medallion?: boolean
}) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`relative h-full w-full bg-linen ${className ?? ''}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          {variant === 'stitch' && (
            <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M7 7 L15 15 M15 7 L7 15" stroke="#b5653f" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
              <path d="M0 11 L4 11 M18 11 L22 11" stroke="#c9a267" strokeWidth="1.2" opacity="0.7" />
            </pattern>
          )}
          {variant === 'weave' && (
            <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M-7 7 L7 -7 M0 28 L28 0 M21 35 L35 21" stroke="#c9a267" strokeWidth="9" opacity="0.32" />
              <path d="M-7 21 L7 35 M0 0 L28 28 M21 -7 L35 7" stroke="#a88a52" strokeWidth="9" opacity="0.14" />
            </pattern>
          )}
          {variant === 'dune' && (
            <pattern id={id} width="96" height="22" patternUnits="userSpaceOnUse">
              <path d="M0 14 Q 24 2 48 12 T 96 10" fill="none" stroke="#c9a267" strokeWidth="1.6" opacity="0.75" />
              <path d="M0 21 Q 24 11 48 19 T 96 18" fill="none" stroke="#b5653f" strokeWidth="1" opacity="0.35" />
            </pattern>
          )}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      {medallion && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid aspect-square w-[38%] max-w-48 place-items-center rounded-full bg-ivory/85">
            <Lozenge className="w-1/2 text-gold-deep" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Three layers of sand, like a ترميل bottle seen from the side. Each layer drifts at its
 * own pace with the scroll (see .sand in globals.css). The front layer is linen, the
 * colour of the section below.
 */
export function SandLayers({ className }: { className?: string }) {
  const layer = 'absolute bottom-0 h-full w-[160%] start-[-30%]'
  return (
    <div data-drift aria-hidden="true" className={`sand relative h-16 overflow-hidden md:h-28 ${className ?? ''}`}>
      <svg viewBox="0 0 1600 100" preserveAspectRatio="none" className={layer}>
        <path d="M0 52 C 180 8, 360 10, 540 40 S 900 70, 1080 30 S 1420 6, 1600 36 L1600 100 L0 100 Z" className="fill-gold" opacity="0.55" />
      </svg>
      <svg viewBox="0 0 1600 100" preserveAspectRatio="none" className={layer}>
        <path d="M0 70 C 220 40, 420 44, 620 66 S 1000 86, 1220 56 S 1500 44, 1600 60 L1600 100 L0 100 Z" className="fill-clay" opacity="0.35" />
      </svg>
      <svg viewBox="0 0 1600 100" preserveAspectRatio="none" className={layer}>
        <path d="M0 84 C 260 62, 520 66, 780 82 S 1240 98, 1600 74 L1600 100 L0 100 Z" className="fill-linen" />
      </svg>
    </div>
  )
}

/** Soft sand-dune edge between two sections. `fill` is the colour of the section below. */
export function Dune({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={`block h-10 w-full md:h-16 ${flip ? 'rotate-180' : ''} ${className ?? ''}`}
      aria-hidden="true"
    >
      <path d="M0 44 C 200 6, 420 6, 640 30 S 1080 64, 1440 18 L1440 64 L0 64 Z" fill="currentColor" />
    </svg>
  )
}
