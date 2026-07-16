import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Marquee from "@modules/common/components/marquee"
import TrustBadgeRow from "@modules/common/components/trust-badges"
import PillButton from "@modules/common/components/pill-button"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import TrackingTimeline from "@modules/order/components/tracking-timeline"
import { deriveTimelineFromOrder } from "@modules/order/lib/tracking"
import { formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="bg-paper py-10 md:py-16 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col items-center gap-y-10 max-w-4xl w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        <div
          className="flex flex-col gap-8 w-full border border-line bg-paper p-6 md:p-10"
          data-testid="order-complete-container"
        >
          <div className="text-center">
            <p className="font-mono text-label uppercase tracking-label text-red mb-4">
              ✓ Order placed
            </p>
            <h1 className="font-display text-display-2 uppercase text-ink leading-none">
              Order confirmed!
            </h1>
            <p className="mt-4 font-body text-body-lg text-ash max-w-xl mx-auto">
              We&apos;ll call you shortly to confirm your Cash-on-Delivery
              order.
            </p>
          </div>

          <div className="border border-ink bg-ink text-paper px-6 py-6 text-center">
            <p className="font-mono text-label uppercase tracking-label text-paper/70 mb-2">
              Amount due on delivery
            </p>
            <p className="font-display text-4xl md:text-5xl uppercase leading-none">
              {formatNPR(order.total)}
            </p>
            <p className="mt-3 font-body text-body-sm text-paper/70">
              Pay the rider in cash — no advance payment needed.
            </p>
          </div>

          <OrderDetails order={order} />

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 className="font-body text-h4 font-semibold text-ink">
                Delivery progress
              </h2>
              <LocalizedClientLink
                href="/track-order"
                className="font-mono text-label-sm uppercase tracking-label text-ash underline-offset-4 hover:text-ink hover:underline"
              >
                Track order →
              </LocalizedClientLink>
            </div>
            <TrackingTimeline steps={deriveTimelineFromOrder(order)} />
          </div>

          <div>
            <h2 className="font-body text-h4 font-semibold text-ink mb-3">
              Summary
            </h2>
            <Items order={order} />
            <CartTotals totals={order} />
          </div>

          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />

          <div className="flex flex-col small:flex-row gap-3 pt-2">
            <PillButton href="/store" variant="red" className="flex-1 justify-center">
              Continue shopping
            </PillButton>
            <PillButton
              href={`/account/orders/details/${order.id}`}
              variant="outline"
              className="flex-1 justify-center"
            >
              View order
            </PillButton>
          </div>

          <TrustBadgeRow compact />
        </div>

        <div className="w-full overflow-hidden">
          <Marquee
            items={["THANK YOU", "PROTEIN PASAL"]}
            variant="black"
            speed="normal"
          />
        </div>
      </div>
    </div>
  )
}
