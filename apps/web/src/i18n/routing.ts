import { STOREFRONT_LOCALES } from '@jawhar/shared'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: STOREFRONT_LOCALES,
  defaultLocale: 'ar',
  // Arabic lives at "/", French at "/fr". Brand is Arabic-first, so no auto-redirect
  // from the browser language; the choice is remembered once a visitor switches.
  localePrefix: 'as-needed',
  localeDetection: false,
})
