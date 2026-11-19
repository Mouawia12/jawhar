'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function ShareButton({ title, url }: { title: string; url: string }) {
  const t = useTranslations('product')
  const [copied, setCopied] = useState(false)

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // cancelled by the user — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt(t('share'), url)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.95rem]">
      <button type="button" onClick={share} className="font-semibold underline decoration-gold decoration-dashed decoration-2 underline-offset-8 hover:text-clay-strong">
        {copied ? t('copied') : t('share')}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
        target="_blank"
        rel="noopener"
        className="font-semibold underline decoration-gold decoration-dashed decoration-2 underline-offset-8 hover:text-clay-strong"
      >
        {t('shareWhatsapp')}
      </a>
      <span role="status" className="sr-only">
        {copied ? t('copied') : ''}
      </span>
    </div>
  )
}
