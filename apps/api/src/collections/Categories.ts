import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '../lib/access'
import { t } from '../lib/labels'
import { slugField } from '../lib/slug'
import { seoField } from '../fields/seo'

/** Crafts (الطرز التقرتي، السعف، الترميل…). New crafts are added here, not in code. */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: t('حرفة', 'Artisanat', 'Craft'),
    plural: t('الحرف (الفئات)', 'Artisanats', 'Crafts'),
  },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sortOrder'],
    group: t('المتجر', 'Boutique', 'Store'),
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: t('اسم الحرفة', 'Nom', 'Name'),
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: t('مقدمة قصيرة', 'Introduction', 'Introduction'),
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: t('صورة الغلاف', 'Image de couverture', 'Cover image'),
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: t('الترتيب', 'Ordre', 'Order'),
      admin: { position: 'sidebar' },
    },
    slugField(),
    seoField,
  ],
}
