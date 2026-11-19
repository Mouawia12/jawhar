/**
 * Base seed — safe to run many times (idempotent). Real structure only, no fake products:
 *   - all wilayas, INACTIVE and without prices (the owner fills in the carrier's rates)
 *   - the three founding crafts
 *   - a local test admin, only if DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD are set
 *
 *   pnpm seed
 */
import config from '@payload-config'
import { WILAYAS_SEED } from '@jawhar/shared'
import { getPayload } from 'payload'

const CATEGORIES = [
  {
    slug: 'taqurt-embroidery',
    sortOrder: 1,
    ar: { title: 'الطرز التقرتي', intro: 'قطع مطرّزة يدوياً بأسلوب الطرز التقليدي لمنطقة تقرت.' },
    fr: { title: 'Broderie de Touggourt', intro: 'Pièces brodées à la main dans le style traditionnel de Touggourt.' },
    en: { title: 'Touggourt embroidery', intro: 'Hand-embroidered pieces in the traditional style of Touggourt.' },
  },
  {
    slug: 'palm-frond-weaving',
    sortOrder: 2,
    ar: { title: 'صناعة السعف', intro: 'منتجات منسوجة يدوياً من سعف النخيل، تجمع بين الاستعمال التقليدي والجمال المعاصر.' },
    fr: { title: 'Vannerie en palme', intro: 'Objets tressés à la main en feuilles de palmier, entre usage traditionnel et esthétique contemporaine.' },
    en: { title: 'Palm-frond weaving', intro: 'Hand-woven palm-frond pieces, between traditional use and contemporary design.' },
  },
  {
    slug: 'sand-art',
    sortOrder: 3,
    ar: { title: 'فن الترميل بالرمل', intro: 'لوحات وأعمال فنية تُشكَّل بالرمل والألوان.' },
    fr: { title: 'Art du sable', intro: 'Tableaux et œuvres composés de sable et de couleurs.' },
    en: { title: 'Sand art', intro: 'Paintings and artworks composed with sand and colour.' },
  },
] as const

const payload = await getPayload({ config })

// Wilayas
let createdWilayas = 0
for (const w of WILAYAS_SEED) {
  const { totalDocs } = await payload.count({ collection: 'wilayas', where: { code: { equals: w.code } } })
  if (totalDocs) continue
  await payload.create({
    collection: 'wilayas',
    data: { code: w.code, nameAr: w.ar, nameFr: w.fr, active: false },
  })
  createdWilayas++
}
payload.logger.info(`wilayas: +${createdWilayas} (all inactive — activate them in /admin with real rates)`)

// Categories (ar is the default locale, then fr/en translations)
for (const c of CATEGORIES) {
  const existing = await payload.find({ collection: 'categories', where: { slug: { equals: c.slug } }, limit: 1 })
  if (existing.docs[0]) continue
  const doc = await payload.create({
    collection: 'categories',
    locale: 'ar',
    data: { slug: c.slug, sortOrder: c.sortOrder, title: c.ar.title, intro: c.ar.intro },
  })
  for (const locale of ['fr', 'en'] as const) {
    await payload.update({ collection: 'categories', id: doc.id, locale, data: c[locale] })
  }
  payload.logger.info(`category: ${c.slug}`)
}

// Local test admin
const email = process.env.DEV_ADMIN_EMAIL
const password = process.env.DEV_ADMIN_PASSWORD
if (email && password) {
  const { totalDocs } = await payload.count({ collection: 'users', where: { email: { equals: email } } })
  if (!totalDocs) {
    await payload.create({ collection: 'users', data: { email, password, name: 'Admin (dev)' } })
    payload.logger.info(`dev admin created: ${email} (password in apps/api/.env)`)
  }
}

payload.logger.info('seed done')
process.exit(0)
