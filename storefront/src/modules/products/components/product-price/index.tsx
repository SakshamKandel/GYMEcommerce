import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block h-9 w-32 animate-pulse bg-fog" />
  }

  const isNpr = selectedPrice.currency_code?.toLowerCase() === "npr"
  // R4/R5: NPR renders through formatNPR (lakh grouping, "Rs. " prefix, no
  // decimals). Non-NPR keeps the starter's Intl-formatted string.
  const displayPrice = isNpr
    ? formatNPR(selectedPrice.calculated_price_number)
    : selectedPrice.calculated_price
  const displayOriginal = isNpr
    ? formatNPR(selectedPrice.original_price_number)
    : selectedPrice.original_price

  const isSale = selectedPrice.price_type === "sale"

  return (
    <div className="flex flex-col gap-y-1.5" data-testid="product-price-block">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={clx("font-body text-h2 font-bold leading-none", {
            "text-red": isSale,
            "text-ink": !isSale,
          })}
        >
          {!variant && (
            <span className="mr-1 align-baseline font-mono text-label uppercase tracking-label text-ash">
              From
            </span>
          )}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {displayPrice}
          </span>
        </span>

        {/* Strike-through / SAVE only render when real sale data exists (R11:
            no compare-at prices seeded at launch, so these stay dormant). */}
        {isSale && (
          <span
            className="font-body text-body-sm text-ash line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {displayOriginal}
          </span>
        )}

        {isSale && (
          <span className="bg-red px-2 py-1 font-mono text-label-sm uppercase tracking-wider text-paper">
            -{selectedPrice.percentage_diff}%
          </span>
        )}
      </div>

      <span className="font-mono text-label-sm uppercase tracking-label text-ash">
        Includes 13% VAT
      </span>
    </div>
  )
}
