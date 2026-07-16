"use client"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import PillButton from "@modules/common/components/pill-button"
import TrustBadgeRow from "@modules/common/components/trust-badges"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  customer: HttpTypes.StoreCustomer | null
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, customer }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-5 border border-line bg-paper p-6">
      <h2 className="font-display text-2xl uppercase text-ink leading-none">
        Order summary
      </h2>

      <DiscountCode cart={cart} />

      <div className="h-px w-full bg-line" />

      <CartTotals totals={cart} />

      {customer ? (
        <PillButton
          href={"/checkout?step=" + step}
          variant="red"
          data-testid="checkout-button"
          className="w-full justify-center"
        >
          Proceed to checkout
        </PillButton>
      ) : (
        <PillButton
          href="/account?redirect=/checkout"
          variant="red"
          data-testid="checkout-button"
          className="w-full justify-center"
        >
          Log in to checkout
        </PillButton>
      )}

      <p className="text-center font-mono text-label-sm uppercase tracking-label text-ash">
        {customer
          ? "Shipping calculated at checkout · COD available"
          : "An account is required to place orders"}
      </p>

      <div className="pt-2 border-t border-line">
        <TrustBadgeRow compact />
      </div>
    </div>
  )
}

export default Summary
