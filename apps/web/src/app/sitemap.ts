import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { api } from '@/lib/api'
import { localeUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    api.categories('ar').catch(() => []),
    api.products({ locale: 'ar', limit: 500 }).catch(() => []),
  ])
  const paths = [
    '/',
    ...categories.map((c) => `/crafts/${c.slug}`),
    ...products.filter((p) => !p.isDemo).map((p) => `/p/${p.slug}`),
  ]
  return paths.map((path) => ({
    url: localeUrl('ar', path),
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, localeUrl(l, path)])) },
  }))
}
