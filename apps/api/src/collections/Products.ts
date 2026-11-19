import type { CollectionConfig } from 'payload'

import { isAdmin, publishedOrAdmin } from '../lib/access'
import { t } from '../lib/labels'
import { slugField } from '../lib/slug'
import { seoField } from '../fields/seo'

/**
 * A piece for sale. Most pieces are unique (stock = 1); when an order reserves the
 * last one it flips to "sold_out" automatically (see Orders hooks).
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: t('قطعة', 'Pièce', 'Piece'),
    plural: t('القطع (المنتجات)', 'Pièces', 'Pieces'),
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'availability', 'stock', 'status'],
    listSearchableFields: ['title', 'slug'],
    group: t('المتجر', 'Boutique', 'Store'),
  },
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.availability === 'in_stock' && typeof data.stock === 'number' && data.stock <= 0) {
          data.availability = 'sold_out'
        }
        return data
      },
    ],
  },
  fields: [
    // ── Sidebar ────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      label: t('الحالة', 'Statut', 'Status'),
      options: [
        { value: 'draft', label: t('مسودة (مخفية)', 'Brouillon', 'Draft') },
        { value: 'published', label: t('منشورة', 'Publiée', 'Published') },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: t('تظهر في «قطع مختارة» بالرئيسية', 'Mise en avant', 'Featured'),
      admin: { position: 'sidebar' },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      label: t('بيانات تجريبية', 'Donnée de démonstration', 'Demo data'),
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: t(
          'تُحذف بالأمر pnpm demo:clean',
          'Supprimée par pnpm demo:clean',
          'Removed by pnpm demo:clean',
        ),
      },
    },
    slugField(),

    {
      type: 'tabs',
      tabs: [
        // ── Essentials ─────────────────────────────────────────
        {
          label: t('الأساسيات', 'Essentiel', 'Essentials'),
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: t('اسم القطعة', 'Nom', 'Name'),
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                  index: true,
                  label: t('الحرفة', 'Artisanat', 'Craft'),
                },
                {
                  name: 'artisan',
                  type: 'relationship',
                  relationTo: 'artisans',
                  label: t('الحرفي (اختياري)', 'Artisan (optionnel)', 'Artisan (optional)'),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                  label: t('السعر (دج)', 'Prix (DA)', 'Price (DZD)'),
                  admin: {
                    step: 50,
                    description: t('بالدينار، دون فواصل.', 'En dinars.', 'Whole dinars.'),
                  },
                },
                {
                  name: 'availability',
                  type: 'select',
                  required: true,
                  defaultValue: 'in_stock',
                  label: t('التوفر', 'Disponibilité', 'Availability'),
                  options: [
                    { value: 'in_stock', label: t('متوفرة', 'En stock', 'In stock') },
                    {
                      value: 'made_to_order',
                      label: t('تُصنع عند الطلب', 'Sur commande', 'Made to order'),
                    },
                    { value: 'sold_out', label: t('بيعت', 'Vendue', 'Sold out') },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'stock',
                  type: 'number',
                  min: 0,
                  defaultValue: 1,
                  label: t('الكمية المتوفرة', 'Quantité', 'Stock'),
                  admin: {
                    condition: (_, sibling) => sibling?.availability !== 'made_to_order',
                    description: t(
                      'القطعة الفريدة = 1. تنقص تلقائياً عند كل طلب.',
                      'Pièce unique = 1. Décrémenté à chaque commande.',
                      'Unique piece = 1. Decremented on each order.',
                    ),
                  },
                },
                {
                  name: 'prepDays',
                  type: 'number',
                  min: 1,
                  label: t('مدة التحضير (أيام)', 'Délai de fabrication (jours)', 'Lead time (days)'),
                  admin: {
                    condition: (_, sibling) => sibling?.availability === 'made_to_order',
                  },
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 220,
              label: t('وصف قصير (يظهر قرب السعر)', 'Résumé', 'Short description'),
            },
          ],
        },
        // ── Media ──────────────────────────────────────────────
        {
          label: t('الصور والفيديو', 'Photos & vidéo', 'Photos & video'),
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: t('الصور (الأولى هي الرئيسية)', 'Photos (la 1ʳᵉ est principale)', 'Photos'),
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                description: t(
                  'صور حقيقية للقطعة فقط: لقطة كاملة، ثم تفاصيل الخيط والخامة واليدين.',
                  'Uniquement de vraies photos de la pièce.',
                  'Real photos of the piece only.',
                ),
              },
              validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
                siblingData?.status === 'published' && (!Array.isArray(value) || value.length === 0)
                  ? 'أضف صورة واحدة على الأقل قبل النشر / Add at least one photo before publishing'
                  : true,
            },
            {
              name: 'video',
              type: 'upload',
              relationTo: 'media',
              label: t('فيديو قصير (اختياري)', 'Vidéo courte (optionnel)', 'Short video (optional)'),
              filterOptions: { mimeType: { contains: 'video' } },
              admin: {
                description: t(
                  'عمودي، 10–20 ثانية، أقل من 15 ميغا.',
                  'Vertical, 10–20 s, < 15 Mo.',
                  'Vertical, 10–20 s, < 15 MB.',
                ),
              },
            },
          ],
        },
        // ── Story & details ────────────────────────────────────
        {
          label: t('الحكاية والتفاصيل', 'Histoire & détails', 'Story & details'),
          fields: [
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: t('الوصف', 'Description', 'Description'),
            },
            {
              name: 'story',
              type: 'textarea',
              localized: true,
              label: t('حكاية هذه القطعة', 'L’histoire de la pièce', 'The story of this piece'),
              admin: {
                description: t(
                  'معلومات حقيقية فقط عن القطعة والحرفة، دون اختلاق.',
                  'Faits réels uniquement.',
                  'Real facts only.',
                ),
              },
            },
            {
              name: 'details',
              type: 'group',
              label: t('المواصفات', 'Caractéristiques', 'Specifications'),
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'materials',
                      type: 'text',
                      localized: true,
                      label: t('المواد', 'Matières', 'Materials'),
                    },
                    {
                      name: 'dimensions',
                      type: 'text',
                      label: t('المقاسات', 'Dimensions', 'Dimensions'),
                      admin: { placeholder: '40 × 60 cm' },
                    },
                  ],
                },
                {
                  name: 'origin',
                  type: 'text',
                  localized: true,
                  label: t('مكان الصنع', 'Lieu de fabrication', 'Made in'),
                },
                {
                  name: 'technique',
                  type: 'textarea',
                  localized: true,
                  label: t('طريقة الصنع', 'Technique', 'Technique'),
                },
                {
                  name: 'care',
                  type: 'textarea',
                  localized: true,
                  label: t('العناية بالقطعة', 'Entretien', 'Care'),
                },
              ],
            },
          ],
        },
        // ── SEO ────────────────────────────────────────────────
        {
          label: 'SEO',
          fields: [seoField],
        },
      ],
    },
  ],
}
