import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getOrderDetailWorkflow } from "@medusajs/core-flows"

/**
 * Guest order-tracking endpoint (Protein Pasal, COD-first market).
 *
 * POST /store/order-tracking
 * body: { display_id: number, contact: string }
 *
 * Looks up an order by its human-facing `display_id`, then verifies that the
 * supplied `contact` matches EITHER the order email (case-insensitive) OR the
 * shipping phone (normalised: spaces/dashes/parens stripped, +977 / 977 / 0
 * prefixes removed). This is the only credential a guest has, so verification
 * has to be strict but forgiving of formatting.
 *
 * PRIVACY: on any not-found OR contact mismatch we return an identical 404 with
 * a neutral message — the caller can never distinguish "no such order" from
 * "wrong contact", so the endpoint can't be used to probe which display_ids
 * exist. On success we return ONLY a curated, masked subset of the order (no
 * full address, no unmasked email, no line-item pricing internals).
 *
 * IMPLEMENTATION NOTE: orders are versioned, so the line items / shipping
 * methods / payment collections only resolve correctly through the core
 * getOrderDetailWorkflow (a bare query.graph read returns empty relations and
 * partial totals). We look up the internal id from the public display_id, then
 * defer to that workflow with the same field set the core store retrieve route
 * uses — it also computes the aggregated payment_status / fulfillment_status.
 */

const NEUTRAL_MESSAGE =
  "We couldn't find an order matching those details. Double-check the order number and the email or phone you used at checkout."

// Covers what the core store retrieve route resolves, but in the trailing-dot
// notation `query.graph`/`useQueryGraphStep` expect (`items.*`, NOT `*items` —
// the leading-star shorthand from the HTTP query-config defaults is silently
// dropped by the workflow's raw graph step, which returns empty relations).
// The full pricing graph (item detail, tax lines, adjustments, shipping method
// breakdowns) is required for the order module to compute totals correctly.
const ORDER_FIELDS = [
  "id",
  "status",
  "summary",
  "currency_code",
  "display_id",
  "email",
  "total",
  "subtotal",
  "tax_total",
  "discount_total",
  "item_total",
  "shipping_total",
  "shipping_subtotal",
  "shipping_tax_total",
  "created_at",
  "updated_at",
  "items.*",
  "items.tax_lines.*",
  "items.adjustments.*",
  "items.detail.*",
  "items.variant.*",
  "shipping_address.*",
  "shipping_methods.*",
  "shipping_methods.tax_lines.*",
  "shipping_methods.adjustments.*",
  "payment_collections.*",
  "fulfillments.*",
]

type TimelineStep = {
  key: "placed" | "confirmed" | "shipped" | "delivered"
  label: string
  done: boolean
  at: string | null
}

/**
 * Normalise a Nepali phone number for comparison. Guests type these many ways
 * (`+977 98-1234-5678`, `0981 234 5678`, `9812345678`) — reduce them all to the
 * bare national significant number so equivalent inputs compare equal.
 */
function normalizePhone(raw?: string | null): string {
  if (!raw) return ""
  let p = raw.replace(/[\s\-().]/g, "")
  p = p.replace(/^\+/, "")
  if (p.startsWith("977")) {
    p = p.slice(3)
  }
  p = p.replace(/^0+/, "")
  return p
}

/** Mask an email as `a***@gmail.com` — reveals only the first char + domain. */
function maskEmail(email?: string | null): string | null {
  if (!email) return null
  const at = email.indexOf("@")
  if (at <= 0) return null
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  return `${local.slice(0, 1)}***@${domain}`
}

function firstDate(dates: (string | Date | null | undefined)[]): string | null {
  const valid = dates
    .filter((d): d is string | Date => Boolean(d))
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())
  return valid.length ? valid[0].toISOString() : null
}

/**
 * A COD-friendly 4-step journey derived from the order's fulfillments. The
 * merchant confirms COD orders by phone before packing, so we treat the first
 * fulfillment (packed) as "confirmed". Payment status is deliberately NOT a
 * step — "not paid until delivery" is normal for COD and must never read as a
 * problem in the UI.
 */
