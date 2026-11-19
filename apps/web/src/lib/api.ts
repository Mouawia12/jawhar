import type { ApiErrorBody, OrderSummary } from '@jawhar/shared'
import type { Artisan, Category, Product, Setting, Wilaya } from '@jawhar/shared/payload-types'

/**
 * Typed client for the JAWHAR REST API. The storefront never touches the database:
 * everything goes through the same public API a mobile app would use later.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031').replace(/\/$/, '')

export type Paginated<T> = { docs: T[]; totalDocs: number; page: number; totalPages: number }

type Params = Record<string, unknown>

/** Payload's bracket query syntax: where[status][equals]=published */
function toSearchParams(params: Params): URLSearchParams {
  const search = new URLSearchParams()
  const walk = (value: unknown, key: string) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${key}[${i}]`))
    else if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Params)) walk(v, `${key}[${k}]`)
    } else search.append(key, String(value))
  }
  for (const [k, v] of Object.entries(params)) walk(v, k)
  return search
}

type FetchOptions = { revalidate?: number | false; tags?: string[] }

async function get<T>(path: string, params: Params = {}, opts: FetchOptions = {}): Promise<T | null> {
  const url = `${API_URL}/api${path}?${toSearchParams(params)}`
  const res = await fetch(url, {
    next: { revalidate: opts.revalidate ?? 60, tags: opts.tags },
    ...(opts.revalidate === false ? { cache: 'no-store' as const } : {}),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`)
  return (await res.json()) as T
}

const docs = <T>(r: Paginated<T> | null) => r?.docs ?? []

export const api = {
  settings: (locale: string) =>
    get<Setting>('/globals/settings', { locale, depth: 1 }, { tags: ['settings'] }),

  categories: async (locale: string) =>
    docs(await get<Paginated<Category>>('/categories', { locale, depth: 1, sort: 'sortOrder', limit: 50 }, { tags: ['categories'] })),

  category: async (slug: string, locale: string) =>
    docs(
      await get<Paginated<Category>>('/categories', { locale, depth: 1, limit: 1, where: { slug: { equals: slug } } }),
    )[0] ?? null,

  products: async (opts: { locale: string; categoryId?: number; artisanId?: number; featured?: boolean; limit?: number }) => {
    const where: Params = {}
    if (opts.categoryId) where.category = { equals: opts.categoryId }
    if (opts.artisanId) where.artisan = { equals: opts.artisanId }
    if (opts.featured) where.featured = { equals: true }
    return docs(
      await get<Paginated<Product>>(
        '/products',
        { locale: opts.locale, depth: 1, limit: opts.limit ?? 48, sort: '-createdAt', where },
        { tags: ['products'] },
      ),
    )
  },

  product: async (slug: string, locale: string) =>
    docs(
      await get<Paginated<Product>>(
        '/products',
        { locale, depth: 2, limit: 1, where: { slug: { equals: slug } } },
        { tags: ['products'] },
      ),
    )[0] ?? null,

  artisans: async (locale: string) =>
    docs(await get<Paginated<Artisan>>('/artisans', { locale, depth: 1, sort: 'sortOrder', limit: 12 }, { tags: ['artisans'] })),

  artisan: async (slug: string, locale: string) =>
    docs(await get<Paginated<Artisan>>('/artisans', { locale, depth: 1, limit: 1, where: { slug: { equals: slug } } }))[0] ??
    null,

  /** Only wilayas the store actually delivers to (the API hides inactive ones). */
  wilayas: async (locale: string) =>
    docs(await get<Paginated<Wilaya>>('/wilayas', { locale, limit: 100, sort: 'code', depth: 0 }, { tags: ['wilayas'] })),

  trackOrder: async (number: string, token: string) => {
    const r = await get<{ ok: true; order: OrderSummary } | ApiErrorBody>(
      `/orders/track/${encodeURIComponent(number)}`,
      { t: token },
      { revalidate: false },
    )
    return r && r.ok ? r.order : null
  },
}
