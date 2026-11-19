import { useTranslations } from 'next-intl'

import { stagger } from '@/lib/motion'

import { SectionHeading } from './SectionHeading'

const icon = {
  cod: 'M4 9h16v10H4z M4 9l3-4h10l3 4 M12 12v4 M10 14h4',
  delivery: 'M3 7h11v9H3z M14 10h4l3 3v3h-7 M7 19a1.5 1.5 0 1 0 0-.1 M17 19a1.5 1.5 0 1 0 0-.1',
  info: 'M5 4h10l4 4v12H5z M15 4v4h4 M8 12h8 M8 16h6',
  contact: 'M4 5h16v11H9l-5 4z M8 9h8 M8 12h5',
}

/**
 * Only states what is actually true: the delivery line appears only when at least
 * one wilaya is active, the contact line only when a WhatsApp number is set.
 */
export function TrustList({ activeWilayas, hasWhatsapp }: { activeWilayas: number; hasWhatsapp: boolean }) {
  const t = useTranslations('trust')
  const items = [
    { key: 'cod', title: t('cod'), text: t('codText') },
    activeWilayas > 0 && { key: 'delivery', title: t('delivery', { count: activeWilayas }), text: t('deliveryText') },
    { key: 'info', title: t('info'), text: t('infoText') },
    hasWhatsapp && { key: 'contact', title: t('contact'), text: t('contactText') },
  ].filter(Boolean) as { key: keyof typeof icon; title: string; text: string }[]

  return (
    <section aria-labelledby="trust-title" className="container-x mt-24">
      <SectionHeading id="trust-title" size="md">
        {t('title')}
      </SectionHeading>
      <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.key} data-reveal style={stagger(i)} className="flex gap-4">
            <svg viewBox="0 0 24 24" className="draw mt-1 h-7 w-7 shrink-0 text-clay-strong" aria-hidden="true">
              <path d={icon[item.key]} pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-ink-soft">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
