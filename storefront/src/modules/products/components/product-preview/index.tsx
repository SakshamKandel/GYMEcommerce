import { HttpTypes } from "@medusajs/types"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

/**
 * Product card (design system 02 §5.5):
 * mono ash brand line (collection title) · uppercase 2-line-clamp name ·
 * NPR price via formatNPR · quick-view reveal on hover · full-color image on
 * `fog`/`rounded-base` · sale badge only when sale pricing exists (R11 — none
 * at launch, renders automatically once price-list data appears).
 */
export default async function ProductPreview({
  product,
  isFeatured,
  region: _region, // kept for backward compatibility with existing callers
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const brand = product.collection?.title
  const isOnSale = cheapestPrice?.price_type === "sale"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <article className="flex flex-col" data-testid="product-wrapper">
        <div className="relative overflow-hidden rounded-base">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            alt={brand ? `${brand} — ${product.title}` : product.title}
          />
          {isOnSale && (
            <span className="absolute left-0 top-0 z-10 bg-red px-2.5 py-1.5 font-mono text-label-sm uppercase tracking-wider text-paper">
              Sale
            </span>
          )}
          {/* Quick-view reveal — decorative; the whole card is the link and
              variant (Flavor × Size) selection happens on the product page. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 bottom-3 z-10 hidden translate-y-3 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 small:block"
          >
            <span className="flex w-full items-center justify-center rounded-full bg-ink py-3 font-body text-xs font-semibold uppercase tracking-wide text-paper">
              Choose options
            </span>
          </span>
        </div>
        {brand && (
          <p className="mt-4 font-mono text-label uppercase tracking-label text-ash">
            {brand}
          </p>
        )}
        <h3
          className={`${
            brand ? "mt-1.5" : "mt-4"
          } font-body text-sm font-semibold uppercase leading-tight text-ink line-clamp-2`}
          data-testid="product-title"
        >
          {product.title}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </article>
    </LocalizedClientLink>
  )
}
