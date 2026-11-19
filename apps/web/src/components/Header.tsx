import type { Category } from '@jawhar/shared/payload-types'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { LocaleSwitcher } from './LocaleSwitcher'
import { Logo } from './Logo'

export function Header({ categories }: { categories: Category[] }) {
  const t = useTranslations('nav')
  return (
    <header className="site-header sticky top-0 z-30 border-b border-dashed border-gold/70 bg-ivory">
      <div className="container-x grid h-18 grid-cols-[1fr_auto_1fr] items-center gap-3 md:h-20">
        {/* Start: menu (mobile) / crafts (desktop) */}
        <div className="flex items-center">
          <details className="group relative md:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-linen [&::-webkit-details-marker]:hidden">
              <span className="sr-only">{t('menu')}</span>
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </summary>
            <nav className="absolute start-0 top-12 w-64 rounded-md border border-dashed border-gold bg-ivory p-2 shadow-[0_12px_30px_-12px_rgba(59,42,32,0.35)]">
              <Link href="/" className="block rounded px-3 py-2.5 hover:bg-linen">
                {t('home')}
              </Link>
              <p className="px-3 pt-2 text-sm text-ink-soft">{t('crafts')}</p>
              {categories.map((c) => (
                <Link key={c.id} href={`/crafts/${c.slug}`} className="block rounded px-3 py-2.5 hover:bg-linen">
                  {c.title}
                </Link>
              ))}
            </nav>
          </details>
          <nav className="hidden items-center gap-1 md:flex" aria-label={t('crafts')}>
            {categories.map((c) => (
              <Link key={c.id} href={`/crafts/${c.slug}`} className="navlink px-3 py-1.5 text-[0.95rem]">
                {c.title}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" aria-label={t('home')} className="justify-self-center">
          <Logo />
        </Link>

        <div className="flex items-center justify-end">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  )
}
