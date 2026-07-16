import { clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

import { formatNPR } from "@lib/util/money"

/**
 * NPR prices go through formatNPR (lakh grouping, "Rs. 1,50,000" — R4/R5);
 * any other currency falls back to the starter's pre-formatted string.
 */
const displayAmount = (
  price: VariantPrice,
  amount: number,
  fallback: string
): string =>
  price.currency_code?.toLowerCase() === "npr" ? formatNPR(amount) : fallback

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  const isOnSale = price.price_type === "sale"

  return (
    <>
      <span
        className={clx("font-body font-bold", {
          "text-red": isOnSale,
          "text-ink": !isOnSale,
        })}
        data-testid="price"
      >
        {displayAmount(price, price.calculated_price_number, price.calculated_price)}
      </span>
      {isOnSale && (
        <span
          className="font-body text-body-sm text-ash line-through"
          data-testid="original-price"
        >
          {displayAmount(price, price.original_price_number, price.original_price)}
        </span>
      )}
    </>
  )
}
