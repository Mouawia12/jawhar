import { normalizeDzMobile, toInternationalDz } from '@jawhar/shared'
import type { Setting } from '@jawhar/shared/payload-types'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030').replace(/\/$/, '')

/** wa.me link for the store's number, or null when no valid number is set. */
export function whatsappLink(settings: Setting | null, text?: string): string | null {
  const local = settings?.whatsapp ? normalizeDzMobile(settings.whatsapp) : null
  if (!local) return null
  const q = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${toInternationalDz(local)}${q}`
}

export function socialLinks(settings: Setting | null) {
  const s = settings?.social
  return [
    s?.instagram && { name: 'Instagram', href: s.instagram },
    s?.facebook && { name: 'Facebook', href: s.facebook },
    s?.tiktok && { name: 'TikTok', href: s.tiktok },
  ].filter(Boolean) as { name: string; href: string }[]
}

/** Absolute URL of a storefront path for a locale (Arabic has no prefix). */
export const localeUrl = (locale: string, path = '') =>
  `${SITE_URL}${locale === 'ar' ? '' : `/${locale}`}${path}` || SITE_URL
