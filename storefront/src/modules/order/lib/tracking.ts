import { HttpTypes } from "@medusajs/types"

/**
 * One node of the delivery journey shown on the tracking timeline.
 * The backend `/store/order-tracking` route returns this exact shape; the
 * confirmation + account order pages derive an equivalent array locally from a
 * full StoreOrder so the same <TrackingTimeline> renders everywhere.
 * A canceled order collapses the journey to [placed, canceled].
 */
export type TrackingStep = {
  key: "placed" | "confirmed" | "shipped" | "delivered" | "canceled"
  label: string
  done: boolean
  at: string | null
}

/** Result state for the `useActionState`-driven guest tracking form. */
export type TrackOrderState = {
  status: "idle" | "success" | "error"
  order: TrackedOrder | null
  error: string | null
}

export const TRACK_ORDER_INITIAL_STATE: TrackOrderState = {
  status: "idle",
  order: null,
  error: null,
}

/** The masked, safe-to-expose order shape returned by /store/order-tracking. */
export type TrackedOrder = {
  display_id: number
  created_at: string | null
  status: string
  payment_status: string
  fulfillment_status: string
  currency_code: string
  email: string | null
  items: {
    title: string
    variant_title: string | null
    quantity: number
    thumbnail: string | null
  }[]
  shipping_method: { name: string | null } | null
  shipping_address: {
    first_name: string | null
    city: string | null
    province: string | null
  } | null
  totals: { total: number; shipping_total: number }
  timeline: TrackingStep[]
}

const SHIPPED_STATUSES = [
  "shipped",
  "partially_shipped",
  "delivered",
  "partially_delivered",
]
const DELIVERED_STATUSES = ["delivered", "partially_delivered"]
const CONFIRMED_STATUSES = ["fulfilled", "partially_fulfilled"]

/** Human refund note from Medusa's payment_status — null when not refunded. */
export function refundLabel(paymentStatus?: string | null): string | null {
  if (paymentStatus === "refunded") return "Refunded"
  if (paymentStatus === "partially_refunded") return "Partially refunded"
  return null
}

/** True when the order is canceled in Medusa. */
export function isOrderCanceled(
  order: Pick<HttpTypes.StoreOrder, "status"> & { canceled_at?: string | null }
): boolean {
  return order.status === "canceled" || Boolean(order.canceled_at)
}

type TimelineSource = Pick<
  HttpTypes.StoreOrder,
  "created_at" | "fulfillment_status"
> & {
  status?: string
  canceled_at?: string | Date | null
  fulfillments?:
    | {
        canceled_at?: string | Date | null
        created_at?: string | Date | null
        packed_at?: string | Date | null
        shipped_at?: string | Date | null
        delivered_at?: string | Date | null
      }[]
    | null
}

const firstDate = (
  dates: (string | Date | null | undefined)[]
): string | null => {
  const valid = dates
    .filter((d): d is string | Date => Boolean(d))
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())
  return valid.length ? valid[0].toISOString() : null
}

/**
 * Derive the delivery timeline from a StoreOrder (confirmation + account
 * order pages) WITHOUT an extra fetch. Sources every Medusa state:
 *  - order.status/canceled_at → collapsed [placed, canceled] journey,
 *  - fulfillments' packed/shipped/delivered timestamps → step dates,
 *  - aggregated fulfillment_status → step completion fallback.
 * Mirrors the backend /store/order-tracking derivation so the guest tracking
 * view and the logged-in views stay consistent.
 */
export function deriveTimelineFromOrder(order: TimelineSource): TrackingStep[] {
  const placedAt = order.created_at ? String(order.created_at) : null

  if (isOrderCanceled(order as any)) {
    return [
      { key: "placed", label: "Order placed", done: true, at: placedAt },
      {
        key: "canceled",
        label: "Canceled",
        done: true,
        at: order.canceled_at ? String(order.canceled_at) : null,
      },
    ]
  }

  const fs = order.fulfillment_status ?? "not_fulfilled"
  const active = (order.fulfillments ?? []).filter((f) => !f.canceled_at)

  const packedAt = firstDate(active.map((f) => f.packed_at ?? f.created_at))
  const shippedAt = firstDate(active.map((f) => f.shipped_at))
  const deliveredAt = firstDate(active.map((f) => f.delivered_at))

  const shipped = Boolean(shippedAt) || SHIPPED_STATUSES.includes(fs)
  const delivered = Boolean(deliveredAt) || DELIVERED_STATUSES.includes(fs)
  const confirmed =
    active.length > 0 || shipped || delivered || CONFIRMED_STATUSES.includes(fs)

  return [
    { key: "placed", label: "Order placed", done: true, at: placedAt },
    {
      key: "confirmed",
      label: "Confirmed",
      done: confirmed,
      at: confirmed ? packedAt : null,
    },
    {
      key: "shipped",
      label: "Shipped",
      done: shipped,
      at: shipped ? shippedAt : null,
    },
    {
      key: "delivered",
      label: "Delivered",
      done: delivered,
      at: delivered ? deliveredAt : null,
    },
  ]
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

// Nepal Time is a fixed UTC+05:45 (no DST). Shifting the instant by the offset
// and then reading the UTC calendar parts yields the Nepal-local date in a way
// that is identical on the server and the client — so no hydration mismatch.
const NPT_OFFSET_MS = (5 * 60 + 45) * 60 * 1000

/** Deterministic `16 Jul 2026` formatting in Nepal time (hydration-safe). */
export function formatTrackingDate(iso?: string | null): string | null {
  if (!iso) return null
  const base = new Date(iso)
  if (isNaN(base.getTime())) return null
  const d = new Date(base.getTime() + NPT_OFFSET_MS)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
