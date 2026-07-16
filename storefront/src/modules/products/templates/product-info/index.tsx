import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

/**
 * Buy-box header: brand eyebrow (→ collection) + "100% authentic" chip,
 * PDP title, and a clamped description teaser anchoring to the full
 * Description section below the fold.
 */
const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-y-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {product.collection ? (
          // Red mono uppercase brand eyebrow → collection page (R14).
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="w-fit font-mono text-label uppercase tracking-label text-red transition-colors hover:text-red-deep"
            data-testid="product-collection-link"
          >
            {product.collection.title}
          </LocalizedClientLink>
        ) : (
          <span />
        )}

        <span className="inline-flex items-center gap-1.5 border border-ink/20 px-2.5 py-1.5 font-mono text-label-sm uppercase tracking-label text-ash">
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3 shrink-0 text-ink"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M3 8l3.5 3.5L13 4" strokeLinecap="square" />
          </svg>
          100% authentic
        </span>
      </div>

      {/* R14: PDP title = Inter bold, sentence case (real casing in DOM). */}
      <h1
        className="font-body text-h2 font-bold leading-tight text-ink"
        data-testid="product-title"
      >
        {product.title}
      </h1>

      {product.description && (
        <div className="flex flex-col gap-y-2">
          <p
            className="line-clamp-3 whitespace-pre-line font-body text-body-sm text-ash"
            data-testid="product-description"
          >
            {product.description}
          </p>
          <a
            href="#description"
            className="group inline-flex w-fit items-center gap-1.5 font-mono text-label-sm uppercase tracking-label text-ink transition-colors hover:text-red"
          >
            Read full details
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3 transition-transform duration-150 ease-out group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path d="M8 3v10M4 9l4 4 4-4" strokeLinecap="square" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
