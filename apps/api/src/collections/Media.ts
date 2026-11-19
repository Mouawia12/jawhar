import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '../lib/access'
import { t } from '../lib/labels'

const webp = { format: 'webp' as const, options: { quality: 80 } }

/**
 * Real photos and short videos only. Product images must come from real shoots —
 * AI-generated images are allowed only for decorative backgrounds, never products.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: t('ملف وسائط', 'Média', 'Media'),
    plural: t('الصور والفيديو', 'Médias', 'Media'),
  },
  admin: {
    group: t('المحتوى', 'Contenu', 'Content'),
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: t('وصف الصورة (Alt)', 'Texte alternatif', 'Alt text'),
      admin: {
        description: t(
          'جملة قصيرة تصف ما في الصورة، تفيد محركات البحث وضعاف البصر.',
          'Phrase courte décrivant l’image (SEO, accessibilité).',
          'Short description of the image (SEO, accessibility).',
        ),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'credit',
          type: 'text',
          label: t('حقوق الصورة', 'Crédit photo', 'Photo credit'),
          admin: {
            description: t(
              'اسم المصوّر أو المصدر والترخيص، يظهر تحت الصورة. اتركه فارغاً لصورك الخاصة.',
              'Photographe ou source et licence, affiché sous l’image.',
              'Photographer or source and licence, shown under the image.',
            ),
          },
        },
        {
          name: 'creditUrl',
          type: 'text',
          label: t('رابط المصدر', 'Lien de la source', 'Source link'),
        },
      ],
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'],
    // Cap originals: phone photos are 4000px+, nobody needs that on a 4G connection.
    resizeOptions: { width: 2400, withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
    // Every size is WebP too, so API clients (web, future mobile app) get light files.
    imageSizes: [
      { name: 'thumbnail', width: 320, formatOptions: webp },
      { name: 'card', width: 768, formatOptions: webp },
      { name: 'large', width: 1600, formatOptions: webp },
      // Open Graph previews (WhatsApp/Facebook) are most reliable as JPEG.
      { name: 'og', width: 1200, height: 630, position: 'centre', formatOptions: { format: 'jpeg', options: { quality: 80 } } },
    ],
    adminThumbnail: 'thumbnail',
  },
}
