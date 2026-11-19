import { ORDER_STATUSES, RELEASED_ORDER_STATUSES, type OrderStatus } from '@jawhar/shared'
import type { CollectionConfig, PayloadRequest } from 'payload'

import { checkoutEndpoint, trackOrderEndpoint } from '../endpoints/checkout'
import { isAdmin } from '../lib/access'
import { t } from '../lib/labels'
import { notifyNewOrder } from '../lib/notify'
import { generateAccessToken, generateOrderNumber } from '../lib/order-number'

const statusLabels: Record<OrderStatus, ReturnType<typeof t>> = {
  new: t('جديد — في انتظار الاتصال', 'Nouvelle — à appeler', 'New — to call'),
  confirmed: t('مؤكَّد بالهاتف', 'Confirmée par téléphone', 'Confirmed by phone'),
  shipped: t('أُرسل مع شركة التوصيل', 'Expédiée', 'Shipped'),
  delivered: t('استُلم ودُفع', 'Livrée et payée', 'Delivered & paid'),
  returned: t('مرتجع', 'Retournée', 'Returned'),
  cancelled: t('ملغى', 'Annulée', 'Cancelled'),
}

type OrderItemLike = { product?: number | { id: number } | null; quantity?: number | null }

/**
 * Reserve (-1) or release (+1) stock for the pieces of an order.
 * Runs inside the order's transaction (same `req`), so a failed order never
 * leaves stock half-changed. Made-to-order pieces have no stock to track.
 */
async function adjustStock(req: PayloadRequest, items: OrderItemLike[] | null | undefined, direction: 1 | -1) {
  for (const item of items ?? []) {
    const id = typeof item.product === 'object' ? item.product?.id : item.product
    if (!id || !item.quantity) continue
    const product = await req.payload
      .findByID({ collection: 'products', id, req, depth: 0, overrideAccess: true })
      .catch(() => null)
    if (!product || product.availability === 'made_to_order') continue

    const stock = Math.max(0, (product.stock ?? 0) + direction * item.quantity)
    const availability =
      stock === 0 ? 'sold_out' : direction > 0 && product.availability === 'sold_out' ? 'in_stock' : product.availability

    await req.payload.update({
      collection: 'products',
      id,
      data: { stock, availability },
      req,
      depth: 0,
      overrideAccess: true,
    })
  }
}

