import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { PlpEmptyState } from "@modules/store/components/empty-state"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import {
  parseCsvParam,
  parsePriceParam,
  resolveHandlesToIds,
} from "@modules/store/lib/facet-utils"

import PaginatedProducts from "./paginated-products"

/**
 * Shared PLP shell for /store and /search: header band + facet sidebar + grid.
 * All refinement state is URL-driven (?brand=&category=&minPrice=&maxPrice=
 * &sortBy=&page=) so filters compose and survive reload.
 */
const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  brand,
  category,
  minPrice,
  maxPrice,
  q,
  eyebrow = "Shop",
  heading = "All products",
  emptyState,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  /** comma-separated collection handles from ?brand= */
  brand?: string
  /** comma-separated category handles from ?category= */
  category?: string
  minPrice?: string
  maxPrice?: string
  /** keyword search (set by the /search route) */
  q?: string
  eyebrow?: string
  heading?: string
  emptyState?: PlpEmptyState
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const [{ collections }, categories] = await Promise.all([
    listCollections({ fields: "id,handle,title" }),
    listCategories({ fields: "id,handle,name" }),
  ])

  const brandOptions = (collections ?? [])
    .filter((collection) => !!collection.handle)
    .map((collection) => ({
      value: collection.handle as string,
      label: collection.title,
    }))

  const categoryOptions = (categories ?? [])
    .filter((cat) => !!cat.handle)
    .map((cat) => ({ value: cat.handle, label: cat.name }))

  const selectedCollectionIds = resolveHandlesToIds(
    parseCsvParam(brand),
    collections
  )
  const selectedCategoryIds = resolveHandlesToIds(
    parseCsvParam(category),
    categories
  )

  return (
    <>
      {/* PLP header band */}
      <section className="bg-ink text-paper">
        <div className="content-container py-10 small:py-14">
          <p className="mb-3 font-mono text-label uppercase tracking-label text-paper/70">
            {eyebrow}
          </p>
          <h1
            className="font-display text-display-2 uppercase leading-[0.92]"
            data-testid="store-page-title"
          >
            {heading}
          </h1>
        </div>
      </section>

      <div
        className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-x-12 small:py-12"
        data-testid="category-container"
      >
        <RefinementList
          sortBy={sort}
          brands={brandOptions}
          categories={categoryOptions}
        />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionIds={selectedCollectionIds}
              categoryIds={selectedCategoryIds}
              minPrice={parsePriceParam(minPrice)}
              maxPrice={parsePriceParam(maxPrice)}
              q={q}
              countryCode={countryCode}
              emptyState={
                emptyState ?? {
                  cta: { label: "Clear filters", href: "/store" },
                }
              }
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default StoreTemplate
