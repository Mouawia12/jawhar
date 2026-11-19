import { formatDZD } from '@jawhar/shared'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CategoryCard, ProductCard } from '@/components/cards'
import { CraftBand } from '@/components/CraftBand'
import { Credit } from '@/components/Credit'
import { type HeroPiece, HeroPieces } from '@/components/HeroPieces'
import { Dune, Lozenge, PatternPanel, SandLayers } from '@/components/ornaments'
import { SectionHeading } from '@/components/SectionHeading'
import { TrustList } from '@/components/TrustList'
import { Link } from '@/i18n/navigation'
import { api } from '@/lib/api'
import { image } from '@/lib/media'
import { stagger } from '@/lib/motion'
import { socialLinks, whatsappLink } from '@/lib/site'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, categories, featured, artisans, wilayas, t] = await Promise.all([
    api.settings(locale),
    api.categories(locale),
    api.products({ locale, featured: true, limit: 8 }),
    api.artisans(locale),
    api.wilayas(locale),
    getTranslations({ locale }),
  ])

  const hero = image(settings?.heroImage, 'large')
  featured.sort((a, b) => Number(a.availability === 'sold_out') - Number(b.availability === 'sold_out'))
  const socials = socialLinks(settings)

  // The card on the hero photo cycles through pieces that can actually be ordered.
  const pieces: HeroPiece[] = featured
    .filter((p) => p.availability !== 'sold_out')
    .slice(0, 5)
    .map((p) => {
      const img = image(p.images?.[0], 'thumbnail')
      return {
        href: `/p/${p.slug}`,
        title: p.title,
        price: formatDZD(p.price, locale),
        img: img ? { src: img.src, alt: img.alt } : null,
        isDemo: Boolean(p.isDemo),
      }
    })

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="container-x grid items-center gap-10 pb-6 pt-8 md:grid-cols-[1.05fr_1fr] md:gap-16 md:pt-16">
        <div className="order-2 md:order-1">
          <h1 className="display text-[2.5rem] text-ink sm:text-5xl xl:text-[4.4rem]">
            {/* Break after the ellipsis: «حرفٌ من الصحراء...» / «بأيدٍ جزائرية» */}
            {t('hero.title')
              .split(/(?<=\.\.\.)\s+/)
              .map((line, i) => (
                <span key={line} className="enter block" style={stagger(i)}>
                  {line}
                </span>
              ))}
          </h1>
          <div className="sew stitch mt-6 w-40 md:w-56" aria-hidden="true" />
          <p className="enter mt-6 max-w-[44ch] text-lg text-ink-soft md:text-xl" style={stagger(3)}>
            {t('hero.text')}
          </p>
          <div className="enter mt-8 flex flex-wrap gap-3" style={stagger(4)}>
            <a href={featured.length ? '#pieces' : '#crafts'} className="btn btn-primary">
              {t('hero.primary')}
            </a>
            <a href="#crafts" className="btn btn-quiet">
              {t('hero.secondary')}
            </a>
          </div>
        </div>
        <div data-drift className="enter-photo relative order-1 md:order-2">
          <div className="frame">
            <div className="frame-inner aspect-[4/3] md:aspect-[5/6]">
              {hero ? (
                <div className="drift-photo absolute inset-x-0 inset-y-[-8%]">
                  <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                </div>
              ) : (
                <PatternPanel variant="weave" />
              )}
            </div>
          </div>
          {pieces.length > 0 ? (
            // Phone: overlaps the bottom edge of the photo. Desktop: hangs off its side, toward the headline.
            <div className="enter relative z-10 -mt-12 ms-4 md:absolute md:bottom-16 md:-start-14 md:mt-0 md:ms-0" style={stagger(6)}>
              <HeroPieces pieces={pieces} />
            </div>
          ) : null}
          <Credit img={hero} className="text-end" />
        </div>
      </section>

      <CraftBand categories={categories} />

      {/* ── Crafts ───────────────────────────────────────────── */}
      <section id="crafts" aria-labelledby="crafts-title" className="container-x scroll-mt-24 pt-16 md:pt-24">
        <SectionHeading id="crafts-title">{t('crafts.title')}</SectionHeading>
        {/* A gallery wall: the middle piece hangs lower and drifts against the scroll. */}
        <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-8">
          {categories.map((c, i) => {
            const middle = i % 3 === 1
            return (
              <div key={c.id} data-drift={middle ? '' : undefined} className={middle ? 'drift-lift md:mt-20' : undefined}>
                <div data-reveal="unveil" style={stagger(i)}>
                  <CategoryCard category={c} index={i} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Artisans (only real, consented stories) ─────────── */}
      {artisans.length > 0 && (
        <section aria-labelledby="artisans-title" className="container-x mt-24">
          <SectionHeading id="artisans-title">{t('artisans.title')}</SectionHeading>
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            {artisans.slice(0, 2).map((a, i) => {
              const portrait = image(a.portrait, 'card')
              return (
                <article key={a.id} data-reveal="unveil" style={stagger(i)} className="grid grid-cols-[7.5rem_1fr] gap-5 sm:grid-cols-[10rem_1fr]">
                  <div className="frame self-start">
                    <div className="frame-inner aspect-[3/4]">
                      {portrait ? (
                        <Image src={portrait.src} alt={portrait.alt || a.name} fill sizes="10rem" className="object-cover" />
                      ) : (
                        <PatternPanel variant="stitch" medallion={false} />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="display text-2xl">{a.name}</h3>
                    {a.region ? <p className="text-ink-soft">{a.region}</p> : null}
                    {a.story ? <p className="mt-3 line-clamp-3">{a.story}</p> : null}
                    <Link href={`/artisans/${a.slug}`} className="mt-3 inline-block font-semibold text-clay-strong underline decoration-gold decoration-dashed decoration-2 underline-offset-8">
                      {t('artisans.cta')}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Featured pieces (hidden until real pieces exist) ── */}
      {featured.length > 0 && (
        <section id="pieces" aria-labelledby="pieces-title" className="container-x mt-24 scroll-mt-24">
          <SectionHeading id="pieces-title">{t('featured.title')}</SectionHeading>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 lg:grid-cols-4">
            {featured.map((p, i) => (
              <div key={p.id} data-reveal="unveil" style={stagger(i % 4)}>
                <ProductCard product={p} locale={locale} priority={i < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section aria-labelledby="philosophy-title" className="mt-24">
        <SandLayers />
        <div className="bg-linen py-16 md:py-24">
          <div data-reveal className="container-x mx-auto max-w-3xl text-center">
            <Lozenge className="spin-in mx-auto h-10 w-10 text-gold-deep" />
            <h2 id="philosophy-title" className="display mt-5 text-3xl md:text-5xl">
              {t('philosophy.title')}
            </h2>
            <p className="display mx-auto mt-6 max-w-[38ch] text-xl font-normal leading-loose md:text-2xl md:leading-loose">
              {t('philosophy.text')}
            </p>
          </div>
        </div>
        <Dune className="text-linen" flip />
      </section>

      <TrustList activeWilayas={wilayas.length} hasWhatsapp={Boolean(whatsappLink(settings))} />

      {/* ── Social (only if links are set) ───────────────────── */}
      {socials.length > 0 && (
        <section aria-labelledby="social-title" className="container-x mt-24">
          <div className="stitch" aria-hidden="true" />
          <div data-reveal className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="social-title" className="display text-3xl md:text-4xl">
                {t('social.title')}
              </h2>
              <p className="mt-2 text-ink-soft">{t('social.text')}</p>
            </div>
            <ul className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener" className="btn btn-quiet">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="stitch" aria-hidden="true" />
        </section>
      )}
    </>
  )
}
