import { HttpTypes } from "@medusajs/types"
import { listProductsWithSort } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import PillButton from "@modules/common/components/pill-button"

/**
 * HOME — Section 7: FRESH STOCK grid (REBUILD wrapper, per 03 §2.6).
 * 8 newest products via C's reskinned ProductPreview. Async server component —
 * the page wraps this in <Suspense> with SkeletonProductGrid so the hero paints instantly.
 * Designed empty state (never a bare grid — guardrail §4.0.4).
 */
const FreshStock = async ({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) => {
  const {
    response: { products },
  } = await listProductsWithSort({
    countryCode,
    sortBy: "created_at",
    page: 1,
    queryParams: { limit: 8 },
  })

  if (!products?.length) {
    return (
      <div className="border-y border-ink/15 py-16 text-center">
        <p className="font-display text-display-2 uppercase text-ink">
          New stock landing soon
        </p>
        <p className="mx-auto mt-3 mb-8 max-w-md font-body text-body-sm text-ash">
          Fresh authentic supplements are on their way in. Browse the full range
          in the meantime.
        </p>
        <PillButton href="/store" variant="primary">
          Shop all
        </PillButton>
      </div>
    )
  }

  return (
    <ul
      className="grid grid-cols-2 gap-x-4 gap-y-10 small:grid-cols-3 medium:grid-cols-4"
      data-testid="fresh-stock-grid"
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductPreview product={product} region={region} />
        </li>
      ))}
    </ul>
  )
}

export default FreshStock
