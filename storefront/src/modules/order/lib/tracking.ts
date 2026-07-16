import { HttpTypes } from "@medusajs/types"

/**
 * One node of the 4-step delivery journey shown on the tracking timeline.
 * The backend `/store/order-tracking` route returns this exact shape; the
 * confirmation + account order pages derive an equivalent array locally from a
 * full StoreOrder so the same <TrackingTimeline> renders everywhere.
 */
export type TrackingStep = {
  key: "placed" | "confirmed" | "shipped" | "delivered"
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

/**
 * Derive the 4-step timeline from a full StoreOrder (confirmation + account
 * order pages) WITHOUT an extra fetch — purely from the already-computed
 * `fulfillment_status` and `created_at`. Mirrors the backend derivation so the
 * guest tracking view and the logged-in views stay consistent.
 */
export function deriveTimelineFromOrder(
  order: Pick<HttpTypes.StoreOrder, "created_at" | "fulfillment_status">
): TrackingStep[] {
  const fs = order.fulfillment_status ?? "not_fulfilled"
  const shipped = SHIPPED_STATUSES.includes(fs)
  const delivered = DELIVERED_STATUSES.includes(fs)
  const confirmed = shipped || delivered || CONFIRMED_STATUSES.includes(fs)

  return [
    {
      key: "placed",
      label: "Order placed",
      done: true,
      at: order.created_at ? String(order.created_at) : null,
    },
    { key: "confirmed", label: "Confirmed", done: confirmed, at: null },
    { key: "shipped", label: "Shipped", done: shipped, at: null },
    { key: "delivered", label: "Delivered", done: delivered, at: null },
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
