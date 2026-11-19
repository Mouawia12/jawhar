import type { Media } from '@jawhar/shared/payload-types'

import { API_URL } from './api'

export type ImageSize = 'thumbnail' | 'card' | 'large' | 'og'
export type Img = {
  src: string
  alt: string
  width: number
  height: number
  /** Photographer / source credit, shown under the image when set. */
  credit?: string | null
  creditUrl?: string | null
}

const absolute = (url: string) => (url.startsWith('http') ? url : `${API_URL}${url}`)

export function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

/** Picks a pre-generated size from the API (falls back to the original). */
export function image(value: unknown, size?: ImageSize): Img | null {
  if (!isMedia(value) || !value.url || value.mimeType?.startsWith('video')) return null
  const s = size ? value.sizes?.[size] : undefined
  const url = s?.url ?? value.url
  return {
    src: absolute(url),
    alt: value.alt ?? '',
    width: (s?.url ? s.width : value.width) ?? 1200,
    height: (s?.url ? s.height : value.height) ?? 1500,
    credit: value.credit,
    creditUrl: value.creditUrl,
  }
}

export function video(value: unknown): { src: string; type: string } | null {
  if (!isMedia(value) || !value.url || !value.mimeType?.startsWith('video')) return null
  return { src: absolute(value.url), type: value.mimeType }
}

export const images = (values: unknown[] | null | undefined, size?: ImageSize) =>
  (values ?? []).map((v) => image(v, size)).filter((v): v is Img => v !== null)
