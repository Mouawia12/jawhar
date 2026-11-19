import { formatDZD } from '@jawhar/shared'

type OrderDoc = {
  id: number | string
  number?: string | null
  fullName?: string | null
  phone?: string | null
  wilayaName?: string | null
  commune?: string | null
  deliveryType?: string | null
  total?: number | null
  isDemo?: boolean | null
  items?: { title?: string | null; quantity?: number | null }[] | null
}

/**
 * New-order alert to the owner's phone via a Telegram bot (free, instant, no Meta
 * verification). Enabled only when TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set.
 * WhatsApp Business API can replace this later behind the same function.
 */
export async function notifyNewOrder(order: OrderDoc): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const adminUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL ?? ''}/admin/collections/orders/${order.id}`
  const lines = [
    `${order.isDemo ? '🧪 طلب تجريبي' : '🛍️ طلب جديد'} ${order.number ?? ''}`,
    `👤 ${order.fullName ?? ''} — ${order.phone ?? ''}`,
    `📍 ${order.wilayaName ?? ''} / ${order.commune ?? ''} (${order.deliveryType === 'stopdesk' ? 'مكتب' : 'منزل'})`,
    ...(order.items ?? []).map((i) => `• ${i.title ?? ''} × ${i.quantity ?? 1}`),
    `💰 ${formatDZD(order.total ?? 0, 'ar')}`,
    adminUrl,
  ]

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Telegram ${res.status}`)
}
