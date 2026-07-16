import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-6 flex flex-col-reverse small:flex-col gap-y-6 py-8 small:py-0">
      <div className="w-full border border-line bg-paper p-6 flex flex-col">
        <h2 className="font-display text-2xl uppercase text-ink leading-none small:hidden mb-4">
          Order summary
        </h2>
        <h2 className="hidden small:block font-display text-2xl uppercase text-ink leading-none">
          In your bag
        </h2>

        <div className="h-px w-full bg-line my-5" />

        <CartTotals totals={cart} />

        <div className="mt-5 border-t border-line pt-2">
          <ItemsPreviewTemplate cart={cart} />
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <DiscountCode cart={cart} />
        </div>

        {/* COD reassurance — persistent across every checkout step (03 §9) */}
        <div className="mt-5 flex items-center gap-2 bg-fog px-4 py-3">
          <svg
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 shrink-0 text-ink"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="3" y="7" width="10" height="7" rx="0.5" />
            <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="square" />
          </svg>
          <p className="font-mono text-label-sm uppercase tracking-label text-ash leading-snug">
            No online payment needed — pay cash on delivery
          </p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
