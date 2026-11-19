import type { CollectionConfig } from 'payload'

import { isAdmin } from '../lib/access'
import { t } from '../lib/labels'
import { slugField } from '../lib/slug'

/**
 * Artisans and their stories. Nothing about an artisan reaches the public API
 * until `consentToPublish` is checked — names, photos and stories need consent.
 */
export const Artisans: CollectionConfig = {
  slug: 'artisans',
  labels: {
    singular: t('حرفي/حرفية', 'Artisan', 'Artisan'),
    plural: t('الحرفيون', 'Artisans', 'Artisans'),
  },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'craft', 'consentToPublish'],
    group: t('المتجر', 'Boutique', 'Store'),
  },
  access: {
    read: ({ req }) => (req.user ? true : { consentToPublish: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'consentToPublish',
      type: 'checkbox',
      defaultValue: false,
      label: t(
        'وافق/ت على نشر الاسم والصورة والقصة',
        'A consenti à la publication',
        'Consented to publication',
      ),
      admin: {
        position: 'sidebar',
        description: t(
          'لن يظهر أي شيء عن الحرفي في الموقع قبل تفعيل هذا الخيار.',
          'Rien n’est publié avant cette case.',
          'Nothing is public until this is checked.',
        ),
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: t('الاسم', 'Nom', 'Name'),
    },
    {
      name: 'region',
      type: 'text',
      localized: true,
      label: t('المنطقة', 'Région', 'Region'),
    },
    {
      name: 'craft',
      type: 'relationship',
      relationTo: 'categories',
      label: t('الحرفة', 'Artisanat', 'Craft'),
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      label: t('صورة (شخصية أو أثناء العمل)', 'Portrait', 'Portrait'),
    },
    {
      name: 'story',
      type: 'textarea',
      localized: true,
      label: t('القصة (موثقة، دون مبالغة)', 'Histoire', 'Story'),
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: t('الترتيب', 'Ordre', 'Order'),
      admin: { position: 'sidebar' },
    },
    slugField('name'),
  ],
}
