import type { Field } from 'payload'

import { t } from '../lib/labels'

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: t('محركات البحث (SEO)', 'Référencement (SEO)', 'SEO'),
  admin: {
    description: t(
      'اختياري. إن تُرك فارغاً يُستعمل الاسم والوصف.',
      'Optionnel. À défaut, le titre et la description sont utilisés.',
      'Optional. Falls back to title and description.',
    ),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      maxLength: 70,
      label: t('عنوان الصفحة', 'Titre', 'Title'),
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      maxLength: 170,
      label: t('الوصف', 'Description', 'Description'),
    },
  ],
}