const reserves = (status?: string | null) =>
  !RELEASED_ORDER_STATUSES.includes((status ?? 'new') as OrderStatus)

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: t('طلب', 'Commande', 'Order'),
    plural: t('الطلبات', 'Commandes', 'Orders'),
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['number', 'status', 'fullName', 'phone', 'wilayaName', 'total', 'createdAt'],
    listSearchableFields: ['number', 'phone', 'fullName'],
    group: t('المتجر', 'Boutique', 'Store'),
    description: t(
      'كل طلب جديد يحتاج اتصالاً هاتفياً للتأكيد قبل إرساله مع شركة التوصيل.',
      'Chaque nouvelle commande doit être confirmée par téléphone avant expédition.',
      'Every new order must be confirmed by phone before shipping.',
    ),
  },
  // Personal data (phone, address): staff only. The public creates orders through
  // POST /api/orders/checkout and reads them through GET /api/orders/track/:number.
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  endpoints: [checkoutEndpoint, trackOrderEndpoint],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          data.number ??= generateOrderNumber()
          data.accessToken ??= generateAccessToken()
        }
        // Totals are always computed server-side — also for orders typed in by hand
        // in the admin (e.g. an order taken over WhatsApp).
        const items = (data.items ?? []) as { unitPrice?: number; quantity?: number; lineTotal?: number }[]
        let subtotal = 0
        for (const item of items) {
          item.lineTotal = (item.unitPrice ?? 0) * (item.quantity ?? 0)
          subtotal += item.lineTotal
        }
        data.subtotal = subtotal
        data.total = subtotal + (data.shippingFee ?? 0)

        if (data.wilayaCode && !data.wilayaName) {
          const { docs } = await req.payload.find({
            collection: 'wilayas',
            where: { code: { equals: data.wilayaCode } },
            limit: 1,
            depth: 0,
            req,
            overrideAccess: true,
          })
          if (docs[0]) data.wilayaName = docs[0].nameAr
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'create') {
          if (reserves(doc.status)) await adjustStock(req, doc.items, -1)
          // Fire-and-forget: a notification failure must never fail an order.
          void notifyNewOrder(doc).catch((err) => req.payload.logger.error({ err }, 'order notification failed'))
          return doc
        }
        const was = reserves(previousDoc?.status)
        const now = reserves(doc.status)
        if (was && !now) await adjustStock(req, doc.items, 1) // cancelled / returned → back in stock
        if (!was && now) await adjustStock(req, doc.items, -1) // re-opened → reserve again
        return doc
      },
    ],
  },
  fields: [
    // ── Sidebar ────────────────────────────────────────────────
    {
      name: 'number',
      type: 'text',
      unique: true,
      index: true,
      label: t('رقم الطلب', 'N° de commande', 'Order number'),
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      label: t('الحالة', 'Statut', 'Status'),
      options: ORDER_STATUSES.map((value) => ({ value, label: statusLabels[value] })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'callAttempts',
      type: 'number',
      defaultValue: 0,
      min: 0,
      label: t('محاولات الاتصال', 'Tentatives d’appel', 'Call attempts'),
      admin: { position: 'sidebar' },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      label: t('طلب تجريبي', 'Commande de test', 'Test order'),
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'locale',
      type: 'text',
      defaultValue: 'ar',
      label: t('لغة الزبون', 'Langue du client', 'Customer language'),
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'accessToken',
      type: 'text',
      admin: { hidden: true },
    },

    // ── Customer ───────────────────────────────────────────────
    {
      type: 'collapsible',
      label: t('الزبون والتوصيل', 'Client & livraison', 'Customer & delivery'),
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'fullName', type: 'text', required: true, label: t('الاسم الكامل', 'Nom complet', 'Full name') },
            { name: 'phone', type: 'text', required: true, index: true, label: t('الهاتف', 'Téléphone', 'Phone') },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'wilayaCode', type: 'number', required: true, label: t('رقم الولاية', 'Code wilaya', 'Wilaya code') },
            { name: 'wilayaName', type: 'text', label: t('الولاية', 'Wilaya', 'Wilaya') },
            { name: 'commune', type: 'text', required: true, label: t('البلدية', 'Commune', 'Commune') },
          ],
        },
        {
          name: 'deliveryType',
          type: 'select',
          required: true,
          defaultValue: 'home',
          label: t('نوع التوصيل', 'Type de livraison', 'Delivery type'),
          options: [
            { value: 'home', label: t('إلى المنزل', 'À domicile', 'Home') },
            { value: 'stopdesk', label: t('إلى مكتب شركة التوصيل', 'Stop desk', 'Stop desk') },
          ],
        },
        { name: 'address', type: 'textarea', label: t('العنوان', 'Adresse', 'Address') },
        { name: 'notes', type: 'textarea', label: t('ملاحظات الزبون', 'Notes du client', 'Customer notes') },
      ],
    },

    // ── Items & totals ─────────────────────────────────────────
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: t('القطع المطلوبة', 'Articles', 'Items'),
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'product', type: 'relationship', relationTo: 'products', label: t('القطعة', 'Pièce', 'Piece') },
            {
              name: 'title',
              type: 'text',
              required: true,
              label: t('الاسم وقت الطلب', 'Nom à la commande', 'Name at order time'),
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'unitPrice', type: 'number', required: true, min: 0, label: t('سعر الوحدة', 'Prix unitaire', 'Unit price') },
            { name: 'quantity', type: 'number', required: true, min: 1, defaultValue: 1, label: t('الكمية', 'Quantité', 'Qty') },
            {
              name: 'lineTotal',
              type: 'number',
              label: t('المجموع', 'Total ligne', 'Line total'),
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', label: t('مجموع القطع', 'Sous-total', 'Subtotal'), admin: { readOnly: true } },
        { name: 'shippingFee', type: 'number', min: 0, defaultValue: 0, label: t('التوصيل', 'Livraison', 'Shipping') },
        { name: 'total', type: 'number', label: t('الإجمالي (يُدفع عند الاستلام)', 'Total (COD)', 'Total (COD)'), admin: { readOnly: true } },
      ],
    },

    // ── Fulfilment ─────────────────────────────────────────────
    {
      type: 'collapsible',
      label: t('الشحن والمتابعة', 'Expédition & suivi', 'Shipping & follow-up'),
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'carrier', type: 'text', label: t('شركة التوصيل', 'Transporteur', 'Carrier') },
            { name: 'trackingNumber', type: 'text', label: t('رقم التتبع', 'N° de suivi', 'Tracking number') },
          ],
        },
        {
          name: 'internalNotes',
          type: 'textarea',
          label: t('ملاحظات داخلية', 'Notes internes', 'Internal notes'),
          admin: {
            description: t('مثال: لم يرد — أعد الاتصال مساءً.', 'Ex. : pas de réponse, rappeler.', 'e.g. no answer, call back.'),
          },
        },
      ],
    },
  ],
}
