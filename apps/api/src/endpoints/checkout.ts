import { timingSafeEqual } from 'node:crypto'

import {
  type ApiErrorBody,
  type CheckoutResponse,
  checkoutSchema,
  type OrderSummary,
  toFieldErrors,
} from '@jawhar/shared'
import type { Order } from '@jawhar/shared/payload-types'
import { type Endpoint, headersWithCors, type PayloadRequest } from 'payload'

import { clientIp, rateLimit } from '../lib/rate-limit'
import { generateOrderNumber } from '../lib/order-number'

const json = (req: PayloadRequest, body: unknown, status = 200) =>
  Response.json(body, { status, headers: headersWithCors({ headers: new Headers(), req }) })

const fail = (req: PayloadRequest, status: number, error: string, fieldErrors?: Record<string, string[]>) =>
  json(req, { ok: false, error, ...(fieldErrors ? { fieldErrors } : {}) } satisfies ApiErrorBody, status)

export function toOrderSummary(order: Order): OrderSummary {
  return {
    number: order.number ?? '',
    status: order.status,
    items: (order.items ?? []).map((i) => ({
      title: i.title,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal ?? i.unitPrice * i.quantity,
    })),
    subtotal: order.subtotal ?? 0,
    shippingFee: order.shippingFee ?? 0,
    total: order.total ?? 0,
    wilayaName: order.wilayaName ?? '',
    deliveryType: order.deliveryType,
    createdAt: order.createdAt,
    isDemo: Boolean(order.isDemo),
  }
}

/**
 * POST /api/orders/checkout — the only way the public can create an order.
 * Never trusts the client: prices, availability, stock and delivery fees are all
 * re-read from the database. Cash on delivery only (phase 1).
 */
export const checkoutEndpoint: Endpoint = {
  path: '/checkout',
  method: 'post',
  handler: async (req) => {
    const { payload } = req

    if (!rateLimit(`checkout:${clientIp(req.headers)}`, 5, 10 * 60 * 1000)) {
      return fail(req, 429, 'too_many_requests')
    }

    let body: unknown
    try {
      body = await req.json?.()
    } catch {
      return fail(req, 400, 'invalid_json')
    }

    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) return fail(req, 422, 'validation_failed', toFieldErrors(parsed.error))
    const input = parsed.data
    if (input.website) return fail(req, 400, 'rejected') // honeypot

    const settings = await payload.findGlobal({ slug: 'settings', depth: 0 })
    if (settings.ordersEnabled === false) return fail(req, 503, 'orders_disabled')

    // Merge duplicate lines for the same piece.
    const wanted = new Map<number, number>()
    for (const item of input.items) wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + item.quantity)

    const { docs: products } = await payload.find({
      collection: 'products',
      where: { and: [{ id: { in: [...wanted.keys()] } }, { status: { equals: 'published' } }] },
      locale: input.locale,
      depth: 0,
      limit: wanted.size,
      pagination: false,
      overrideAccess: true,
    })
    const byId = new Map(products.map((p) => [p.id, p]))

    const lines: { product: number; title: string; unitPrice: number; quantity: number }[] = []
    for (const [productId, quantity] of wanted) {
      const product = byId.get(productId)
      if (!product) return fail(req, 409, 'product_unavailable', { items: [String(productId)] })
      if (product.availability === 'sold_out') return fail(req, 409, 'product_sold_out', { items: [String(productId)] })
      if (product.availability === 'in_stock' && (product.stock ?? 0) < quantity) {
        return fail(req, 409, 'insufficient_stock', { items: [String(productId)] })
      }
      lines.push({ product: product.id, title: product.title, unitPrice: product.price, quantity })
    }

    const { docs: wilayas } = await payload.find({
      collection: 'wilayas',
      where: { and: [{ code: { equals: input.customer.wilayaCode } }, { active: { equals: true } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const wilaya = wilayas[0]
    if (!wilaya) return fail(req, 422, 'validation_failed', { 'customer.wilayaCode': ['wilaya_unavailable'] })

    const shippingFee = input.customer.deliveryType === 'stopdesk' ? wilaya.stopDeskPrice : wilaya.homePrice
    if (shippingFee === null || shippingFee === undefined) {
      return fail(req, 422, 'validation_failed', { 'customer.deliveryType': ['stopdesk_unavailable'] })
    }

    const isDemo = products.some((p) => p.isDemo) || Boolean(wilaya.isDemo)

    // Order numbers are random (they don't leak sales volume); retry on the rare collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const order = await payload.create({
          collection: 'orders',
          overrideAccess: true,
          data: {
            number: generateOrderNumber(),
            status: 'new',
            locale: input.locale,
            isDemo,
            fullName: input.customer.fullName,
            phone: input.customer.phone,
            wilayaCode: wilaya.code,
            wilayaName: input.locale === 'ar' ? wilaya.nameAr : wilaya.nameFr,
            commune: input.customer.commune,
            deliveryType: input.customer.deliveryType,
            address: input.customer.address,
            notes: input.customer.notes,
            items: lines,
            shippingFee,
          },
        })
        return json(
          req,
          { ok: true, order: toOrderSummary(order), accessToken: order.accessToken ?? '' } satisfies CheckoutResponse,
          201,
        )
      } catch (err) {
        const isNumberClash = err instanceof Error && /number/i.test(err.message) && /unique|exists/i.test(err.message)
        if (!isNumberClash || attempt === 2) {
          payload.logger.error({ err }, 'checkout failed')
          return fail(req, 500, 'order_failed')
        }
      }
    }
    return fail(req, 500, 'order_failed')
  },
}

/**
 * GET /api/orders/track/:number?t=<accessToken> — privacy-safe order summary for the
 * confirmation page (and a future "track my order" screen). No phone, no address.
 */
export const trackOrderEndpoint: Endpoint = {
  path: '/track/:number',
  method: 'get',
  handler: async (req) => {
    const number = String(req.routeParams?.number ?? '')
    const token = req.searchParams.get('t') ?? ''
    if (!number || !token) return fail(req, 404, 'not_found')

    const { docs } = await req.payload.find({
      collection: 'orders',
      where: { number: { equals: number } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const order = docs[0]
    const expected = Buffer.from(order?.accessToken ?? '')
    const given = Buffer.from(token)
    if (!order || expected.length === 0 || expected.length !== given.length || !timingSafeEqual(expected, given)) {
      return fail(req, 404, 'not_found')
    }
    return json(req, { ok: true, order: toOrderSummary(order) })
  },
}
