import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../lib/access'
import { t } from '../lib/labels'

/** Store-wide settings. Every claim the storefront makes reads from here. */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: t('إعدادات المتجر', 'Paramètres de la boutique', 'Store settings'),
  admin: {
    group: t('الإعدادات', 'Paramètres', 'Settings'),
  },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      name: 'ordersEnabled',
      type: 'checkbox',
      defaultValue: true,
      label: t('استقبال الطلبات عبر الموقع', 'Commandes en ligne activées', 'Online orders enabled'),
      admin: {
        description: t(
          'أوقفه مؤقتاً عند السفر أو نفاد القطع؛ يبقى الموقع ظاهراً.',
          'À désactiver temporairement si besoin.',
          'Turn off temporarily if needed.',
        ),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'whatsapp',
          type: 'text',
          label: t('رقم واتساب المتجر', 'WhatsApp de la boutique', 'Store WhatsApp'),
          admin: {
            placeholder: '0555 12 34 56',
            description: t('رقم مخصص للمتجر، لا الرقم الشخصي.', 'Numéro dédié à la boutique.', 'A dedicated store number.'),
          },
        },
        { name: 'phone', type: 'text', label: t('الهاتف', 'Téléphone', 'Phone') },
        { name: 'email', type: 'email', label: t('البريد الإلكتروني', 'E-mail', 'Email') },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: t('مواقع التواصل', 'Réseaux sociaux', 'Social links'),
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'instagram', type: 'text', label: 'Instagram', admin: { placeholder: 'https://instagram.com/…' } },
            { name: 'facebook', type: 'text', label: 'Facebook', admin: { placeholder: 'https://facebook.com/…' } },
            { name: 'tiktok', type: 'text', label: 'TikTok', admin: { placeholder: 'https://tiktok.com/@…' } },
          ],
        },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: t('صورة الواجهة الرئيسية', 'Image d’accueil', 'Hero image'),
      admin: {
        description: t(
          'صورة حقيقية لتفاصيل حرفة (يدان، خيط، سعف…). بدونها تظهر واجهة زخرفية.',
          'Une vraie photo de savoir-faire. Sans elle, un visuel décoratif s’affiche.',
          'A real craft photo. Without it, a decorative hero is shown.',
        ),
      },
    },
  ],
}
