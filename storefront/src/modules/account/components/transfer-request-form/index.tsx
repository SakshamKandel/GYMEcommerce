"use client"

import { useActionState } from "react"
import { createTransferRequest } from "@lib/data/orders"
import { Input } from "@medusajs/ui"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { XCircleSolid } from "@medusajs/icons"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <h3 className="font-body text-h4 font-semibold text-ink">
            Order transfers
          </h3>
          <p className="font-body text-body-sm text-ash">
            Can&apos;t find the order you&apos;re looking for?
            <br /> Connect an order to your account.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <Input className="w-full" name="order_id" placeholder="Order ID" />
            <SubmitButton
              variant="secondary"
              className="w-fit whitespace-nowrap self-end !rounded-full !border !border-ink !bg-transparent !text-ink !font-body !text-xs !font-semibold !uppercase !tracking-wide hover:!bg-ink hover:!text-paper"
            >
              Request transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <p className="font-body text-body-sm text-red text-right">
          {state.error}
        </p>
      )}
      {showSuccess && (
        <div className="flex justify-between border border-ink/20 bg-fog p-4 w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <span className="font-mono text-label-sm uppercase tracking-label text-ink">
              ✓
            </span>
            <div className="flex flex-col gap-y-1">
              <p className="font-body text-body-sm text-ink font-semibold">
                Transfer for order {state.order?.id} requested
              </p>
              <p className="font-body text-body-sm text-ash">
                Transfer request email sent to {state.order?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="h-fit text-ash hover:text-ink"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
