import { isManual, paymentInfoMap } from "@lib/constants"
import { formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]

  return (
    <div>
      <h2 className="font-body text-h4 font-semibold text-ink mb-3">
        Payment
      </h2>
      {payment ? (
        <div className="border border-line p-4 flex flex-col gap-1.5">
          <p className="font-body text-sm font-semibold text-ink" data-testid="payment-method">
            {isManual(payment.provider_id)
              ? "Cash on Delivery"
              : paymentInfoMap[payment.provider_id]?.title || "Payment"}
          </p>
          {isManual(payment.provider_id) ? (
            <p className="font-body text-body-sm text-ash">
              Pay the rider {formatNPR(order.total)} in cash when your order
              arrives. No advance payment needed.
            </p>
          ) : (
            <p className="font-body text-body-sm text-ash" data-testid="payment-amount">
              {formatNPR(payment.amount)} paid on{" "}
              {new Date(payment.created_at ?? "").toLocaleDateString()}
            </p>
          )}
        </div>
      ) : (
        <p className="font-body text-body-sm text-ash">
          Cash on Delivery — pay the rider when your order arrives.
        </p>
      )}
    </div>
  )
}

export default PaymentDetails
