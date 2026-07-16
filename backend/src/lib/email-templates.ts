/**
 * Transactional email HTML for Protein Pasal — authored in code (the SMTP
 * provider sends raw `content`, no external template service).
 *
 * Design notes: table-based layout + inline styles only (email-client-safe),
 * brand palette mirrors the storefront (ink #111, red #E63946, paper #FAFAF7).
 * Amounts are Medusa major units = whole NPR rupees, grouped lakh/crore style
 * to match the storefront's formatNPR.
 */

const STOREFRONT_URL =
  process.env.STOREFRONT_URL || "https://gym-ecommerce-six.vercel.app"

/** `150000` → `1,50,000` (South Asian lakh/crore grouping). */
function groupLakh(digits: string): string {
  if (digits.length <= 3) return digits
  const last3 = digits.slice(-3)
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")
  return `${rest},${last3}`
}

export function formatNPR(amount: number | null | undefined): string {
  const rounded = Math.round(Number(amount ?? 0))
  const sign = rounded < 0 ? "-" : ""
  return `${sign}Rs. ${groupLakh(Math.abs(rounded).toString())}`
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Prefilled guest-tracking deep link (form auto-fills from these params). */
export function trackingUrl(displayId: number, contact?: string | null): string {
  const params = new URLSearchParams({ order: String(displayId) })
  if (contact) params.set("contact", contact)
  return `${STOREFRONT_URL}/np/track-order?${params.toString()}`
}

type EmailItem = {
  title: string
  variant_title?: string | null
  quantity: number
  total?: number | null
}

function itemRows(items: EmailItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #ECECE6;font:14px/1.5 Arial,sans-serif;color:#111;">
            ${escapeHtml(item.title)}${
              item.variant_title && item.variant_title !== "Default"
                ? `<span style="color:#8A8A83;"> — ${escapeHtml(item.variant_title)}</span>`
                : ""
            }
            <span style="color:#8A8A83;"> × ${item.quantity}</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #ECECE6;font:14px/1.5 Arial,sans-serif;color:#111;white-space:nowrap;">
            ${formatNPR(item.total)}
          </td>
        </tr>`
    )
    .join("")
}

function shell(bodyHtml: string): string {
  return `
  <div style="margin:0;padding:24px 12px;background:#FAFAF7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
      <tr>
        <td style="background:#111111;padding:20px 28px;">
          <span style="font:700 20px/1 Arial,sans-serif;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">
            Protein <span style="color:#E63946;">Pasal</span>
          </span>
        </td>
      </tr>
      <tr>
        <td style="background:#FFFFFF;padding:28px;border:1px solid #ECECE6;border-top:0;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;font:12px/1.6 Arial,sans-serif;color:#8A8A83;">
          Protein Pasal — authentic supplements, Cash on Delivery across Nepal.<br/>
          Questions? Reply to this email.
        </td>
      </tr>
    </table>
  </div>`
}

export function orderPlacedEmail(order: {
  display_id: number
  email: string
  currency_code: string
  total?: number | null
  item_total?: number | null
  shipping_total?: number | null
  items?: EmailItem[] | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    city?: string | null
    province?: string | null
    phone?: string | null
  } | null
  shipping_methods?: { name?: string | null }[] | null
}): { subject: string; html: string } {
  const name = order.shipping_address?.first_name || "there"
  const track = trackingUrl(order.display_id, order.email)
  const shippingMethod = order.shipping_methods?.[0]?.name

  const html = shell(`
    <h1 style="margin:0 0 6px;font:700 24px/1.2 Arial,sans-serif;color:#111;text-transform:uppercase;">
      Order confirmed 💪
    </h1>
    <p style="margin:0 0 20px;font:14px/1.6 Arial,sans-serif;color:#4A4A45;">
      Hi ${escapeHtml(name)}, thanks for your order! We're getting it packed.
      Pay in cash when it arrives — nothing due until delivery.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;border:1px solid #ECECE6;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font:11px/1 Arial,sans-serif;letter-spacing:2px;color:#8A8A83;text-transform:uppercase;">
            Your tracking code
          </p>
          <p style="margin:8px 0 0;font:700 32px/1 Arial,sans-serif;color:#E63946;">
            #${order.display_id}
          </p>
          <p style="margin:10px 0 0;font:13px/1.5 Arial,sans-serif;color:#4A4A45;">
            Save this code — use it with this email address (or your phone
            number) to follow your delivery anytime. No account needed.
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#E63946;">
          <a href="${track}"
             style="display:inline-block;padding:13px 28px;font:700 13px/1 Arial,sans-serif;letter-spacing:1px;color:#FFFFFF;text-decoration:none;text-transform:uppercase;">
            Track my order
          </a>
        </td>
      </tr>
    </table>

    <h2 style="margin:0 0 4px;font:700 14px/1 Arial,sans-serif;color:#111;text-transform:uppercase;letter-spacing:1px;">
      Order summary
    </h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemRows(order.items ?? [])}
      <tr>
        <td style="padding:10px 0 2px;font:14px/1.5 Arial,sans-serif;color:#4A4A45;">Shipping${
          shippingMethod ? ` — ${escapeHtml(shippingMethod)}` : ""
        }</td>
        <td align="right" style="padding:10px 0 2px;font:14px/1.5 Arial,sans-serif;color:#4A4A45;white-space:nowrap;">
          ${formatNPR(order.shipping_total)}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;font:700 16px/1.5 Arial,sans-serif;color:#111;">Total — due on delivery</td>
        <td align="right" style="padding:8px 0;font:700 16px/1.5 Arial,sans-serif;color:#111;white-space:nowrap;">
          ${formatNPR(order.total)}
        </td>
      </tr>
    </table>

    ${
      order.shipping_address
        ? `<h2 style="margin:20px 0 4px;font:700 14px/1 Arial,sans-serif;color:#111;text-transform:uppercase;letter-spacing:1px;">
             Delivering to
           </h2>
           <p style="margin:0;font:14px/1.6 Arial,sans-serif;color:#4A4A45;">
             ${escapeHtml(
               [
                 [order.shipping_address.first_name, order.shipping_address.last_name]
                   .filter(Boolean)
                   .join(" "),
                 order.shipping_address.address_1,
                 [order.shipping_address.city, order.shipping_address.province]
                   .filter(Boolean)
                   .join(", "),
                 order.shipping_address.phone,
               ]
                 .filter(Boolean)
                 .join(" · ")
             )}
           </p>`
        : ""
    }
  `)

  return {
    subject: `Order confirmed — your tracking code is #${order.display_id}`,
    html,
  }
}

