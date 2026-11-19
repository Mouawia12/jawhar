/**
 * DEMO data to preview the design and test the order flow before real pieces exist.
 * Everything is flagged `isDemo` and shows a "demo" badge on the storefront.
 * Photos are free-licence Commons images of similar crafts (see demo-photos.ts),
 * credited under each image — never presented as JAWHAR pieces.
 *
 *   pnpm seed:demo      (after pnpm seed)
 *   pnpm demo:clean     removes all of it
 */
import fs from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

import { creditOf, DEMO_PHOTOS, type DemoPhotoKey } from './demo-photos'

const payload = await getPayload({ config })
const CACHE_DIR = path.resolve(process.cwd(), '.demo-cache')
await fs.mkdir(CACHE_DIR, { recursive: true })

/** Downloads once into the git-ignored cache; returns null if offline/failed. */
async function fetchPhoto(key: DemoPhotoKey): Promise<Buffer | null> {
  const cached = path.join(CACHE_DIR, `${key}.jpg`)
  try {
    return await fs.readFile(cached)
  } catch {
    // not cached yet
  }
  try {
    const res = await fetch(DEMO_PHOTOS[key].url, {
      headers: { 'User-Agent': 'jawhar-dev-demo/0.1 (local development seed)' },
      signal: AbortSignal.timeout(180_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.writeFile(cached, buf)
    payload.logger.info(`downloaded ${key} (${Math.round(buf.length / 1024)} KB)`)
    return buf
  } catch (err) {
    payload.logger.warn(`could not download ${key}: ${(err as Error).message} — using a pattern instead`)
    return null
  }
}

/** Abstract fallback so the seed still works offline. */
function patternPng(seed: number): Promise<Buffer> {
  const size = 48 + (seed % 4) * 8
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500">
    <defs><pattern id="p" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
      <rect width="${size}" height="${size}" fill="#efe6d3"/>
      <path d="M${size / 2} 4 L${size - 4} ${size / 2} L${size / 2} ${size - 4} L4 ${size / 2} Z" fill="none" stroke="#b5653f" stroke-width="2"/>
    </pattern></defs><rect width="1200" height="1500" fill="url(#p)"/></svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

const mediaIds = new Map<DemoPhotoKey, number>()
async function demoMedia(key: DemoPhotoKey, index: number): Promise<number> {
  if (mediaIds.has(key)) return mediaIds.get(key)!
  const photo = DEMO_PHOTOS[key]
  const jpg = await fetchPhoto(key)
  const data = jpg ?? (await patternPng(index))
  const doc = await payload.create({
    collection: 'media',
    locale: 'ar',
    data: {
      alt: `${photo.alt.ar} (صورة تجريبية)`,
      credit: jpg ? creditOf(photo) : undefined,
      creditUrl: jpg ? photo.page : undefined,
    },
    file: {
      data,
      mimetype: jpg ? 'image/jpeg' : 'image/png',
      name: `demo-${key}.${jpg ? 'jpg' : 'png'}`,
      size: data.length,
    },
  })
  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'fr',
    data: { alt: `${photo.alt.fr} (photo de démonstration)` },
  })
  mediaIds.set(key, doc.id)
  return doc.id
}

const categories = await payload.find({ collection: 'categories', limit: 10 })
const category = (slug: string) => {
  const c = categories.docs.find((d) => d.slug === slug)
  if (!c) throw new Error(`Run "pnpm seed" first (missing category ${slug})`)
  return c
}

const NOTE_AR = 'هذا منتج تجريبي لاختبار تصميم المتجر وتجربة الطلب. الصور لحِرف مشابهة من ويكيميديا، وليست قطعة حقيقية ولا سعراً حقيقياً.'
const NOTE_FR =
  'Produit de démonstration pour tester le design et la commande. Photos d’objets similaires (Wikimedia), ni pièce ni prix réels.'

const DEMO: {
  slug: string
  category: string
  photos: DemoPhotoKey[]
  price: number
  availability: 'in_stock' | 'made_to_order' | 'sold_out'
  stock: number
  prepDays?: number
  ar: string
  fr: string
}[] = [
  {
    slug: 'demo-taqurt',
    category: 'taqurt-embroidery',
    photos: ['tanchifa', 'embroideryHands'],
    price: 6500,
    availability: 'in_stock',
    stock: 1,
    ar: 'قطعة طرز (تجريبية)',
    fr: 'Broderie (démo)',
  },
  {
    slug: 'demo-palm-basket',
    category: 'palm-frond-weaving',
    photos: ['basketLidded', 'basketBag'],
    price: 2800,
    availability: 'in_stock',
    stock: 3,
    ar: 'سلة سعف (تجريبية)',
    fr: 'Panier en palme (démo)',
  },
  {
    slug: 'demo-sand-painting',
    category: 'sand-art',
    photos: ['sandPalm', 'sandBowls'],
    price: 9000,
    availability: 'made_to_order',
    stock: 0,
    prepDays: 10,
    ar: 'لوحة رمل (تجريبية)',
    fr: 'Tableau de sable (démo)',
  },
  {
    slug: 'demo-palm-tray',
    category: 'palm-frond-weaving',
    photos: ['basketBowl'],
    price: 3500,
    availability: 'sold_out',
    stock: 0,
    ar: 'طبق سعف (تجريبي — بيع)',
    fr: 'Plateau en palme (démo — vendu)',
  },
]

for (const [i, d] of DEMO.entries()) {
  const exists = await payload.count({ collection: 'products', where: { slug: { equals: d.slug } } })
  if (exists.totalDocs) continue
  const images: number[] = []
  for (const [j, key] of d.photos.entries()) images.push(await demoMedia(key, i * 2 + j))
  const product = await payload.create({
    collection: 'products',
    locale: 'ar',
    data: {
      slug: d.slug,
      status: 'published',
      featured: true,
      isDemo: true,
      title: d.ar,
      category: category(d.category).id,
      price: d.price,
      availability: d.availability,
      stock: d.stock,
      prepDays: d.prepDays,
      images,
      shortDescription: NOTE_AR,
      description: NOTE_AR,
      story: NOTE_AR,
      details: { materials: 'بيانات تجريبية', dimensions: '— × — cm', origin: 'بيانات تجريبية' },
    },
  })
  await payload.update({
    collection: 'products',
    id: product.id,
    locale: 'fr',
    data: {
      title: d.fr,
      shortDescription: NOTE_FR,
      description: NOTE_FR,
      story: NOTE_FR,
      details: { materials: 'Donnée de démonstration', origin: 'Donnée de démonstration' },
    },
  })
  payload.logger.info(`demo product: ${d.slug}`)
}

// Category covers and the home hero — only where nothing real is set yet.
const COVERS: Record<string, DemoPhotoKey> = {
  'taqurt-embroidery': 'tanchifa',
  'palm-frond-weaving': 'basketBowl',
  'sand-art': 'sandVillage',
}
for (const [slug, key] of Object.entries(COVERS)) {
  const c = category(slug)
  if (c.cover) continue
  await payload.update({ collection: 'categories', id: c.id, data: { cover: await demoMedia(key, 0) } })
}
const settings = await payload.findGlobal({ slug: 'settings', depth: 0 })
if (!settings.heroImage) {
  await payload.updateGlobal({ slug: 'settings', data: { heroImage: await demoMedia('embroideryHands', 0) } })
}
payload.logger.info('demo covers + hero set')

// Demo delivery rates on three wilayas (31 has no stop desk, to test that path).
const DEMO_RATES = [
  { code: 16, homePrice: 800, stopDeskPrice: 450 },
  { code: 55, homePrice: 500, stopDeskPrice: 300 },
  { code: 31, homePrice: 850, stopDeskPrice: null },
]
for (const r of DEMO_RATES) {
  const { docs } = await payload.find({ collection: 'wilayas', where: { code: { equals: r.code } }, limit: 1 })
  const w = docs[0]
  if (!w || (w.active && !w.isDemo)) continue // never overwrite real rates
  await payload.update({
    collection: 'wilayas',
    id: w.id,
    data: { active: true, isDemo: true, homePrice: r.homePrice, stopDeskPrice: r.stopDeskPrice, deliveryTime: '24–72 ساعة' },
  })
}
payload.logger.info('demo delivery rates: 16, 55, 31')
payload.logger.info('demo seed done — remove everything with: pnpm demo:clean')
process.exit(0)
