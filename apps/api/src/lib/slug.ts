import type { Field } from 'payload'

import { t } from './labels'

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Latin URL slug. Arabic titles produce percent-encoded links that look broken when
 * shared on WhatsApp/Facebook, so slugs stay ASCII. Generated from the title when the
 * title is Latin, otherwise a short random fallback the owner can rename.
 */
export const slugField = (source = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  label: t('الرابط (slug)', 'Identifiant URL', 'Slug'),
  admin: {
    position: 'sidebar',
    description: t(
      'حروف لاتينية صغيرة وأرقام وشرطات. مثال: taqurt-mendil-01. يُولَّد تلقائياً إن تُرك فارغاً.',
      'Lettres latines minuscules, chiffres et tirets. Généré automatiquement si vide.',
      'Lowercase latin letters, digits and dashes. Auto-generated when empty.',
    ),
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const from = data?.[source]
        const generated = typeof from === 'string' ? slugify(from) : ''
        return generated || `piece-${Date.now().toString(36)}`
      },
    ],
  },
  validate: (value: unknown) =>
    typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
      ? true
      : 'Slug: a-z, 0-9 and "-" only',
})
