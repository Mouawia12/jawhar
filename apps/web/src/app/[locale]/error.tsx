'use client'

import { useTranslations } from 'next-intl'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error')
  return (
    <div className="container-x max-w-xl py-24 text-center">
      <h1 className="display text-4xl">{t('title')}</h1>
      <p className="mt-3 text-ink-soft">{t('text')}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8">
        {t('retry')}
      </button>
    </div>
  )
}
