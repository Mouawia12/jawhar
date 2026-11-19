import { Lozenge } from './ornaments'

/** Wordmark: «جوهر» in Amiri + JAWHAR in Cormorant, with the stitched lozenge. */
export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`} dir="rtl">
      <Lozenge className={`h-8 w-8 shrink-0 ${inverted ? 'text-gold' : 'text-gold-deep'}`} />
      <span className="flex flex-col items-center leading-none">
        <span className="font-[family-name:var(--font-amiri)] text-[1.7rem] font-bold leading-[1.1]">جوهر</span>
        <span
          className={`font-[family-name:var(--font-cormorant)] text-[0.72rem] font-semibold tracking-[0.42em] ${inverted ? 'text-gold' : 'text-gold-deep'}`}
          dir="ltr"
        >
          JAWHAR
        </span>
      </span>
    </span>
  )
}
