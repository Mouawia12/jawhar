import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProductCard } from '@/components/cards'
import { PatternPanel } from '@/components/ornaments'
import { api } from '@/lib/api'
import { image } from '@/lib/media'
import { localeUrl } from '@/lib/site'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const artisan = await api.artisan(slug, locale)
  if (!artisan) return {}
  return { title: artisan.name, alternates: { canonical: localeUrl(locale, `/artisans/${slug}`) } }
}

/** Reachable only for artisans who consented — the API returns nothing otherwise. */
export default async function ArtisanPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const artisan = await api.artisan(slug, locale)
  if (!artisan) notFound()

  const [products, t] = await Promise.all([
    api.products({ locale, artisanId: artisan.id }),
    getTranslations({ locale, namespace: 'artisans' }),
  ])
  const portrait = image(artisan.portrait, 'large')
  const craft = typeof artisan.craft === 'object' && artisan.craft ? artisan.craft : null

  return (
    <div className="container-x pt-8 md:pt-14">
      <div className="grid gap-10 md:grid-cols-[minmax(0,24rem)_1fr] md:gap-16">
        <div className="frame self-start">
          <div className="frame-inner aspect-[3/4]">
            {portrait ? (
              <Image src={portrait.src} alt={portrait.alt || artisan.name} fill priority sizes="(min-width: 768px) 24rem, 100vw" className="object-cover" />
            ) : (
              <PatternPanel variant="stitch" />
            )}
          </div>
        </div>
        <div>
          <h1 className="display text-4xl md:text-6xl">{artisan.name}</h1>
          <p className="mt-2 text-lg text-ink-soft">{[craft?.title, artisan.region].filter(Boolean).join(' — ')}</p>
          <div className="stitch mt-5 w-32" aria-hidden="true" />
          {artisan.story ? (
            <div className="mt-6 max-w-[60ch] space-y-4 text-lg leading-loose">
              {artisan.story.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {products.length > 0 && (
        <section className="mt-20" aria-labelledby="pieces-title">
          <h2 id="pieces-title" className="display text-3xl md:text-4xl">
            {t('pieces')}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
