import { HttpTypes } from "@medusajs/types"
import { listProductsWithSort } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import DragRail from "@modules/home/components/drag-rail"
import PillButton from "@modules/common/components/pill-button"

/**
 * HOME — Section 10: BEST SELLERS rail (REBUILD wrapper, per 03 §2.9 + guardrail §4.0.4).
 * No bestseller signal is seeded at launch (R11), so this FALLS BACK TO NEWEST — it pulls the
 * next page of newest products so the cards differ from the Fresh Stock grid above, and
 * re-fetches page 1 if the catalog is too small for a second page. Never empty.
 * // TODO: swap to metadata.bestseller ordering once a signal is seeded.
 */
const BestSellers = async ({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) => {
  let {
    response: { products },
  } = await listProductsWithSort({
    countryCode,
    sortBy: "created_at",
    page: 2,
    queryParams: { limit: 8 },
  })

  // Small catalog: no second page — fall back to newest page 1.
  if (!products?.length) {
    ;({
      response: { products },
    } = await listProductsWithSort({
      countryCode,
      sortBy: "created_at",
      page: 1,
      queryParams: { limit: 8 },
    }))
  }

  if (!products?.length) {
    return (
      <div className="border-y border-ink/15 py-16 text-center">
        <p className="font-display text-display-2 uppercase text-ink">
          Best sellers coming soon
        </p>
        <p className="mx-auto mt-3 mb-8 max-w-md font-body text-body-sm text-ash">
          We&apos;re stocking up. Explore everything in the store while we do.
        </p>
        <PillButton href="/store" variant="primary">
          Shop all
        </PillButton>
      </div>
    )
  }

  return (
    <DragRail itemClassName="w-[64vw] xsmall:w-[280px]" label="Best sellers">
      {products.map((product) => (
        <ProductPreview key={product.id} product={product} region={region} />
      ))}
    </DragRail>
  )
}

export default BestSellers
