import { Dialog, Transition } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"
import Spinner from "@modules/common/icons/spinner"

import { getProductPrice } from "@lib/util/get-product-price"
import { formatNPR } from "@lib/util/money"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isNpr = selectedPrice?.currency_code?.toLowerCase() === "npr"
  const priceLabel = selectedPrice
    ? isNpr
      ? formatNPR(selectedPrice.calculated_price_number)
      : selectedPrice.calculated_price
    : null
  const originalLabel = selectedPrice
    ? isNpr
      ? formatNPR(selectedPrice.original_price_number)
      : selectedPrice.original_price
    : null

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="on-dark flex h-full w-full flex-col gap-y-3 border-t border-white/12 bg-ink p-4 text-paper"
            data-testid="mobile-actions"
          >
            <div className="flex items-center gap-x-2">
              <span
                className="font-body text-sm font-semibold text-paper line-clamp-1"
                data-testid="mobile-title"
              >
                {product.title}
              </span>
              <span className="text-paper/40">—</span>
              {selectedPrice ? (
                <div className="flex items-end gap-x-2">
                  {selectedPrice.price_type === "sale" && (
                    <span className="font-body text-body-sm text-paper/50 line-through">
                      {originalLabel}
                    </span>
                  )}
                  <span
                    className={clx("font-body font-bold text-paper", {
                      "text-red": selectedPrice.price_type === "sale",
                    })}
                  >
                    {priceLabel}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div
              className={clx("grid grid-cols-2 w-full gap-x-3", {
                "!grid-cols-1": isSimple,
              })}
            >
              {!isSimple && (
                <button
                  onClick={open}
                  className="flex w-full items-center justify-between border border-white/40 bg-transparent px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-paper hover:text-ink"
                  data-testid="mobile-actions-button"
                >
                  <span>
                    {variant
                      ? Object.values(options).join(" / ")
                      : "Select options"}
                  </span>
                  <ChevronDown />
                </button>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!inStock || !variant || isAdding}
                className="flex w-full items-center justify-center gap-2 bg-red px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-red-deep disabled:cursor-not-allowed disabled:bg-coal disabled:text-paper/50"
                data-testid="mobile-cart-button"
              >
                {isAdding ? (
                  <Spinner size="16" />
                ) : !variant ? (
                  "Select variant"
                ) : !inStock ? (
                  "Out of stock"
                ) : (
                  "Add to cart"
                )}
              </button>
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-paper px-6 py-12">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
