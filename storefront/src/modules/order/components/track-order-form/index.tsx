"use client"

import { useActionState, useState } from "react"

import { trackOrder } from "@lib/data/orders"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import TrackingResult from "@modules/order/components/tracking-result"
import { TRACK_ORDER_INITIAL_STATE } from "@modules/order/lib/tracking"

const TrackOrderForm = () => {
  const [state, formAction] = useActionState(
    trackOrder,
    TRACK_ORDER_INITIAL_STATE
  )
  // Lets the shopper collapse a result and look up a different order.
  const [searchingAnother, setSearchingAnother] = useState(false)

  const showResult =
    state.status === "success" && !!state.order && !searchingAnother

  if (showResult && state.order) {
    return (
      <TrackingResult
        order={state.order}
        onReset={
          <button
            type="button"
            onClick={() => setSearchingAnother(true)}
            className="font-mono text-label uppercase tracking-label text-ash underline-offset-4 hover:text-ink hover:underline"
            data-testid="track-another-button"
          >
            Track another order
          </button>
        }
      />
    )
  }

  return (
    <div className="border border-line bg-paper p-6 md:p-10">
      <form
        action={formAction}
        onSubmit={() => setSearchingAnother(false)}
        className="flex flex-col gap-4"
        data-testid="track-order-form"
      >
        <div className="flex flex-col gap-4 small:flex-row">
          <Input
            label="Order number"
            name="display_id"
            inputMode="numeric"
            autoComplete="off"
            required
            data-testid="track-order-number"
          />
          <Input
            label="Email or phone used at checkout"
            name="contact"
            autoComplete="off"
            required
            data-testid="track-order-contact"
          />
        </div>

        <p className="font-body text-body-sm text-ash">
          Your order number is on your confirmation screen and email — it looks
          like <span className="font-semibold text-ink">#1234</span>. Use the
          same email or phone you entered at checkout.
        </p>

        {state.status === "error" && (
          <ErrorMessage
            error={state.error}
            data-testid="track-order-error"
          />
        )}

        <SubmitButton
          data-testid="track-order-submit"
          className="mt-2 w-full !rounded-full !bg-red hover:!bg-red-deep !text-paper !font-body !text-sm !font-semibold !uppercase !tracking-wide !h-auto !py-3.5 small:w-auto small:self-start small:!px-10"
        >
          Track my order
        </SubmitButton>
      </form>
    </div>
  )
}

export default TrackOrderForm