export function shipmentCreatedEmail(order: {
  display_id: number
  email: string
  shipping_address?: { first_name?: string | null } | null
  tracking_numbers?: string[]
}): { subject: string; html: string } {
  const name = order.shipping_address?.first_name || "there"
  const track = trackingUrl(order.display_id, order.email)
  const trackingNumbers = (order.tracking_numbers ?? []).filter(Boolean)

  const html = shell(`
    <h1 style="margin:0 0 6px;font:700 24px/1.2 Arial,sans-serif;color:#111;text-transform:uppercase;">
      Your order is on its way 🚚
    </h1>
    <p style="margin:0 0 20px;font:14px/1.6 Arial,sans-serif;color:#4A4A45;">
      Hi ${escapeHtml(name)}, order <strong style="color:#E63946;">#${order.display_id}</strong>
      has been shipped. Keep your phone handy — our rider will call before
      delivery, and you pay in cash on arrival.
    </p>
    ${
      trackingNumbers.length
        ? `<p style="margin:0 0 20px;font:14px/1.6 Arial,sans-serif;color:#4A4A45;">
             Courier tracking: <strong>${trackingNumbers.map(escapeHtml).join(", ")}</strong>
           </p>`
        : ""
    }
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#E63946;">
          <a href="${track}"
             style="display:inline-block;padding:13px 28px;font:700 13px/1 Arial,sans-serif;letter-spacing:1px;color:#FFFFFF;text-decoration:none;text-transform:uppercase;">
            Track my order
          </a>
        </td>
      </tr>
    </table>
  `)

  return {
    subject: `Order #${order.display_id} has shipped 🚚`,
    html,
  }
}
