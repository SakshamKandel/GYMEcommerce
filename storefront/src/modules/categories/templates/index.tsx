import { notFound } from "next/navigation"
import { Suspense } from "react"

import { listCollections } from "@lib/data/collections"
import { HttpTypes } from "@medusajs/types"
import HScrollRail from "@modules/common/components/hscroll-rail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import {
  parseCsvParam,
  parsePriceParam,
  resolveHandlesToIds,
} from "@modules/store/lib/facet-utils"
import PaginatedProducts from "@modules/store/templates/paginated-products"

/**
 * Category page (Category = product type). Anton header band + description,
 * child-category chips in an HScrollRail, facets with the category locked —
 * the sidebar exposes brand + price + sort only.
 */
export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  brand,
  minPrice,
  maxPrice,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  /** comma-separated collection handles from ?brand= */
  brand?: string
  minPrice?: string
  maxPrice?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const { collections } = await listCollections({ fields: "id,handle,title" })

  const brandOptions = (collections ?? [])
    .filter((collection) => !!collection.handle)
    .map((collection) => ({
      value: collection.handle as string,
      label: collection.title,
    }))

  const selectedCollectionIds = resolveHandlesToIds(
    parseCsvParam(brand),
    collections
  )

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  // getParents collects nearest-first; reverse so the trail reads root → leaf
  const orderedParents = [...parents].reverse()

  return (
    <>
      {/* Category header band */}
      <section className="border-b border-line bg-fog">
        <div className="content-container py-10 small:py-14">
          <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-label uppercase tracking-label text-ash">
            <LocalizedClientLink
              href="/store"
              className="transition-colors hover:text-ink"
            >
              Shop
            </LocalizedClientLink>
            {orderedParents.map((parent) => (
              <span key={parent.id} className="flex items-center gap-x-2">
                <span aria-hidden="true">/</span>
                <LocalizedClientLink
                  href={`/categories/${parent.handle}`}
                  className="transition-colors hover:text-ink"
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </LocalizedClientLink>
              </span>
            ))}
            <span aria-hidden="true">/</span>
            <span className="text-ink">{category.name}</span>
          </p>
          <h1
            className="font-display text-display-1 uppercase leading-[0.9] text-ink"
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-5 max-w-2xl font-body text-body-lg text-ash">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Child-category chips */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="border-b border-line py-5">
          <HScrollRail itemClassName="w-auto shrink-0">
            {category.category_children.map((child) => (
              <LocalizedClientLink
                key={child.id}
                href={`/categories/${child.handle}`}
                className="inline-flex items-center rounded-full border border-ink/25 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                {child.name}
              </LocalizedClientLink>
            ))}
          </HScrollRail>
        </div>
      )}

      <div
        className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-x-12 small:py-12"
        data-testid="category-container"
      >
        <RefinementList
          sortBy={sort}
          brands={brandOptions}
          data-testid="sort-by-container"
        />
        <div className="w-full">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              collectionIds={selectedCollectionIds}
              minPrice={parsePriceParam(minPrice)}
              maxPrice={parsePriceParam(maxPrice)}
              countryCode={countryCode}
              emptyState={{
                body: `No ${category.name} products match these filters. Loosen one and try again.`,
                cta: {
                  label: "Clear filters",
                  href: `/categories/${category.handle}`,
                },
              }}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
