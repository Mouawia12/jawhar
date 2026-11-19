import type { Category, Setting } from '@jawhar/shared/payload-types'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { socialLinks, whatsappLink } from '@/lib/site'

import { Logo } from './Logo'
import { Dune } from './ornaments'

export function Footer({ categories, settings }: { categories: Category[]; settings: Setting | null }) {
  const t = useTranslations('footer')
  const wa = whatsappLink(settings)
  const socials = socialLinks(settings)
  return (
    <footer className="mt-24">
      <Dune className="text-ink" />
      <div className="bg-ink pb-10 pt-6 text-ivory [--stitch:var(--color-gold)]">
        <div className="container-x grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo inverted />
            <p className="mt-4 max-w-[46ch] text-ivory/80">{t('about')}</p>
          </div>
          <div>
            <h2 className="display text-xl text-gold">{t('crafts')}</h2>
            <ul className="mt-3 space-y-1.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/crafts/${c.slug}`} className="hover:text-gold">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {wa || settings?.email || settings?.phone || socials.length ? (
            <div>
              <h2 className="display text-xl text-gold">{t('contact')}</h2>
              <ul className="mt-3 space-y-1.5">
                {wa ? (
                  <li>
                    <a href={wa} className="hover:text-gold" target="_blank" rel="noopener">
                      {t('whatsapp')}
                    </a>
                  </li>
                ) : null}
                {settings?.phone ? (
                  <li>
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} dir="ltr" className="hover:text-gold">
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings?.email ? (
                  <li>
                    <a href={`mailto:${settings.email}`} className="hover:text-gold">
                      {settings.email}
                    </a>
                  </li>
                ) : null}
                {socials.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} className="hover:text-gold" target="_blank" rel="noopener">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="container-x mt-10">
          <div className="stitch opacity-60" />
          <p className="mt-4 text-sm text-ivory/70">{t('rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
