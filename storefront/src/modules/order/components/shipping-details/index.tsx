import { formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

// Delivery ETA copy is keyed off the shipping option name — amounts always
// come from order data, never hardcoded (R8 canonical strings).
const etaForMethod = (name?: string | null) => {
  if (!name) return null
  const lower = name.toLowerCase()
  if (lower.includes("outside")) return "Delivered in 3-5 days"
  if (lower.includes("inside") || lower.includes("valley")) {
    return "Delivered in 1-2 days"
  }
  return null
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const shippingMethod = (order as any).shipping_methods?.[0]
  const eta = etaForMethod(shippingMethod?.name)

  return (
    <div>
      <h2 className="font-body text-h4 font-semibold text-ink mb-3">
        Delivery
      </h2>
      <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
        <div
          className="flex min-w-0 flex-col gap-1"
          data-testid="shipping-address-summary"
        >
          <p className="font-mono text-label-sm uppercase tracking-label text-ash">
            Shipping address
          </p>
          <p className="font-body text-body-sm text-ink">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </p>
          <p className="font-body text-body-sm text-ink">
            {order.shipping_address?.address_1}
            {order.shipping_address?.address_2
              ? `, ${order.shipping_address.address_2}`
              : ""}
          </p>
          <p className="font-body text-body-sm text-ink">
            {order.shipping_address?.city}
            {order.shipping_address?.postal_code
              ? `, ${order.shipping_address.postal_code}`
              : ""}
          </p>
          <p className="font-body text-body-sm text-ink">
            {order.shipping_address?.province}
          </p>
        </div>

        <div
          className="flex min-w-0 flex-col gap-1"
          data-testid="shipping-contact-summary"
        >
          <p className="font-mono text-label-sm uppercase tracking-label text-ash">
            Contact
          </p>
          <p className="font-body text-body-sm text-ink">
            {order.shipping_address?.phone}
          </p>
          <p className="break-words font-body text-body-sm text-ink">
            {order.email}
          </p>
        </div>

        <div
          className="flex min-w-0 flex-col gap-1"
          data-testid="shipping-method-summary"
        >
          <p className="font-mono text-label-sm uppercase tracking-label text-ash">
            Method
          </p>
          <p className="break-words font-body text-body-sm text-ink">
            {shippingMethod?.name}{" "}
            <span className="whitespace-nowrap">
              ({formatNPR(shippingMethod?.total ?? 0)})
            </span>
          </p>
          {eta && (
            <p className="font-body text-body-sm text-ash">
              {eta} · Cash on Delivery
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
