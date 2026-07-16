"use client"

import { RadioGroup } from "@headlessui/react"
import { isManual, isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { Button, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import { CheckCircleSolid } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  // Provider-agnostic (R16 / 05 §1.2): when the region exposes exactly ONE
  // payment provider we skip the selection UI entirely and show a static
  // confirmation block. When eSewa/Khalti are added later as extra providers,
  // availablePaymentMethods.length becomes > 1 and the RadioGroup below renders
  // them automatically (COD first, wallets after) with zero rework here.
  const singleProvider =
    availablePaymentMethods?.length === 1 ? availablePaymentMethods[0] : null
  const singleIsManual = !!singleProvider && isManual(singleProvider.id)

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  // Auto-select the sole non-card provider (COD) so the static block's
  // "Continue" button is enabled and handleSubmit initiates its session.
  useEffect(() => {
    if (
      singleProvider &&
      !isStripeLike(singleProvider.id) &&
      !selectedPaymentMethod
    ) {
      setSelectedPaymentMethod(singleProvider.id)
    }
  }, [singleProvider?.id, selectedPaymentMethod])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const summaryProviderTitle = (providerId?: string) =>
    isManual(providerId)
      ? "Cash on Delivery"
      : paymentInfoMap[providerId as string]?.title || providerId

  return (
    <div className="border-b border-line pb-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2
          className={clx(
            "flex items-center gap-x-3 font-display text-2xl uppercase text-ink leading-none",
            {
              "opacity-40 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          <span className="font-mono text-label text-red tracking-label">
            03
          </span>
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid className="text-ink" />}
        </h2>
        {!isOpen && paymentReady && (
          <button
            onClick={handleEdit}
            className="font-mono text-label-sm uppercase tracking-label text-red hover:text-red-deep"
            data-testid="edit-payment-button"
          >
            Edit
          </button>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {/* Single provider (COD at launch) → static block, no selector (R16) */}
          {!paidByGiftcard && singleProvider && (
            <div
              className="flex items-start gap-x-4 border border-ink bg-fog p-5"
              data-testid="payment-method-summary"
            >
              <CheckCircleSolid className="text-ink mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-sm font-semibold uppercase tracking-wide text-ink">
                  {singleIsManual
                    ? "Pay with Cash on Delivery"
                    : summaryProviderTitle(singleProvider.id)}
                </p>
                <p className="mt-1.5 font-body text-body-sm text-ash">
                  {singleIsManual
                    ? "Pay the rider when your order arrives. No advance payment needed."
                    : "You'll complete payment after placing your order."}
                </p>
              </div>
            </div>
          )}

          {/* Multiple providers → real selection UI (future eSewa/Khalti) */}
          {!paidByGiftcard &&
            !singleProvider &&
            availablePaymentMethods?.length && (
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}

          {paidByGiftcard && (
            <div className="flex flex-col">
              <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-1">
                Payment method
              </p>
              <p
                className="font-body text-body-sm text-ink"
                data-testid="payment-method-summary"
              >
                Gift card
              </p>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6 uppercase tracking-wide"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeLike(selectedPaymentMethod)
              ? "Enter card details"
              : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/2">
                <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-1">
                  Payment method
                </p>
                <p
                  className="font-body text-body-sm text-ink"
                  data-testid="payment-method-summary"
                >
                  {summaryProviderTitle(activeSession?.provider_id)}
                </p>
              </div>
              <div className="flex flex-col w-1/2">
                <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-1">
                  Payment details
                </p>
                <div
                  className="font-body text-body-sm text-ash"
                  data-testid="payment-details-summary"
                >
                  {isManual(activeSession?.provider_id)
                    ? "Cash collected on delivery"
                    : isStripeLike(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Another step will appear"}
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-1">
                Payment method
              </p>
              <p
                className="font-body text-body-sm text-ink"
                data-testid="payment-method-summary"
              >
                Gift card
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Payment
