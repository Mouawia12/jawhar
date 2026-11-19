/**
 * Prices are stored as whole dinars (integers). Displayed with Latin digits and
 * space grouping, the way prices are written in Algeria: "4 500 دج" / "4 500 DA".
 */
export function formatDZD(amount: number, locale: string): string {
  const n = new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(amount)
  return locale === 'ar' ? `${n} دج` : `${n} DA`
}
