"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import OptionTiles from "@modules/products/components/product-actions/option-tiles"
import QuantityStepper from "@modules/products/components/product-actions/quantity-stepper"
import Spinner from "@modules/common/icons/spinner"
import { formatNPR, convertToLocale } from "@lib/util/money"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  /** Orders require an account — guests are bounced to login on add-to-cart
   * and returned here to continue (defaults true for the disabled skeleton). */
  isAuthenticated?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

// A variant can be bought when it is not inventory-managed, allows
// backorders, or has quantity on hand.
const isPurchasable = (v: HttpTypes.StoreProductVariant) =>
  !v.manage_inventory || v.allow_backorder || (v.inventory_quantity || 0) > 0

const formatAmount = (amount: number, currencyCode?: string) =>
  (currencyCode ?? "npr").toLowerCase() === "npr"
    ? formatNPR(amount)
    : convertToLocale({ amount, currency_code: currencyCode ?? "npr" })

/**
 * Parses the seeded `metadata.servings` strings into a number, size-aware:
 *   "75"                          → 75
 *   "15 (1lb) / 75 (5lb)" + "5lb" → 75
 *   "1 tablet per day; …"         → undefined (line simply not rendered)
 */
const parseServings = (
  raw: unknown,
  sizeValue?: string
): number | undefined => {
  if (typeof raw !== "string" || !raw.trim()) {
    return undefined
  }
  const direct = Number(raw.trim())
  if (Number.isFinite(direct) && direct > 0) {
    return direct
  }
  if (sizeValue) {
    const escaped = sizeValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const match = raw.match(
      new RegExp(`(\\d+(?:\\.\\d+)?)\\s*\\(\\s*${escaped}\\s*\\)`, "i")
    )
    if (match) {
      const parsed = Number(match[1])
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed
      }
    }
  }
  return undefined
}

const MAX_QTY = 10
const LOW_STOCK_THRESHOLD = 5

