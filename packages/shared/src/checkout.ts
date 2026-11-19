import { z } from 'zod'

import {
  DELIVERY_TYPES,
  type DeliveryType,
  LOCALES,
  MAX_ITEMS_PER_ORDER,
  MAX_QTY_PER_ITEM,
  type OrderStatus,
} from './constants'
import { normalizeDzMobile } from './phone'

/**
 * The checkout contract. The API validates with it, and every client (the web
 * storefront today, a mobile app tomorrow) validates the same way before sending.
 * Error messages are stable codes, translated by each client.
 */
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(MAX_QTY_PER_ITEM),
      }),
    )
    .min(1, { error: 'cart_empty' })
    .max(MAX_ITEMS_PER_ORDER),
  customer: z
    .object({
      fullName: z
        .string()
        .trim()
        .min(3, { error: 'name_required' })
        .max(80, { error: 'name_too_long' }),
      phone: z.string().transform((value, ctx) => {
        const normalized = normalizeDzMobile(value)
        if (!normalized) {
          ctx.addIssue({ code: 'custom', message: 'phone_invalid' })
          return z.NEVER
        }
        return normalized
      }),
      wilayaCode: z.coerce
        .number({ error: 'wilaya_required' })
        .int()
        .min(1, { error: 'wilaya_required' }),
      commune: z
        .string()
        .trim()
        .min(2, { error: 'commune_required' })
        .max(80, { error: 'commune_too_long' }),
      deliveryType: z.enum(DELIVERY_TYPES, { error: 'delivery_type_required' }),
      address: z.string().trim().max(200, { error: 'address_too_long' }).default(''),
      notes: z.string().trim().max(500, { error: 'notes_too_long' }).default(''),
    })
    .refine((c) => !(c.deliveryType === 'home' && (typeof c.address !== 'string' || c.address.length < 5)), {
      path: ['address'],
      error: 'address_required',
      // Report it together with the other field errors, not only once they're fixed.
      when: () => true,
    }),
  locale: z.enum(LOCALES).default('ar'),
  /** Honeypot: hidden from humans, bots fill it. Must stay empty. */
  website: z.string().max(0).optional(),
})

export type CheckoutInput = z.input<typeof checkoutSchema>
export type CheckoutData = z.output<typeof checkoutSchema>

/** Flattens zod issues to { 'customer.phone': ['phone_invalid'] }. */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    ;(out[key] ??= []).push(issue.message)
  }
  return out
}

/** Public, privacy-safe view of an order (no phone, no address). */
export type OrderSummary = {
  number: string
  status: OrderStatus
  items: { title: string; quantity: number; unitPrice: number; lineTotal: number }[]
  subtotal: number
  shippingFee: number
  total: number
  wilayaName: string
  deliveryType: DeliveryType
  createdAt: string
  isDemo: boolean
}

export type CheckoutResponse =
  | { ok: true; order: OrderSummary; accessToken: string }
  | ApiErrorBody

export type ApiErrorBody = {
  ok: false
  /** Stable machine-readable code, e.g. "validation_failed", "product_sold_out". */
  error: string
  fieldErrors?: Record<string, string[]>
}