function buildTimeline(order: any, fulfillmentStatus: string): TimelineStep[] {
  const fulfillments: any[] = order.fulfillments ?? []
  const active = fulfillments.filter((f) => !f.canceled_at)

  const packedAt = firstDate(active.map((f) => f.packed_at ?? f.created_at))
  const shippedAt = firstDate(active.map((f) => f.shipped_at))
  const deliveredAt = firstDate(active.map((f) => f.delivered_at))

  const isShipped =
    Boolean(shippedAt) ||
    ["shipped", "partially_shipped", "delivered", "partially_delivered"].includes(
      fulfillmentStatus
    )
  const isDelivered =
    Boolean(deliveredAt) ||
    ["delivered", "partially_delivered"].includes(fulfillmentStatus)
  const isConfirmed = active.length > 0 || isShipped || isDelivered

  return [
    {
      key: "placed",
      label: "Order placed",
      done: true,
      at: order.created_at ? new Date(order.created_at).toISOString() : null,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      done: isConfirmed,
      at: isConfirmed ? packedAt : null,
    },
    {
      key: "shipped",
      label: "Shipped",
      done: isShipped,
      at: isShipped ? shippedAt : null,
    },
    {
      key: "delivered",
      label: "Delivered",
      done: isDelivered,
      at: isDelivered ? deliveredAt : null,
    },
  ]
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as { display_id?: unknown; contact?: unknown }

  const displayId = Number(body.display_id)
  const contact = typeof body.contact === "string" ? body.contact.trim() : ""

  if (!Number.isInteger(displayId) || displayId <= 0 || !contact) {
    return res.status(400).json({
      message:
        "Please enter your order number and the email or phone you used at checkout.",
    })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Step 1: resolve the internal order id from the public display_id. Only a
  // scalar field is read here, which resolves reliably without versioning.
  const { data: matches } = await query.graph({
    entity: "order",
    // `display_id` is an autoincrement column: its generated query-filter type is
    // `Maybe<string>`, but the DTO and every runtime path treat it as a number.
    // Cast (compile-time only) so we keep passing the numeric value the runtime expects.
    filters: { display_id: displayId as unknown as string, is_draft_order: false },
    fields: ["id"],
  })

  if (!matches?.length) {
    return res.status(404).json({ message: NEUTRAL_MESSAGE })
  }

  // Step 2: full, version-correct, status-aggregated order via the core
  // workflow. Passing the same `filters` the core store route uses is required
  // — without it the versioned line-item / shipping-method relations resolve
  // empty.
  const { result: order } = (await getOrderDetailWorkflow(req.scope).run({
    input: {
      order_id: matches[0].id,
      fields: ORDER_FIELDS,
      filters: { is_draft_order: false },
    },
  })) as { result: any }

  // Step 3: verify the guest actually owns this order.
  const contactLower = contact.toLowerCase()
  const emailMatch = !!order.email && order.email.toLowerCase() === contactLower
  const normalizedContact = normalizePhone(contact)
  const phoneMatch =
    normalizedContact.length > 0 &&
    normalizePhone(order.shipping_address?.phone) === normalizedContact

  if (!emailMatch && !phoneMatch) {
    // Neutral 404 — never reveal that the order number itself was valid.
    return res.status(404).json({ message: NEUTRAL_MESSAGE })
  }

  const fulfillmentStatus: string = order.fulfillment_status ?? "not_fulfilled"

  const items = (order.items ?? []).map((item: any) => ({
    title: item.product_title ?? item.title ?? "Item",
    variant_title: item.variant_title ?? null,
    quantity: item.quantity ?? 1,
    thumbnail: item.thumbnail ?? null,
  }))

  const shippingMethod = order.shipping_methods?.[0]

  return res.status(200).json({
    order: {
      display_id: order.display_id,
      created_at: order.created_at
        ? new Date(order.created_at).toISOString()
        : null,
      status: order.status,
      payment_status: order.payment_status,
      fulfillment_status: fulfillmentStatus,
      currency_code: order.currency_code,
      email: maskEmail(order.email),
      items,
      shipping_method: shippingMethod
        ? { name: shippingMethod.name ?? null }
        : null,
      // Only ever expose coarse location — first name + city/province.
      shipping_address: order.shipping_address
        ? {
            first_name: order.shipping_address.first_name ?? null,
            city: order.shipping_address.city ?? null,
            province: order.shipping_address.province ?? null,
          }
        : null,
      totals: {
        total: order.total ?? 0,
        shipping_total: order.shipping_total ?? 0,
      },
      timeline: buildTimeline(order, fulfillmentStatus),
    },
  })
}
