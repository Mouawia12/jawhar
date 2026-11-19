/** Removes every piece of demo data. Real data (isDemo = false) is never touched. */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const isDemoMedia = (m: unknown) =>
  typeof m === 'object' && m !== null && 'filename' in m && String((m as { filename?: string }).filename).startsWith('demo-')

const orders = await payload.delete({ collection: 'orders', where: { isDemo: { equals: true } } })
payload.logger.info(`demo orders removed: ${orders.docs.length}`)

const products = await payload.delete({ collection: 'products', where: { isDemo: { equals: true } } })
payload.logger.info(`demo products removed: ${products.docs.length}`)

// Unlink demo covers / hero before deleting the files they point to.
const categories = await payload.find({ collection: 'categories', depth: 1, limit: 100 })
for (const c of categories.docs) {
  if (isDemoMedia(c.cover)) await payload.update({ collection: 'categories', id: c.id, data: { cover: null } })
}
const settings = await payload.findGlobal({ slug: 'settings', depth: 1 })
if (isDemoMedia(settings.heroImage)) await payload.updateGlobal({ slug: 'settings', data: { heroImage: null } })

const media = await payload.delete({ collection: 'media', where: { filename: { like: 'demo-' } } })
payload.logger.info(`demo media removed: ${media.docs.length}`)

const wilayas = await payload.update({
  collection: 'wilayas',
  where: { isDemo: { equals: true } },
  data: { active: false, isDemo: false, homePrice: null, stopDeskPrice: null, deliveryTime: null },
})
payload.logger.info(`demo delivery rates reset: ${wilayas.docs.length}`)

process.exit(0)
