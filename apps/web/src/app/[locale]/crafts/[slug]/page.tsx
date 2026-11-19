import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProductCard } from '@/components/cards'
import { Credit } from '@/components/Credit'
import { PatternPanel, variantFor } from '@/components/ornaments'
import { Link } from '@/i18n/navigation'
import { api } from '@/lib/api'
import { image } from '@/lib/media'
import { stagger } from '@/lib/motion'
import { localeUrl, socialLinks, whatsappLink } from '@/lib/site'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await api.category(slug, locale)
  if (!category) return {}
  return {
    title: category.seo?.title || category.title,
    description: category.seo?.description || category.intro || undefined,
    alternates: {
      canonical: localeUrl(locale, `/crafts/${slug}`),
      languages: { ar: localeUrl('ar', `/crafts/${slug}`), fr: localeUrl('fr', `/crafts/${slug}`) },
    },
  }
}

export default async function CraftPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const category = await api.category(slug, locale)
  if (!category) notFound()

  const [products, settings, t] = await Promise.all([
    api.products({ locale, categoryId: category.id }),
    api.settings(locale),
    getTranslations({ locale, namespace: 'crafts' }),
  ])
  const cover = image(category.cover, 'large')
  products.sort((a, b) => Number(a.availability === 'sold_out') - Number(b.availability === 'sold_out'))
  const wa = whatsappLink(settings)
  const socials = socialLinks(settings)

  return (
    <div className="container-x pt-8 md:pt-14">
      <header className="grid items-end gap-8 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-14">
        <div>
          <Link href="/#crafts" className="text-sm text-ink-soft hover:text-ink">
            {t('back')}
          </Link>
          <h1 className="enter display mt-2 text-4xl md:text-6xl">{category.title}</h1>
          <div className="sew stitch mt-5 w-32" aria-hidden="true" />
          {category.intro ? (
            <p className="enter mt-5 max-w-[52ch] text-lg text-ink-soft" style={stagger(2)}>
              {category.intro}
            </p>
          ) : null}
        </div>
        <div className="enter-photo hidden md:block">
          <div className="frame">
            <div className="frame-inner aspect-[4/3]">
              {cover ? (
                <Image src={cover.src} alt={cover.alt || category.title} fill priority sizes="22rem" className="object-cover" />
              ) : (
                <PatternPanel variant={variantFor(category.slug)} medallion={false} />
              )}
            </div>
          </div>
          <Credit img={cover} />
        </div>
      </header>

      {products.length > 0 ? (
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 lg:grid-cols-3">
          {products.map((p, i) => (
            <div key={p.id} data-reveal="unveil" style={stagger(i % 3)}>
              <ProductCard product={p} locale={locale} priority={i < 2} />
            </div>
          ))}
        </div>
      ) : (
        <section className="mt-14 rounded-md border border-dashed border-gold px-6 py-10 text-center">
          <p className="display text-2xl md:text-3xl">{t('empty')}</p>
          <p className="mt-2 text-ink-soft">{t('emptyHint')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener" className="btn btn-primary">
                WhatsApp
              </a>
            ) : null}
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener" className="btn btn-quiet">
                {s.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
