import { clx } from "@medusajs/ui"
import { formatNPR } from "@lib/util/money"
import Thumbnail from "@modules/products/components/thumbnail"
import TrackingTimeline from "@modules/order/components/tracking-timeline"
import { TrackedOrder } from "@modules/order/lib/tracking"

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXXX" // TODO(business-contact)

// Payment states that mean the customer has actually paid (rare for COD, but
// possible if a rider marks it captured). Everything else is "due on delivery"
// — which for Cash on Delivery is the NORMAL, expected state, never an error.
const PAID_STATUSES = [
  "captured",
  "partially_captured",
  "refunded",
  "partially_refunded",
]

// Zone ETA copy keyed off the shipping option name (matches ShippingDetails).
const etaForMethod = (name?: string | null): string | null => {
  if (!name) return null
  const lower = name.toLowerCase()
  if (lower.includes("outside")) return "Delivered in 3–5 days"
  if (lower.includes("inside") || lower.includes("valley")) {
    return "Delivered in 1–2 days"
  }
  return null
}

const headlineFor = (order: TrackedOrder): string => {
  const done = order.timeline.filter((s) => s.done)
  const last = done[done.length - 1]?.key
  switch (last) {
    case "delivered":
      return "Delivered — thank you!"
    case "shipped":
      return "On its way to you"
    case "confirmed":
      return "Confirmed & being packed"
    default:
      return "We've got your order"
  }
}

type TrackingResultProps = {
  order: TrackedOrder
  /** When embedded below the search form, add a top rule + reset affordance. */
  onReset?: React.ReactNode
}

const TrackingResult = ({ order, onReset }: TrackingResultProps) => {
  const isPaid = PAID_STATUSES.includes(order.payment_status)
  const eta = etaForMethod(order.shipping_method?.name)
  const address = order.shipping_address

  return (
    <div
      className="flex flex-col gap-8 border border-line bg-paper p-6 md:p-10"
      data-testid="tracking-result"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-label uppercase tracking-label text-red mb-2">
            {headlineFor(order)}
          </p>
          <h2 className="font-display text-display-2 uppercase leading-none text-ink">
            Order #{order.display_id}
          </h2>
        </div>
        {onReset}
      </div>

      {/* Timeline */}
      <TrackingTimeline steps={order.timeline} data-testid="tracking-timeline" />

      {/* COD / paid callout */}
      <div
        className={clx(
          "border px-6 py-6 text-center",
          isPaid
            ? "border-line bg-fog text-ink"
            : "border-ink bg-ink text-paper"
        )}
        data-testid="tracking-cod-callout"
      >
        <p
          className={clx(
            "font-mono text-label uppercase tracking-label mb-2",
            isPaid ? "text-ash" : "text-paper/70"
          )}
        >
          {isPaid ? "Amount paid" : "Amount due on delivery"}
        </p>
        <p className="font-display text-4xl md:text-5xl uppercase leading-none">
          {formatNPR(order.totals.total)}
        </p>
        <p
          className={clx(
            "mt-3 font-body text-body-sm",
            isPaid ? "text-ash" : "text-paper/70"
          )}
        >
          {isPaid
            ? "This order has been paid in full."
            : "Pay the rider in cash when your order arrives — no advance payment needed."}
        </p>
      </div>

      {/* Items */}
      <div>
        <h3 className="font-body text-h4 font-semibold text-ink mb-3">
          In this order
        </h3>
        <ul className="flex flex-col border-t border-ink/15">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-4 border-b border-line py-4"
              data-testid="tracking-item"
            >
              <Thumbnail
                thumbnail={item.thumbnail}
                size="square"
                alt={item.title}
                className="!rounded-base !bg-fog !shadow-none w-16 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm font-semibold uppercase text-ink">
                  {item.title}
                </p>
                {item.variant_title && (
                  <p className="mt-1 font-body text-body-sm text-ash">
                    {item.variant_title}
                  </p>
                )}
              </div>
              <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Delivery + method */}
      <div className="grid grid-cols-1 gap-6 small:grid-cols-3">
        <div className="flex flex-col gap-1" data-testid="tracking-delivery-to">
          <p className="font-mono text-label-sm uppercase tracking-label text-ash">
            Delivering to
          </p>
          {address?.first_name && (
            <p className="font-body text-body-sm text-ink">
              {address.first_name}
            </p>
          )}
          <p className="font-body text-body-sm text-ink">
            {[address?.city, address?.province].filter(Boolean).join(", ") ||
              "—"}
          </p>
          <p className="font-body text-body-sm text-ash">
            Full address hidden for your privacy
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-mono text-label-sm uppercase tracking-label text-ash">
            Method
          </p>
          <p className="font-body text-body-sm text-ink">
            {order.shipping_method?.name ?? "Standard delivery"}
          </p>
          {eta && (
            <p className="font-body text-body-sm text-ash">
              {eta} · Cash on Delivery
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-mono text-label-sm uppercase tracking-label text-ash">
            Confirmation sent to
          </p>
          <p className="font-body text-body-sm text-ink">
            {order.email ?? "—"}
          </p>
          <p className="font-body text-body-sm text-ash">
            Shipping fee {formatNPR(order.totals.shipping_total)}
          </p>
        </div>
      </div>

      {/* Help */}
      <div className="border-t border-line pt-6">
        <p className="font-mono text-label uppercase tracking-label text-red mb-2">
          Something not right?
        </p>
        <p className="font-body text-body-sm text-ash">
          Message us the order number{" "}
          <span className="font-semibold text-ink">#{order.display_id}</span>{" "}
          and we&apos;ll sort it out fast.{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hi Protein Pasal, I have a question about order #${order.display_id}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline underline-offset-4 hover:text-red"
            data-testid="tracking-whatsapp-link"
          >
            Chat with us on WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default TrackingResult
