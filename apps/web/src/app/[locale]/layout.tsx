import '../globals.css'

import { isRTL } from '@jawhar/shared'
import type { Metadata, Viewport } from 'next'
import { Amiri, Cairo, Cormorant_Garamond, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Motion } from '@/components/Motion'
import { routing } from '@/i18n/routing'
import { api } from '@/lib/api'
import { MOTION_BOOT } from '@/lib/motion'
import { localeUrl, SITE_URL } from '@/lib/site'

const amiri = Amiri({ weight: ['400', '700'], subsets: ['arabic', 'latin'], variable: '--font-amiri', display: 'swap' })
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' })
const cormorant = Cormorant_Garamond({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: false })

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = { themeColor: '#f7f1e6' }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: `%s — ${locale === 'ar' ? 'جوهر' : 'JAWHAR'}` },
    description: t('description'),
    alternates: {
      canonical: localeUrl(locale, '/'),
      languages: Object.fromEntries(routing.locales.map((l) => [l, localeUrl(l, '/')])),
    },
    openGraph: { siteName: 'JAWHAR | جوهر', locale: locale === 'ar' ? 'ar_DZ' : 'fr_DZ', type: 'website' },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [categories, settings, t] = await Promise.all([
    api.categories(locale).catch(() => []),
    api.settings(locale).catch(() => null),
    getTranslations({ locale, namespace: 'nav' }),
  ])

  return (
    <html
      lang={locale}
      dir={isRTL(locale) ? 'rtl' : 'ltr'}
      className={`${amiri.variable} ${cairo.variable} ${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning // MOTION_BOOT adds data-motion before React hydrates
    >
      <body className="min-h-dvh">
        <Script id="motion-boot" strategy="beforeInteractive">
          {MOTION_BOOT}
        </Script>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
          {t('skip')}
        </a>
        <NextIntlClientProvider>
          <Header categories={categories} />
          <main id="main">{children}</main>
          <Footer categories={categories} settings={settings} />
          <Motion />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
