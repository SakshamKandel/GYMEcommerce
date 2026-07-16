"use client"

import OrderCard from "../order-card"
import PillButton from "@modules/common/components/pill-button"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-5 w-full">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4 border border-line px-6 py-16 text-center"
      data-testid="no-orders-container"
    >
      <h2 className="font-display text-3xl uppercase text-ink">
        No orders yet.
      </h2>
      <p className="font-body text-body-sm text-ash max-w-xs">
        Place your first order and it will show up here — with Cash on
        Delivery every time.
      </p>
      <PillButton
        href="/store"
        variant="red"
        className="mt-2"
        data-testid="continue-shopping-button"
      >
        Shop all
      </PillButton>
    </div>
  )
}

export default OrderOverview
