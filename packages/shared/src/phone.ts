const ARABIC_INDIC = /[٠-٩]/g // ٠-٩
const EASTERN_ARABIC_INDIC = /[۰-۹]/g // ۰-۹

/** Customers on Arabic keyboards often type ٠٥٥٥… — convert to ASCII digits first. */
export function toLatinDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EASTERN_ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x06f0))
}

/**
 * Normalizes an Algerian mobile number to the local 10-digit form (05/06/07 + 8 digits).
 * Accepts spaces, dashes, +213, 00213 and Arabic-Indic digits. Returns null if invalid.
 */
export function normalizeDzMobile(input: string): string | null {
  let d = toLatinDigits(input).replace(/[^\d]/g, '')
  if (d.startsWith('00213')) d = d.slice(5)
  else if (d.startsWith('213')) d = d.slice(3)
  if (d.length === 9 && /^[567]/.test(d)) d = `0${d}`
  return /^0[567]\d{8}$/.test(d) ? d : null
}

/** 0555123456 → 213555123456 (the format wa.me links expect). */
export function toInternationalDz(localMobile: string): string {
  return `213${localMobile.replace(/^0/, '')}`
}
