import { formatDZD } from '@jawhar/shared'
import type { Category, Product } from '@jawhar/shared/payload-types'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { image } from '@/lib/media'

import { Credit } from './Credit'
import { PatternPanel, variantFor } from './ornaments'

export function DemoBadge() {
  const t = useTranslations('product')
  return (
    <span className="inline-block rounded-full border border-dashed border-gold-deep px-2.5 text-xs font-semibold leading-6 text-gold-deep">
      {t('demo')}
    </span>
  )
}

export function AvailabilityNote({ product }: { product: Pick<Product, 'availability' | 'prepDays'> }) {
  const t = useTranslations('product')
  if (product.availability === 'in_stock') return null
  return (
    <span className={product.availability === 'sold_out' ? 'text-ink-soft line-through decoration-gold' : 'text-gold-deep'}>
      {t(`availability.${product.availability}`)}
    </span>
  )
}

export function ProductCard({ product, locale, priority = false }: { product: Product; locale: string; priority?: boolean }) {
  const img = image(product.images?.[0], 'card')
  const second = image(product.images?.[1], 'card')
  const soldOut = product.availability === 'sold_out'
  const category = typeof product.category === 'object' ? product.category : null
  return (
    <Link href={`/p/${product.slug}`} className="group block">
      <div className="frame">
        <div className="frame-inner aspect-[4/5]">
          {img ? (
            <>
              <Image
                src={img.src}
                alt={img.alt || product.title}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
                className={`zoom object-cover ${soldOut ? 'opacity-70 grayscale-[35%]' : ''}`}
              />
              {/* On hover, the second photo of the piece shows through. */}
              {second && !soldOut ? (
                <Image src={second.src} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw" className="zoom swap object-cover" />
              ) : null}
            </>
          ) : (
            <PatternPanel variant={variantFor(category?.slug)} />
          )}
        </div>
      </div>
      <div className="mt-3 space-y-0.5 px-1">
        <h3 className="display text-lg leading-snug decoration-gold decoration-2 underline-offset-[6px] group-hover:underline md:text-xl">
          {product.title}
        </h3>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem]">
          <span className="font-semibold tabular-nums">{formatDZD(product.price, locale)}</span>
          <AvailabilityNote product={product} />
          {product.isDemo ? <DemoBadge /> : null}
        </p>
      </div>
    </Link>
  )
}

export function CategoryCard({ category, index }: { category: Category; index: number }) {
  const t = useTranslations('crafts')
  const img = image(category.cover, 'card')
  return (
    <Link href={`/crafts/${category.slug}`} className="group block">
      <div className="frame">
        <div className="frame-inner aspect-[3/4]">
          {img ? (
            <Image src={img.src} alt={img.alt || category.title} fill sizes="(min-width: 768px) 30vw, 90vw" className="zoom object-cover" />
          ) : (
            <PatternPanel variant={variantFor(category.slug, index)} />
          )}
        </div>
      </div>
      <Credit img={img} className="px-1" link={false} />
      <div className="mt-3 px-1">
        <h3 className="display text-2xl md:text-[1.75rem]">{category.title}</h3>
        {category.intro ? <p className="mt-1 max-w-[42ch] text-ink-soft">{category.intro}</p> : null}
        <span className="mt-2 inline-block font-semibold text-clay-strong underline decoration-gold decoration-dashed decoration-2 underline-offset-8 group-hover:text-ink">
          {t('see')}
        </span>
      </div>
    </Link>
  )
}
