/** Languages the data model supports. Content can be written in all of them. */
export const LOCALES = ['ar', 'fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]

/** Languages the storefront currently exposes. Add 'en' here when going international. */
export const STOREFRONT_LOCALES = ['ar', 'fr'] as const satisfies readonly Locale[]
export type StorefrontLocale = (typeof STOREFRONT_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ar'
export const isRTL = (locale: string) => locale === 'ar'

/**
 * Order lifecycle. "confirmed" means the customer answered the confirmation call —
 * nothing ships before that (COD fake orders cost real money in returns).
 */
export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'returned',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Statuses in which the ordered pieces are back in stock. */
export const RELEASED_ORDER_STATUSES: readonly OrderStatus[] = ['returned', 'cancelled']

export const DELIVERY_TYPES = ['home', 'stopdesk'] as const
export type DeliveryType = (typeof DELIVERY_TYPES)[number]

export const AVAILABILITY = ['in_stock', 'made_to_order', 'sold_out'] as const
export type Availability = (typeof AVAILABILITY)[number]

export const PRODUCT_STATUSES = ['draft', 'published'] as const

/** Hard caps that keep a single order sane (unique handmade pieces). */
export const MAX_QTY_PER_ITEM = 10
export const MAX_ITEMS_PER_ORDER = 20
