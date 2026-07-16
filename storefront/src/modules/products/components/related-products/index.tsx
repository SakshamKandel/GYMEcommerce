import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "../product-preview"
import Reveal from "../reveal"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

const Rail = ({
  eyebrow,
  title,
  products,
  region,
  testId,
}: {
  eyebrow: string
  title: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  testId: string
}) => (
  <section data-testid={testId} className="mt-16 first:mt-0 small:mt-24">
    <Reveal>
      <div className="shell mb-8 flex flex-col gap-y-2 small:mb-10">
        <span className="font-mono text-label uppercase tracking-label text-red">
          {eyebrow}
        </span>
        <h2 className="font-display text-display-2 uppercase text-ink">
          {title}
        </h2>
      </div>

      {/* Horizontal snap rail (design 02 §5.6) — opt-in scroller, body never
          scrolls horizontally. */}
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 md:scroll-px-8 md:px-8 lg:scroll-px-12 lg:px-12">
        {products.map((relatedProduct) => (
          <li
            key={relatedProduct.id}
            className="w-[68vw] shrink-0 snap-start xsmall:w-[300px]"
          >
            <ProductPreview region={region} product={relatedProduct} />
          </li>
        ))}
      </ul>
    </Reveal>
  </section>
)

/**
 * Two related rails:
 *   1. "More from {Brand}"    — same Medusa collection (existing pattern).
 *   2. "Similar in {Category}" — same category, excluding the current product
 *      and anything already shown in the brand rail.
 * Each rail skips gracefully when it has nothing to show.
 */
export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // ── Rail 1: more from the same brand (collection) ────────────────────
  const brandQueryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    brandQueryParams.region_id = region.id
  }
  if (product.collection_id) {
    brandQueryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    brandQueryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  brandQueryParams.is_giftcard = false
  brandQueryParams.limit = 13

  const brandProducts = await listProducts({
    queryParams: brandQueryParams,
    countryCode,
  }).then(({ response }) =>
    response.products
      .filter((responseProduct) => responseProduct.id !== product.id)
      .slice(0, 12)
  )

  // ── Rail 2: similar in the same category ─────────────────────────────
  const categoryId = product.categories?.[0]?.id
  const categoryName = product.categories?.[0]?.name
  const brandIds = new Set(brandProducts.map((p) => p.id))

  const categoryProducts = categoryId
    ? await listProducts({
        queryParams: {
          region_id: region.id,
          category_id: [categoryId],
          is_giftcard: false,
          limit: 24,
        },
        countryCode,
      })
        .then(({ response }) =>
          response.products
            .filter(
              (responseProduct) =>
                responseProduct.id !== product.id &&
                !brandIds.has(responseProduct.id)
            )
            .slice(0, 12)
        )
        .catch(() => [] as HttpTypes.StoreProduct[])
    : []

  if (!brandProducts.length && !categoryProducts.length) {
    return null
  }

  const brand = product.collection?.title

  return (
    <div>
      {brandProducts.length > 0 && (
        <Rail
          eyebrow="More to explore"
          title={brand ? `More from ${brand}` : "You might also like"}
          products={brandProducts}
          region={region}
          testId="related-brand-rail"
        />
      )}

      {categoryProducts.length > 0 && (
        <Rail
          eyebrow="Keep comparing"
          title={
            categoryName ? `Similar in ${categoryName}` : "Similar products"
          }
          products={categoryProducts}
          region={region}
          testId="related-category-rail"
        />
      )}
    </div>
  )
}
