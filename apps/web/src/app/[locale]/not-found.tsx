import { useTranslations } from 'next-intl'

import { Lozenge } from '@/components/ornaments'
import { Link } from '@/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('notFound')
  return (
    <div className="container-x max-w-xl py-24 text-center">
      <Lozenge className="mx-auto h-12 w-12 text-gold-deep" />
      <h1 className="display mt-5 text-4xl">{t('title')}</h1>
      <p className="mt-3 text-ink-soft">{t('text')}</p>
      <Link href="/" className="btn btn-primary mt-8">
        {t('cta')}
      </Link>
    </div>
  )
}
