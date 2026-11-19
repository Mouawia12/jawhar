import { formatDZD } from '@jawhar/shared'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AvailabilityNote, DemoBadge } from '@/components/cards'
import { OrderForm, type WilayaOption } from '@/components/OrderForm'
import { variantFor } from '@/components/ornaments'
import { ProductGallery } from '@/components/ProductGallery'
import { ShareButton } from '@/components/ShareButton'
import { Link } from '@/i18n/navigation'
import { api, API_URL } from '@/lib/api'
import { image, images, video } from '@/lib/media'
import { localeUrl, whatsappLink } from '@/lib/site'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await api.product(slug, locale)
  if (!product) return {}
  const og = image(product.images?.[0], 'og')
  const description = product.seo?.description || product.shortDescription || undefined
  return {
    title: product.seo?.title || product.title,
    description,
    alternates: { canonical: localeUrl(locale, `/p/${slug}`), languages: { ar: localeUrl('ar', `/p/${slug}`), fr: localeUrl('fr', `/p/${slug}`) } },
    openGraph: { title: product.title, description, images: og ? [{ url: og.src, width: og.width, height: og.height, alt: og.alt }] : [] },
    robots: product.isDemo ? { index: false } : undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [product, settings, wilayas, t] = await Promise.all([
    api.product(slug, locale),
    api.settings(locale),
    api.wilayas(locale),
    getTranslations({ locale, namespace: 'product' }),
  ])
  if (!product) notFound()

  const category = typeof product.category === 'object' ? product.category : null
  const artisan = typeof product.artisan === 'object' && product.artisan ? product.artisan : null
  const url = localeUrl(locale, `/p/${product.slug}`)
  const askHref = whatsappLink(settings, t('askMessage', { title: product.title }))
  const soldOut = product.availability === 'sold_out'
  const canOrder = settings?.ordersEnabled !== false && !soldOut
  const maxQuantity = product.availability === 'made_to_order' ? 5 : Math.max(1, product.stock ?? 1)

  const details = [
    { label: t('materials'), value: product.details?.materials },
    { label: t('dimensions'), value: product.details?.dimensions },
    { label: t('origin'), value: product.details?.origin },
    product.availability === 'made_to_order' && product.prepDays
      ? { label: t('prepTime'), value: t('prepValue', { days: product.prepDays }) }
      : null,
    { label: t('technique'), value: product.details?.technique },
    { label: t('care'), value: product.details?.care },
  ].filter((d): d is { label: string; value: string } => Boolean(d?.value))

  const wilayaOptions: WilayaOption[] = wilayas.map((w) => ({
    code: w.code,
    nameAr: w.nameAr,
    nameFr: w.nameFr,
    homePrice: w.homePrice ?? null,
    stopDeskPrice: w.stopDeskPrice ?? null,
    deliveryTime: w.deliveryTime ?? null,
    isDemo: Boolean(w.isDemo),
  }))

  const jsonLd = product.isDemo
    ? null
    : {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.shortDescription ?? product.description ?? undefined,
        image: images(product.images, 'large').map((i) => i.src),
        brand: { '@type': 'Brand', name: 'JAWHAR' },
        category: category?.title,
        offers: {
          '@type': 'Offer',
          url,
          price: product.price,
          priceCurrency: 'DZD',
          availability: {
            in_stock: 'https://schema.org/InStock',
            made_to_order: 'https://schema.org/MadeToOrder',
            sold_out: 'https://schema.org/SoldOut',
          }[product.availability],
        },
      }

  return (
    <article className="container-x pt-6 md:pt-10">
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      ) : null}

      <nav aria-label="breadcrumb" className="text-sm text-ink-soft">
        <Link href="/" className="hover:text-ink">
          {locale === 'ar' ? 'الرئيسية' : 'Accueil'}
        </Link>
        {category ? (
          <>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href={`/crafts/${category.slug}`} className="hover:text-ink">
              {category.title}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery
            title={product.title}
            images={images(product.images, 'large')}
            thumbs={images(product.images, 'thumbnail')}
            video={video(product.video)}
            fallback={variantFor(category?.slug)}
            dimmed={soldOut}
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            {category ? <span className="text-gold-deep">{category.title}</span> : null}
            {product.isDemo ? <DemoBadge /> : null}
          </div>
          <h1 className="enter display mt-1 text-4xl md:text-5xl">{product.title}</h1>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-2xl font-bold tabular-nums md:text-3xl">{formatDZD(product.price, locale)}</span>
            {product.availability === 'in_stock' && product.stock === 1 ? <span className="text-gold-deep">{t('unique')}</span> : null}
            <AvailabilityNote product={product} />
            {product.availability === 'made_to_order' && product.prepDays ? (
              <span className="text-ink-soft">{t('prep', { days: product.prepDays })}</span>
            ) : null}
          </p>
          {product.isDemo ? <p className="hint mt-3 rounded-md border border-dashed border-gold-deep px-4 py-2">{t('demoText')}</p> : null}
          {product.shortDescription && !product.isDemo ? <p className="mt-5 max-w-[52ch] text-lg">{product.shortDescription}</p> : null}

          <div className="stitch my-8" aria-hidden="true" />

          {canOrder ? (
            <OrderForm
              apiUrl={API_URL}
              product={{ id: product.id, title: product.title, price: product.price, maxQuantity }}
              wilayas={wilayaOptions}
              whatsappHref={askHref}
            />
          ) : (
            <div className="rounded-md bg-linen px-5 py-5">
              <p className="display text-2xl">{soldOut ? t('soldOut') : ''}</p>
              {soldOut ? <p className="mt-1 text-ink-soft">{t('soldOutText')}</p> : null}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4">
            {askHref ? (
              <a href={askHref} target="_blank" rel="noopener" className="btn btn-quiet w-full">
                {t('ask')}
              </a>
            ) : null}
            <ShareButton title={product.title} url={url} />
          </div>
        </div>
      </div>

      {/* ── Story, details, artisan ─────────────────────────── */}
      <div className="mt-20 grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="space-y-12">
          {product.story ? (
            <section aria-labelledby="story-title">
              <h2 id="story-title" className="display text-3xl md:text-4xl">
                {t('story')}
              </h2>
              <div className="mt-4 max-w-[60ch] space-y-4 text-lg leading-loose">
                {product.story.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ) : null}
          {product.description && product.description !== product.story ? (
            <div className="max-w-[60ch] space-y-4">
              {product.description.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-12">
          {details.length > 0 && (
            <section aria-labelledby="details-title">
              <h2 id="details-title" className="display text-3xl">
                {t('details')}
              </h2>
              <dl className="mt-4">
                {details.map((d) => (
                  <div key={d.label} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-dashed border-gold/70 py-3">
                    <dt className="text-ink-soft">{d.label}</dt>
                    <dd className="whitespace-pre-line">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {artisan ? (
            <section aria-labelledby="artisan-title" className="flex gap-5">
              {image(artisan.portrait, 'thumbnail') ? (
                <div className="frame w-24 shrink-0 self-start">
                  <div className="frame-inner aspect-[3/4]">
                    <Image src={image(artisan.portrait, 'thumbnail')!.src} alt={artisan.name} fill sizes="6rem" className="object-cover" />
                  </div>
                </div>
              ) : null}
              <div>
                <h2 id="artisan-title" className="text-ink-soft">
                  {t('artisan')}
                </h2>
                <p className="display text-2xl">{artisan.name}</p>
                {artisan.region ? <p className="text-ink-soft">{artisan.region}</p> : null}
                <Link href={`/artisans/${artisan.slug}`} className="mt-2 inline-block font-semibold text-clay-strong underline decoration-gold decoration-dashed decoration-2 underline-offset-8">
                  {locale === 'ar' ? 'اكتشف الحكاية' : 'Lire son histoire'}
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  )
}
