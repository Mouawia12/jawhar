import type { CollectionConfig } from 'payload'

import { isAdmin } from '../lib/access'
import { t } from '../lib/labels'

/**
 * Delivery coverage and prices, per wilaya, copied from the delivery company's
 * rate table. Inactive wilayas are invisible to the public API, so the storefront
 * never promises delivery that doesn't exist.
 */
export const Wilayas: CollectionConfig = {
  slug: 'wilayas',
  labels: {
    singular: t('ولاية', 'Wilaya', 'Wilaya'),
    plural: t('التوصيل والولايات', 'Livraison & wilayas', 'Delivery & wilayas'),
  },
  defaultSort: 'code',
  admin: {
    useAsTitle: 'nameAr',
    defaultColumns: ['code', 'nameAr', 'nameFr', 'active', 'homePrice', 'stopDeskPrice'],
    group: t('التوصيل', 'Livraison', 'Delivery'),
    pagination: { defaultLimit: 100 },
    description: t(
      'فعّل الولايات التي تغطيها شركة التوصيل وأدخل أسعارها. الولايات غير المفعلة لا تظهر للزبائن.',
      'Activez les wilayas desservies et saisissez les tarifs du transporteur.',
      'Activate the wilayas your carrier serves and enter its rates.',
    ),
  },
  access: {
    read: ({ req }) => (req.user ? true : { active: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Once a human edits a wilaya, its rates are real — demo:clean must not touch it.
        if (req.user) data.isDemo = false
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'code',
          type: 'number',
          required: true,
          unique: true,
          index: true,
          label: t('الرقم', 'Code', 'Code'),
        },
        { name: 'nameAr', type: 'text', required: true, label: t('الاسم بالعربية', 'Nom (ar)', 'Name (ar)') },
        { name: 'nameFr', type: 'text', required: true, label: t('الاسم بالفرنسية', 'Nom (fr)', 'Name (fr)') },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: t('التوصيل متاح لهذه الولاية', 'Livraison disponible', 'Delivery available'),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'homePrice',
          type: 'number',
          min: 0,
          label: t('سعر التوصيل للمنزل (دج)', 'À domicile (DA)', 'Home delivery (DZD)'),
          validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
            siblingData?.active && (value === null || value === undefined)
              ? 'أدخل سعر التوصيل للمنزل قبل التفعيل / Home price required when active'
              : true,
        },
        {
          name: 'stopDeskPrice',
          type: 'number',
          min: 0,
          label: t('سعر التوصيل للمكتب Stop desk (دج)', 'Stop desk (DA)', 'Stop desk (DZD)'),
          admin: {
            description: t('اتركه فارغاً إن لم يتوفر مكتب.', 'Vide si indisponible.', 'Empty if unavailable.'),
          },
        },
      ],
    },
    {
      name: 'deliveryTime',
      type: 'text',
      localized: true,
      label: t('مدة التوصيل', 'Délai', 'Delivery time'),
      admin: { placeholder: '24–72 ساعة' },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      label: t('أسعار تجريبية', 'Tarifs de démonstration', 'Demo rates'),
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
