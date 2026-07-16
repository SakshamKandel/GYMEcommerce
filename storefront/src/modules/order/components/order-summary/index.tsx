import { formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return formatNPR(0)
    }
    return formatNPR(amount)
  }

  return (
    <div>
      <h2 className="font-body text-h4 font-semibold text-ink mb-3">
        Order summary
      </h2>
      <div className="font-body text-body-sm text-ink flex flex-col gap-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-ash">Subtotal</span>
          <span>{getAmount(order.subtotal)}</span>
        </div>
        {order.discount_total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-ash">Discount</span>
            <span>- {getAmount(order.discount_total)}</span>
          </div>
        )}
        {order.gift_card_total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-ash">Gift card</span>
            <span>- {getAmount(order.gift_card_total)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-ash">Shipping</span>
          <span>{getAmount(order.shipping_total)}</span>
        </div>
        {order.tax_total > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-ash">VAT (13%)</span>
            <span>{getAmount(order.tax_total)}</span>
          </div>
        ) : (
          <p className="font-mono text-label-sm uppercase tracking-label text-ash pt-1">
            Includes 13% VAT
          </p>
        )}
        <div className="h-px w-full bg-line my-3" />
        <div className="flex items-center justify-between font-semibold text-base">
          <span>Total</span>
          <span data-testid="order-total">{getAmount(order.total)}</span>
        </div>
        <p className="mt-1 font-mono text-label-sm uppercase tracking-label text-ash">
          Cash on Delivery — pay when it arrives
        </p>
      </div>
    </div>
  )
}

export default OrderSummary
