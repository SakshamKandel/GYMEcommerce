import { HttpTypes } from "@medusajs/types"
import { listProductsWithSort } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import PillButton from "@modules/common/components/pill-button"
import DragRail from "@modules/home/components/drag-rail"

/**
 * HOME — FRESH STOCK carousel (user feedback: minimal page with carousels).
 * 8 newest products in a DragRail carousel via ProductPreview. Async server
 * component — the page wraps this in <Suspense> with SkeletonProductGrid so
 * the hero paints instantly. Designed empty state (guardrail §4.0.4).
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
    <div data-testid="fresh-stock-grid">
      <DragRail
        label="Fresh stock"
        itemClassName="w-[68vw] xsmall:w-[300px] md:w-[320px]"
      >
        {products.map((product) => (
          <ProductPreview
            key={product.id}
            product={product}
            region={region}
          />
        ))}
      </DragRail>
    </div>
  )
}

export default FreshStock
