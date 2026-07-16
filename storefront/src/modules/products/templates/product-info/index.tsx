import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-3">
        {product.collection && (
          // Red mono uppercase brand eyebrow → collection page (R14).
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="w-fit font-mono text-label uppercase tracking-label text-red transition-colors hover:text-red-deep"
            data-testid="product-collection-link"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}

        {/* R14: PDP title = Inter text-h1 bold, sentence case (real casing in DOM). */}
        <h1
          className="font-body text-h1 font-bold text-ink"
          data-testid="product-title"
        >
          {product.title}
        </h1>

        {product.description && (
          <p
            className="whitespace-pre-line font-body text-body text-ash"
            data-testid="product-description"
          >
            {product.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
