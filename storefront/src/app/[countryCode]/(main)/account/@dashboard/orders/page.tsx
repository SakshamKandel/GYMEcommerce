import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous Protein Pasal orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-3">
        <p className="font-mono text-label uppercase tracking-label text-red">
          Account
        </p>
        <h1 className="font-display text-3xl md:text-4xl uppercase text-ink leading-none">
          Orders
        </h1>
        <p className="font-body text-body-sm text-ash max-w-lg">
          Every order is Cash on Delivery — track status, delivery zone, and
          totals here.
        </p>
      </div>
      <div className="flex flex-col gap-y-12">
        <OrderOverview orders={orders} />
        <div className="border-t border-line pt-10">
          <TransferRequestForm />
        </div>
      </div>
    </div>
  )
}