export default function ProductActions({
  product,
  disabled,
  isAuthenticated = true,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countryCode = useParams().countryCode as string

  // Preselect a variant so the buy box never opens on a disabled
  // "Out of stock" state while inventory exists: honor a shared ?v_id= link
  // first, then the first purchasable variant, then the first variant.
  useEffect(() => {
    const variants = product.variants
    if (!variants?.length) {
      return
    }

    const vId = searchParams.get("v_id")
    const fromUrl = vId ? variants.find((v) => v.id === vId) : undefined
    const preferred = fromUrl ?? variants.find(isPurchasable) ?? variants[0]

    setOptions(optionsAsKeymap(preferred.options) ?? {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.variants])

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) {
        clearTimeout(addedTimerRef.current)
      }
    }
  }, [])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    // Pending-add intent params are single-use (consumed by the auto-add
    // effect below) — never let this sync write them back into the URL.
    params.delete("add")
    params.delete("qty")
    const value = isValidVariant ? selectedVariant?.id : null

    if (
      params.get("v_id") === value &&
      !searchParams.get("add") &&
      !searchParams.get("qty")
    ) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    // scroll: false keeps the buyer anchored to the buy box on variant switch.
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  // Quantity ceiling: 10, or the real available stock when inventory-managed
  // without backorders.
  const maxQuantity = useMemo(() => {
    if (!selectedVariant) {
      return MAX_QTY
    }
    if (!selectedVariant.manage_inventory || selectedVariant.allow_backorder) {
      return MAX_QTY
    }
    return Math.max(
      1,
      Math.min(MAX_QTY, selectedVariant.inventory_quantity ?? 0)
    )
  }, [selectedVariant])

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), maxQuantity))
  }, [maxQuantity])

  /**
   * Availability + price metadata per option value, holding every OTHER
   * selected option fixed. A combo is unavailable when every variant matching
   * it is inventory-managed, non-backorder, with qty <= 0 — or when no such
   * variant exists at all.
   */
  const getValueMeta = useCallback(
    (optionId: string, value: string) => {
      const variants = product.variants ?? []

      const withValue = variants.filter((v) =>
        v.options?.some((o) => o.option_id === optionId && o.value === value)
      )

      const matchingSelection = withValue.filter((v) =>
        (v.options ?? []).every((o) => {
          if (!o.option_id || o.option_id === optionId) {
            return true
          }
          const selected = options[o.option_id]
          return !selected || o.value === selected
        })
      )

      const pool = matchingSelection.length ? matchingSelection : withValue
      const unavailable =
        withValue.length === 0 ||
        matchingSelection.length === 0 ||
        !pool.some(isPurchasable)

      const priceSource = (pool.find(isPurchasable) ?? pool[0]) as any
      const amount = priceSource?.calculated_price?.calculated_amount
      const priceLabel =
        typeof amount === "number"
          ? formatAmount(amount, priceSource?.calculated_price?.currency_code)
          : undefined

      return { unavailable, priceLabel }
    },
    [product.variants, options]
  )

  // Per-serving price — only when metadata.servings resolves to a number for
  // the selected size (see parseServings).
  const perServingLabel = useMemo(() => {
    const sizeOption = product.options?.find(
      (o) => (o.title ?? "").trim().toLowerCase() === "size"
    )
    const sizeValue = sizeOption ? options[sizeOption.id] : undefined
    const servings = parseServings(
      (product.metadata as Record<string, unknown> | null)?.["servings"],
      sizeValue
    )
    const amount = (selectedVariant as any)?.calculated_price
      ?.calculated_amount
    const currency = (selectedVariant as any)?.calculated_price?.currency_code

    if (!servings || typeof amount !== "number" || amount <= 0) {
      return undefined
    }
    if ((currency ?? "npr").toLowerCase() !== "npr") {
      return undefined
    }
    return `${formatNPR(amount / servings)} / serving`
  }, [product.options, product.metadata, options, selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    // Guest checkout: adding to cart never requires an account. addToCart
    // creates a guest cart on first add and persists it via the
    // _medusa_cart_id cookie, so the bag survives future visits.
    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })

    setIsAdding(false)
    setJustAdded(true)
    if (addedTimerRef.current) {
      clearTimeout(addedTimerRef.current)
    }
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 2000)
  }

  // NOTE: the pending guest add-to-cart intent (?add=&qty= on the login
  // return URL) is consumed SERVER-SIDE inside the login/signup actions
  // (lib/data/customer.ts consumePendingAdd) — deterministic and exactly
  // once. No client-side auto-add happens here; the sync effect above only
  // keeps stray intent params out of the URL.

  const ctaDisabled =
    !inStock || !selectedVariant || !!disabled || isAdding || !isValidVariant

  const ctaLabel = !selectedVariant
    ? "Select options"
    : !inStock || !isValidVariant
    ? "Out of stock"
    : "Add to cart"

  const stockState = !selectedVariant
    ? null
    : !inStock
    ? ("out" as const)
    : selectedVariant.manage_inventory &&
      !selectedVariant.allow_backorder &&
      (selectedVariant.inventory_quantity ?? 0) <= LOW_STOCK_THRESHOLD
    ? ("low" as const)
    : ("in" as const)

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-6 border-b border-line pb-6">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionTiles
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    getValueMeta={getValueMeta}
                    data-testid="product-options"
                    disabled={!!disabled || isAdding}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* key remount = 200ms fade-in on every variant switch (02 §6). */}
        <div
          key={selectedVariant?.id ?? "base-price"}
          className="animate-fade-in-top motion-reduce:animate-none"
        >
          <ProductPrice
            product={product}
            variant={selectedVariant}
            perServingLabel={perServingLabel}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <QuantityStepper
            quantity={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            disabled={!!disabled || isAdding || !inStock || !selectedVariant}
          />

          {stockState && (
            <p
              className="flex items-center gap-2 font-mono text-label-sm uppercase tracking-label"
              data-testid="product-stock-line"
              aria-live="polite"
            >
              {stockState === "in" && (
                <>
                  <span aria-hidden="true" className="h-2 w-2 bg-red" />
                  <span className="text-ink">In stock — ships today</span>
                </>
              )}
              {stockState === "low" && (
                <>
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 animate-pulse bg-red motion-reduce:animate-none"
                  />
                  <span className="font-bold text-ink">
                    Only {selectedVariant?.inventory_quantity ?? 0} left —
                    order soon
                  </span>
                </>
              )}
              {stockState === "out" && (
                <span className="text-ash">Out of stock</span>
              )}
            </p>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={ctaDisabled}
          data-testid="add-product-button"
          className={clx(
            "group flex w-full items-center justify-center gap-3 px-7 py-4 font-body text-sm font-semibold uppercase tracking-wide transition-[background-color,transform] duration-150 ease-out active:scale-[0.99] motion-reduce:active:scale-100",
            justAdded
              ? "bg-ink text-paper"
              : ctaDisabled
              ? "cursor-not-allowed bg-ash text-paper/80"
              : "bg-red text-paper hover:bg-red-deep"
          )}
        >
          {isAdding ? (
            <Spinner size="18" />
          ) : justAdded ? (
            <>
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="M3 8l3.5 3.5L13 4" strokeLinecap="square" />
              </svg>
              <span>Added to cart</span>
            </>
          ) : (
            <>
              <span>{ctaLabel}</span>
              <span className="transition-transform duration-150 ease-out group-hover:translate-x-1">
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
                </svg>
              </span>
            </>
          )}
        </button>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
