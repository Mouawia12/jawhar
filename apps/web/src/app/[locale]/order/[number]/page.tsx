import { formatDZD } from '@jawhar/shared'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Lozenge } from '@/components/ornaments'
import { Link } from '@/i18n/navigation'
import { api } from '@/lib/api'
import { whatsappLink } from '@/lib/site'

type Props = {
  params: Promise<{ locale: string; number: string }>
  searchParams: Promise<{ t?: string }>
}

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function OrderPage({ params, searchParams }: Props) {
  const { locale, number } = await params
  const { t: token } = await searchParams
  setRequestLocale(locale)

  const [order, settings, t, to] = await Promise.all([
    token ? api.trackOrder(decodeURIComponent(number), token).catch(() => null) : null,
    api.settings(locale),
    getTranslations({ locale, namespace: 'confirm' }),
    getTranslations({ locale, namespace: 'order' }),
  ])

  if (!order) {
    const wa = whatsappLink(settings)
    return (
      <div className="container-x max-w-2xl pt-16 text-center">
        <h1 className="display text-4xl">{t('notFoundTitle')}</h1>
        <p className="mt-3 text-ink-soft">{t('notFoundText')}</p>
        <div className="mt-8 flex justify-center gap-3">
          {wa ? (
            <a href={wa} className="btn btn-primary" target="_blank" rel="noopener">
              WhatsApp
            </a>
          ) : null}
          <Link href="/" className="btn btn-quiet">
            {t('back')}
          </Link>
        </div>
      </div>
    )
  }

  const wa = whatsappLink(settings, t('whatsappMessage', { number: order.number }))

  return (
    <div className="container-x max-w-2xl pt-12 md:pt-20">
      <Lozenge className="h-12 w-12 text-gold-deep" />
      <h1 className="display mt-4 text-4xl md:text-5xl">{t('title')}</h1>
      <p className="mt-4 text-lg">{t('text')}</p>
      {order.isDemo ? <p className="hint mt-3 rounded-md border border-dashed border-gold-deep px-4 py-2">{t('demo')}</p> : null}

      <div className="frame mt-10">
        <div className="frame-inner px-6 py-7 text-center">
          <p className="text-ink-soft">{t('number')}</p>
          <p className="mt-1 text-4xl font-bold tracking-wider tabular-nums md:text-5xl" dir="ltr">
            {order.number}
          </p>
          <p className="hint mt-2">{t('keep')}</p>
        </div>
      </div>

      <section aria-labelledby="summary-title" className="mt-10">
        <h2 id="summary-title" className="display text-2xl">
          {t('summary')}
        </h2>
        <dl className="mt-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-4 border-b border-dashed border-gold/70 py-3">
              <dt>
                {item.title}
                {item.quantity > 1 ? ` × ${item.quantity}` : ''}
              </dt>
              <dd className="tabular-nums">{formatDZD(item.lineTotal, locale)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-b border-dashed border-gold/70 py-3">
            <dt>
              {t('deliveryTo')}: {order.wilayaName} — {to(order.deliveryType)}
            </dt>
            <dd className="tabular-nums">{formatDZD(order.shippingFee, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3 text-lg font-bold">
            <dt>{to('total')}</dt>
            <dd className="tabular-nums">{formatDZD(order.total, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1 text-ink-soft">
            <dt>{t('status')}</dt>
            <dd>{t(`statuses.${order.status}`)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        {wa ? (
          <a href={wa} target="_blank" rel="noopener" className="btn btn-primary">
            {t('whatsapp')}
          </a>
        ) : null}
        <Link href="/" className="btn btn-quiet">
          {t('back')}
        </Link>
      </div>
    </div>
  )
}
