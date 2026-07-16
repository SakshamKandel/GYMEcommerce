"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale, formatNPR } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

// Delivery-time helper keyed off the backend option name — never hardcode the
// zones or amounts (R8 canonical strings from master-plan §3). The Rs. figures
// are always rendered from fulfillment data.
function deliveryEta(name?: string): string | null {
  const n = (name || "").toLowerCase()
  if (n.includes("inside")) return "Delivered in 1-2 days • Pay on delivery"
  if (n.includes("outside")) return "Delivered in 3-5 days • Pay on delivery"
  return null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const money = (amount: number) =>
    cart?.currency_code?.toLowerCase() === "npr"
      ? formatNPR(amount)
      : convertToLocale({ amount, currency_code: cart?.currency_code })

  // service_zone is present on the runtime payload but absent from the SDK's
  // StoreCartShippingOption type (starter-wide looseness) — cast at access.
  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      }
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)

        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const cardClasses = (selected: boolean, disabled: boolean) =>
    clx(
      "flex items-center justify-between cursor-pointer border p-4 mb-3 transition-colors",
      {
        "border-ink bg-fog": selected,
        "border-line hover:border-ink": !selected && !disabled,
        "opacity-50 cursor-not-allowed": disabled,
      }
    )

  return (
    <div className="border-b border-line pb-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2
          className={clx(
            "flex items-center gap-x-3 font-display text-2xl uppercase text-ink leading-none",
            {
              "opacity-40 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          <span className="font-mono text-label text-red tracking-label">
            02
          </span>
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid className="text-ink" />
          )}
        </h2>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <button
              onClick={handleEdit}
              className="font-mono text-label-sm uppercase tracking-label text-red hover:text-red-deep"
              data-testid="edit-delivery-button"
            >
              Edit
            </button>
          )}
      </div>
      {isOpen ? (
        <>
          <div className="grid">
            <div className="flex flex-col mb-4">
              <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                How would you like your order delivered?
              </span>
            </div>
            <div data-testid="delivery-options-container">
              <div className="pb-4">
                {hasPickupOptions && (
                  <RadioGroup
                    value={showPickupOptions}
                    onChange={(value) => {
                      const id = _pickupMethods.find(
                        (option) => !option.insufficient_inventory
                      )?.id

                      if (id) {
                        handleSetShippingMethod(id, "pickup")
                      }
                    }}
                  >
                    <Radio
                      value={PICKUP_OPTION_ON}
                      data-testid="delivery-option-radio"
                      className={cardClasses(
                        showPickupOptions === PICKUP_OPTION_ON,
                        false
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <MedusaRadio
                          checked={showPickupOptions === PICKUP_OPTION_ON}
                        />
                        <span className="font-body text-sm font-semibold uppercase tracking-wide text-ink">
                          Pick up your order
                        </span>
                      </div>
                      <span className="font-body font-bold text-ink">-</span>
                    </Radio>
                  </RadioGroup>
                )}
                <RadioGroup
                  value={shippingMethodId}
                  onChange={(v) => {
                    if (v) {
                      return handleSetShippingMethod(v, "shipping")
                    }
                  }}
                >
                  {_shippingMethods?.map((option) => {
                    const isDisabled =
                      option.price_type === "calculated" &&
                      !isLoadingPrices &&
                      typeof calculatedPricesMap[option.id] !== "number"

                    const eta = deliveryEta(option.name)

                    return (
                      <Radio
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        disabled={isDisabled}
                        className={cardClasses(
                          option.id === shippingMethodId,
                          isDisabled
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                          <MedusaRadio
                            checked={option.id === shippingMethodId}
                          />
                          <div className="flex flex-col">
                            <span className="font-body text-sm font-semibold uppercase tracking-wide text-ink">
                              {option.name}
                            </span>
                            {eta && (
                              <span className="mt-1 font-mono text-label-sm uppercase tracking-label text-ash">
                                {eta}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-body font-bold text-ink tabular-nums">
                          {option.price_type === "flat" ? (
                            money(option.amount!)
                          ) : calculatedPricesMap[option.id] ? (
                            money(calculatedPricesMap[option.id])
                          ) : isLoadingPrices ? (
                            <Loader />
                          ) : (
                            "-"
                          )}
                        </span>
                      </Radio>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && (
            <div className="grid">
              <div className="flex flex-col mb-4">
                <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                  Choose a store near you
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pb-4">
                  <RadioGroup
                    value={shippingMethodId}
                    onChange={(v) => {
                      if (v) {
                        return handleSetShippingMethod(v, "pickup")
                      }
                    }}
                  >
                    {_pickupMethods?.map((option) => {
                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          disabled={option.insufficient_inventory}
                          data-testid="delivery-option-radio"
                          className={cardClasses(
                            option.id === shippingMethodId,
                            !!option.insufficient_inventory
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <MedusaRadio
                              checked={option.id === shippingMethodId}
                            />
                            <div className="flex flex-col">
                              <span className="font-body text-sm font-semibold uppercase tracking-wide text-ink">
                                {option.name}
                              </span>
                              <span className="font-body text-body-sm text-ash">
                                {formatAddress(
                                  (option as any).service_zone?.fulfillment_set
                                    ?.location?.address
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="font-body font-bold text-ink tabular-nums">
                            {money(option.amount!)}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="large"
              className="mt-2 uppercase tracking-wide"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!cart.shipping_methods?.[0]}
              data-testid="submit-delivery-option-button"
            >
              Continue to payment
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="font-body text-body-sm">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col">
                <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-2">
                  Method
                </p>
                <p className="text-ink">
                  {cart.shipping_methods!.at(-1)!.name}{" "}
                  <span className="text-ash">
                    — {money(cart.shipping_methods!.at(-1)!.amount!)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipping
