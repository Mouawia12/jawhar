'use client'

import { useLocale, useTranslations } from 'next-intl'

import { getPathname, usePathname } from '@/i18n/navigation'

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const target = locale === 'ar' ? 'fr' : 'ar'
  // A plain link on purpose: switching language reloads the page, since direction,
  // fonts and every string change at once.
  return (
    <a
      href={getPathname({ href: pathname, locale: target })}
      lang={target}
      hrefLang={target}
      aria-label={t('switchLabel')}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-linen ${className ?? ''}`}
    >
      {t('switchTo')}
    </a>
  )
}
