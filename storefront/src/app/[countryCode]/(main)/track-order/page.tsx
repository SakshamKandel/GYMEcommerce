import { Metadata } from "next"

import TrackOrderForm from "@modules/order/components/track-order-form"

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Track your Protein Pasal order with your order number and the email or phone you used at checkout. Cash on Delivery across Nepal.",
}

export default function TrackOrderPage() {
  return (
    <div className="bg-paper py-10 md:py-16 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col gap-8 max-w-4xl w-full">
        <header className="max-w-2xl">
          <p className="font-mono text-label uppercase tracking-label text-red mb-4">
            Order tracking
          </p>
          <h1 className="font-display text-display-1 uppercase leading-none text-ink">
            Where&apos;s my protein?
          </h1>
          <p className="mt-5 font-body text-body-lg text-ash">
            Enter your order number and the email or phone you used at checkout.
            No account needed — we&apos;ll show you exactly where your order is
            on its way across Nepal.
          </p>
        </header>

        <TrackOrderForm />
      </div>
    </div>
  )
}
