'use client'

import { useTheme, useTranslation } from '@payloadcms/ui'

const labels = {
  ar: { toDark: 'التبديل إلى الوضع الداكن', toLight: 'التبديل إلى الوضع الفاتح' },
  fr: { toDark: 'Passer en mode sombre', toLight: 'Passer en mode clair' },
}

/**
 * Light/dark switch in the admin top bar. Payload already follows the device setting
 * until a choice is made; this stores the choice in its theme cookie for a year.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const t = i18n.language === 'fr' ? labels.fr : labels.ar
  const dark = theme === 'dark'
  const label = dark ? t.toLight : t.toDark

  return (
    <button
      type="button"
      className="jawhar-theme-toggle"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
    >
      {dark ? (
        // Sun: switch back to light
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.55 1.55M17.15 17.15l1.55 1.55M5.3 18.7l1.55-1.55M17.15 6.85l1.55-1.55" />
        </svg>
      ) : (
        // Moon: switch to dark
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z" />
        </svg>
      )}
    </button>
  )
}
