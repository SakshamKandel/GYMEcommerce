import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const formatStatus = (str?: string | null) => {
  if (!str) return "—"
  const formatted = str.split("_").join(" ")
  return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  return (
    <div className="flex flex-col gap-2 font-body text-body-sm text-ash">
      <p>
        We&apos;ve sent the order confirmation to{" "}
        <span className="font-semibold text-ink" data-testid="order-email">
          {order.email}
        </span>
        . We&apos;ll call you shortly to confirm your Cash-on-Delivery order.
      </p>
      <p>
        Order date:{" "}
        <span className="text-ink" data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </p>
      <p>
        Order number:{" "}
        <span className="font-semibold text-ink" data-testid="order-id">
          #{order.display_id}
        </span>
      </p>

      {showStatus && (
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span
            className="inline-flex items-center gap-2 border border-ink/20 px-3 py-1.5 font-mono text-label-sm uppercase tracking-label text-ash"
            data-testid="order-status"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            {formatStatus(order.fulfillment_status)}
          </span>
          <span
            className="inline-flex items-center gap-2 border border-ink/20 px-3 py-1.5 font-mono text-label-sm uppercase tracking-label text-ash"
            data-testid="order-payment-status"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            {formatStatus(order.payment_status)}
          </span>
        </div>
      )}
    </div>
  )
}

export default OrderDetails
