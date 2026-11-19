import type { CollectionConfig } from 'payload'

import { isAdmin } from '../lib/access'
import { t } from '../lib/labels'

/** Store staff who can sign in to /admin. There are no customer accounts in v1. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: t('مستخدم', 'Utilisateur', 'User'),
    plural: t('المستخدمون', 'Utilisateurs', 'Users'),
  },
  admin: {
    useAsTitle: 'email',
    group: t('الإعدادات', 'Paramètres', 'Settings'),
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: t('الاسم', 'Nom', 'Name'),
    },
  ],
}
