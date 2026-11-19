'use client'

import {
  type CheckoutInput,
  type CheckoutResponse,
  checkoutSchema,
  type DeliveryType,
  formatDZD,
  MAX_QTY_PER_ITEM,
  toFieldErrors,
} from '@jawhar/shared'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useMemo, useState } from 'react'

import { useRouter } from '@/i18n/navigation'

export type WilayaOption = {
  code: number
  nameAr: string
  nameFr: string
  homePrice: number | null
  stopDeskPrice: number | null
  deliveryTime: string | null
  isDemo: boolean
}

type Props = {
  apiUrl: string
  product: { id: number; title: string; price: number; maxQuantity: number }
  wilayas: WilayaOption[]
  whatsappHref: string | null
}

type Errors = Record<string, string[]>

/**
 * One-step cash-on-delivery order, on the product page itself — the pattern that
 * works for visitors arriving from Facebook/Instagram/TikTok in Algeria.
 * Validated here and again by the API with the same shared schema.
 */
export function OrderForm({ apiUrl, product, wilayas, whatsappHref }: Props) {
  const t = useTranslations('order')
  const te = useTranslations('errors')
  const locale = useLocale()
  const router = useRouter()
  const uid = useId()

  const [quantity, setQuantity] = useState(1)
  const [wilayaCode, setWilayaCode] = useState<number | ''>('')
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const wilaya = useMemo(() => wilayas.find((w) => w.code === wilayaCode) ?? null, [wilayas, wilayaCode])
  const stopdeskAvailable = wilaya ? wilaya.stopDeskPrice !== null : true
  const effectiveDelivery: DeliveryType = !stopdeskAvailable ? 'home' : deliveryType
  const shippingFee = wilaya ? (effectiveDelivery === 'home' ? wilaya.homePrice : wilaya.stopDeskPrice) : null
  const subtotal = product.price * quantity
  const anyDemoRates = wilayas.some((w) => w.isDemo)

  const errorFor = (key: string) => {
    const code = errors[`customer.${key}`]?.[0] ?? errors[key]?.[0]
    return code ? (te.has(code) ? te(code) : te('generic')) : null
  }

  if (wilayas.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gold p-5">
        <p>{t('unavailable')}</p>
        {whatsappHref ? (
          <a href={whatsappHref} target="_blank" rel="noopener" className="btn btn-primary mt-4 w-full">
            {t('whatsappOrder')}
          </a>
        ) : null}
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    const form = new FormData(e.currentTarget)
    const input: CheckoutInput = {
      items: [{ productId: product.id, quantity }],
      customer: {
        fullName: String(form.get('fullName') ?? ''),
        phone: String(form.get('phone') ?? ''),
        wilayaCode: wilayaCode === '' ? Number.NaN : wilayaCode,
        commune: String(form.get('commune') ?? ''),
        deliveryType: effectiveDelivery,
        address: String(form.get('address') ?? ''),
        notes: String(form.get('notes') ?? ''),
      },
      locale: locale as CheckoutInput['locale'],
      website: String(form.get('website') ?? ''),
    }

    const parsed = checkoutSchema.safeParse(input)
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(null)
      focusFirstError(e.currentTarget)
      return
    }

    setSubmitting(true)
    setErrors({})
    setFormError(null)
    try {
      const res = await fetch(`${apiUrl}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      })
      const body = (await res.json().catch(() => null)) as CheckoutResponse | null
      if (body?.ok) {
        router.push(`/order/${body.order.number}?t=${encodeURIComponent(body.accessToken)}`)
        return
      }
      if (body?.error === 'validation_failed' && body.fieldErrors) {
        setErrors(body.fieldErrors)
      } else {
        setFormError(body?.error && te.has(body.error) ? te(body.error) : te('generic'))
      }
      setSubmitting(false)
    } catch {
      setFormError(te('network'))
      setSubmitting(false)
    }
  }

  const field = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    'aria-invalid': errorFor(name) ? true : undefined,
    'aria-describedby': errorFor(name) ? `${uid}-${name}-error` : undefined,
  })
  const ErrorLine = ({ name }: { name: string }) =>
    errorFor(name) ? (
      <p id={`${uid}-${name}-error`} className="error-text mt-1">
        {errorFor(name)}
      </p>
    ) : null

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-labelledby={`${uid}-title`}>
      <div>
        <h2 id={`${uid}-title`} className="display text-2xl md:text-3xl">
          {t('title')}
        </h2>
        <p className="hint mt-1">{t('subtitle')}</p>
      </div>

      {product.maxQuantity > 1 && (
        <div>
          <label htmlFor={`${uid}-qty`} className="label">
            {t('quantity')}
          </label>
          <select
            id={`${uid}-qty`}
            className="field max-w-28"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          >
            {Array.from({ length: Math.min(product.maxQuantity, MAX_QTY_PER_ITEM) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor={`${uid}-fullName`} className="label">
          {t('fullName')}
        </label>
        <input {...field('fullName')} className="field" autoComplete="name" required maxLength={80} />
        <ErrorLine name="fullName" />
      </div>

      <div>
        <label htmlFor={`${uid}-phone`} className="label">
          {t('phone')}
        </label>
        <input
          {...field('phone')}
          className="field text-start"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="05XX XX XX XX"
          required
          aria-describedby={errorFor('phone') ? `${uid}-phone-error` : `${uid}-phone-hint`}
        />
        {errorFor('phone') ? <ErrorLine name="phone" /> : <p id={`${uid}-phone-hint`} className="hint mt-1">{t('phoneHint')}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-wilayaCode`} className="label">
            {t('wilaya')}
          </label>
          <select
            {...field('wilayaCode')}
            className="field"
            value={wilayaCode}
            onChange={(e) => setWilayaCode(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">{t('wilayaPlaceholder')}</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} — {locale === 'ar' ? w.nameAr : w.nameFr}
              </option>
            ))}
          </select>
          <ErrorLine name="wilayaCode" />
        </div>
        <div>
          <label htmlFor={`${uid}-commune`} className="label">
            {t('commune')}
          </label>
          <input {...field('commune')} className="field" autoComplete="address-level2" required maxLength={80} />
          <ErrorLine name="commune" />
        </div>
      </div>

      <fieldset>
        <legend className="label">{t('deliveryType')}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['home', 'stopdesk'] as const).map((type) => {
            const disabled = type === 'stopdesk' && !stopdeskAvailable
            const price = wilaya ? (type === 'home' ? wilaya.homePrice : wilaya.stopDeskPrice) : null
            return (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-3 rounded-[10px] border-[1.5px] px-4 py-3 ${effectiveDelivery === type ? 'border-clay-strong bg-[#fffdf8]' : 'border-ink/20'} ${disabled ? 'cursor-not-allowed opacity-55' : ''}`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value={type}
                  checked={effectiveDelivery === type}
                  disabled={disabled}
                  onChange={() => setDeliveryType(type)}
                  className="accent-[var(--color-clay-strong)]"
                />
                <span className="flex-1 leading-snug">
                  {t(type)}
                  {disabled ? <span className="block text-sm text-ink-soft">{t('noStopdesk')}</span> : null}
                </span>
                {price !== null ? <span className="text-sm font-semibold tabular-nums">{formatDZD(price, locale)}</span> : null}
              </label>
            )
          })}
        </div>
        <ErrorLine name="deliveryType" />
        {wilaya?.deliveryTime ? <p className="hint mt-1">{t('deliveryTime', { time: wilaya.deliveryTime })}</p> : null}
      </fieldset>

      {effectiveDelivery === 'home' && (
        <div>
          <label htmlFor={`${uid}-address`} className="label">
            {t('address')}
          </label>
          <textarea
            {...field('address')}
            className="field min-h-20"
            autoComplete="street-address"
            rows={2}
            maxLength={200}
            aria-describedby={errorFor('address') ? `${uid}-address-error` : `${uid}-address-hint`}
          />
          {errorFor('address') ? <ErrorLine name="address" /> : <p id={`${uid}-address-hint`} className="hint mt-1">{t('addressHint')}</p>}
        </div>
      )}

      <div>
        <label htmlFor={`${uid}-notes`} className="label">
          {t('notes')}
        </label>
        <textarea {...field('notes')} className="field min-h-16" rows={2} maxLength={500} />
      </div>

      {/* Honeypot — invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <dl className="space-y-1.5 rounded-md bg-linen px-5 py-4">
        <div className="flex justify-between gap-4">
          <dt>
            {t('subtotal')}
            {quantity > 1 ? ` × ${quantity}` : ''}
          </dt>
          <dd className="tabular-nums">{formatDZD(subtotal, locale)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t('shipping')}</dt>
          <dd className="tabular-nums">{shippingFee !== null ? formatDZD(shippingFee, locale) : <span className="text-ink-soft">{t('shippingPending')}</span>}</dd>
        </div>
        <div className="stitch my-2" aria-hidden="true" />
        <div className="flex justify-between gap-4 text-lg font-bold">
          <dt>{t('total')}</dt>
          <dd className="tabular-nums" aria-live="polite">
            {formatDZD(subtotal + (shippingFee ?? 0), locale)}
          </dd>
        </div>
      </dl>
      {anyDemoRates ? <p className="hint">{t('demoRates')}</p> : null}

      {formError ? (
        <p role="alert" className="rounded-md border border-alert/40 bg-[#fbeee9] px-4 py-3 text-alert">
          {formError}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full text-lg" disabled={submitting}>
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}

function focusFirstError(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
}
