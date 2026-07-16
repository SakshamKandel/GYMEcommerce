"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import TrackingTimeline from "@modules/order/components/tracking-timeline"
import {
  deriveTimelineFromOrder,
  refundLabel,
} from "@modules/order/lib/tracking"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-start small:items-center">
        <div>
          <p className="font-mono text-label uppercase tracking-label text-red mb-2">
            Order
          </p>
          <h1 className="font-display text-3xl uppercase text-ink leading-none">
            #{order.display_id}
          </h1>
        </div>
        <LocalizedClientLink
          href="/account/orders"
          className="font-mono text-label uppercase tracking-label text-ash hover:text-ink"
          data-testid="back-to-overview-button"
        >
          ← Back to orders
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-8 border border-line bg-paper p-5 md:p-8 w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <div>
          <h2 className="font-body text-h4 font-semibold text-ink mb-4">
            Delivery progress
          </h2>
          <TrackingTimeline steps={deriveTimelineFromOrder(order)} />
          {refundLabel(order.payment_status) && (
            <p className="mt-4 inline-flex items-center gap-2 bg-fog px-3 py-2 font-mono text-label-sm uppercase tracking-label text-ink">
              <span className="h-2 w-2 rounded-full bg-red" aria-hidden="true" />
              {refundLabel(order.payment_status)}
            </p>
          )}
        </div>
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
