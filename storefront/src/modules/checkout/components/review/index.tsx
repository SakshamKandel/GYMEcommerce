"use client"

import { clx } from "@medusajs/ui"
import { convertToLocale, formatNPR } from "@lib/util/money"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"

function deliveryEta(name?: string): string | null {
  const n = (name || "").toLowerCase()
  if (n.includes("inside")) return "Delivered in 1-2 days"
  if (n.includes("outside")) return "Delivered in 3-5 days"
  return null
}

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  const money = (amount: number) =>
    cart?.currency_code?.toLowerCase() === "npr"
      ? formatNPR(amount)
      : convertToLocale({ amount, currency_code: cart?.currency_code })

  const method = cart.shipping_methods?.at(-1)
  const eta = deliveryEta(method?.name)

  return (
    <div>
      <div className="flex flex-row items-center justify-between mb-6">
        <h2
          className={clx(
            "flex items-center gap-x-3 font-display text-2xl uppercase text-ink leading-none",
            {
              "opacity-40 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          <span className="font-mono text-label text-red tracking-label">
            04
          </span>
          Review
        </h2>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="mb-6 flex flex-col gap-y-4 border border-line bg-fog p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                Order total (COD)
              </span>
              <span
                className="font-body text-h4 font-bold text-ink tabular-nums"
                data-testid="review-order-total"
              >
                {money(cart?.total ?? 0)}
              </span>
            </div>
            {method && (
              <div className="flex items-center justify-between">
                <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                  Delivery
                </span>
                <span className="font-body text-body-sm text-ink text-right">
                  {method.name}
                  {eta && <span className="text-ash"> · {eta}</span>}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 border-t border-line pt-3">
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
          <p className="mb-6 font-body text-body-sm text-ash">
            By placing this order you confirm that you have read and accept
            Protein Pasal&apos;s Terms of Sale, Returns Policy and Privacy
            Policy.
          </p>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
