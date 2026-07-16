"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale, formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  // All NPR prices go through formatNPR (R4); convertToLocale stays as the
  // non-NPR fallback (§5.3).
  const formatAmount = (amount: number) =>
    cartState?.currency_code?.toLowerCase() === "npr"
      ? formatNPR(amount)
      : convertToLocale({
          amount,
          currency_code: cartState?.currency_code ?? "npr",
        })

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wide text-paper/80 hover:text-paper transition-colors"
            href="/cart"
            data-testid="nav-cart-link"
          >
            <span>Cart</span>
            <span className="min-w-5 h-5 rounded-full bg-red text-paper text-[11px] font-bold grid place-items-center px-1">
              {totalItems}
            </span>
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-paper text-ink border border-line w-[420px]"
            data-testid="nav-cart-dropdown"
          >
            <div className="px-4 py-4 border-b border-line">
              <h3 className="font-display text-xl uppercase tracking-tight text-ink">
                Your bag
              </h3>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar py-4">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[122px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-24 bg-fog rounded-base overflow-hidden"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between flex-1">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                <h3 className="font-body text-sm font-semibold uppercase leading-tight overflow-hidden text-ellipsis">
                                  <LocalizedClientLink
                                    href={`/products/${item.product_handle}`}
                                    data-testid="product-link"
                                  >
                                    {item.title}
                                  </LocalizedClientLink>
                                </h3>
                                <LineItemOptions
                                  variant={item.variant}
                                  data-testid="cart-item-variant"
                                  data-value={item.variant}
                                />
                                <span
                                  className="font-mono text-label-sm uppercase tracking-label text-ash mt-1"
                                  data-testid="cart-item-quantity"
                                  data-value={item.quantity}
                                >
                                  Quantity: {item.quantity}
                                </span>
                              </div>
                              <div className="flex justify-end font-body font-bold text-ink">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState.currency_code}
                                />
                              </div>
                            </div>
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="mt-1 text-red hover:text-red-deep"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 flex flex-col gap-y-4 border-t border-line">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                      Subtotal{" "}
                      <span className="normal-case tracking-normal">
                        (incl. VAT)
                      </span>
                    </span>
                    <span
                      className="font-body font-bold text-ink"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {formatAmount(subtotal)}
                    </span>
                  </div>
                  <LocalizedClientLink
                    href="/cart"
                    className="group flex w-full items-center justify-center gap-3 rounded-full bg-red px-7 py-3.5 font-body text-sm font-semibold uppercase tracking-wide text-paper transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-red-deep active:translate-y-0"
                    data-testid="go-to-cart-button"
                  >
                    View bag
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-150 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/checkout?step=address"
                    className="group flex w-full items-center justify-center gap-3 rounded-full border border-ink bg-transparent px-7 py-3 font-body text-sm font-semibold uppercase tracking-wide text-ink transition-colors duration-150 ease-out hover:bg-ink hover:text-paper"
                    data-testid="go-to-checkout-button"
                  >
                    Checkout
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-150 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div>
                <div className="flex py-16 flex-col gap-y-5 items-center justify-center px-6 text-center">
                  <p className="font-display text-2xl uppercase tracking-tight text-ink">
                    Your bag is empty
                  </p>
                  <p className="font-body text-body-sm text-ash">
                    Time to restock.
                  </p>
                  <div>
                    <LocalizedClientLink
                      href="/store"
                      onClick={close}
                      className="group inline-flex items-center gap-3 rounded-full bg-red px-7 py-3.5 font-body text-sm font-semibold uppercase tracking-wide text-paper transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-red-deep active:translate-y-0"
                    >
                      <span>Explore products</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-150 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
