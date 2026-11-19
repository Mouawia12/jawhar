import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ar } from '@payloadcms/translations/languages/ar'
import { fr } from '@payloadcms/translations/languages/fr'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Artisans } from './collections/Artisans'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { Wilayas } from './collections/Wilayas'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3031'
/** Every client allowed to call the API from a browser (storefront today, more later). */
const clientOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3030')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

export default buildConfig({
  serverURL,
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — JAWHAR' },
    // Follows the device's light/dark setting until the user picks one with the toggle.
    theme: 'all',
    components: {
      actions: ['/components/admin/ThemeToggle#ThemeToggle'],
    },
  },
  collections: [Products, Categories, Artisans, Orders, Wilayas, Media, Users],
  globals: [Settings],
  // Content languages. 'en' is ready in the data model for the international phase.
  localization: {
    locales: [
      { code: 'ar', label: 'العربية', rtl: true },
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'ar',
    fallback: true,
  },
  // Admin panel UI languages. Arabic first; browsers in any other language fall back to it.
  i18n: {
    supportedLanguages: { ar, fr },
    fallbackLanguage: 'ar',
  },
  cors: clientOrigins,
  csrf: [...clientOrigins, serverURL],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  sharp,
  upload: {
    limits: { fileSize: 60 * 1024 * 1024 }, // short product videos
  },
  typescript: {
    // Types live in the shared package so every client gets the same contract.
    outputFile: path.resolve(dirname, '../../../packages/shared/src/payload-types.ts'),
    declare: false,
  },
})
