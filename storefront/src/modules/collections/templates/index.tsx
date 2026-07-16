import Image from "next/image"
import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
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
 * Brand page (Brand = Medusa Collection). Hero band copy + banner come from
 * collection.metadata.description / metadata.banner_image (R12). The brand
 * facet is locked — we're already inside the brand — so the sidebar exposes
 * category + price + sort only.
 */
export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  category,
  minPrice,
  maxPrice,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  /** comma-separated category handles from ?category= */
  category?: string
  minPrice?: string
  maxPrice?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const categories = await listCategories({ fields: "id,handle,name" })

  const categoryOptions = (categories ?? [])
    .filter((cat) => !!cat.handle)
    .map((cat) => ({ value: cat.handle, label: cat.name }))

  const selectedCategoryIds = resolveHandlesToIds(
    parseCsvParam(category),
    categories
  )

  const description =
    typeof collection.metadata?.description === "string"
      ? collection.metadata.description
      : undefined
  const bannerImage =
    typeof collection.metadata?.banner_image === "string"
      ? collection.metadata.banner_image
      : undefined
  const logoImage =
    typeof collection.metadata?.logo_image === "string"
      ? collection.metadata.logo_image
      : undefined
  const productCount = collection.products?.length ?? 0

  return (
    <>
      {/* Brand hero band — grayscale editorial banner + ink scrim (02 §7) */}
      <section className="on-dark relative overflow-hidden bg-ink text-paper">
        {bannerImage && (
          <Image
            src={bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="img-editorial object-cover"
          />
        )}
        <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
        <div className="relative z-10 content-container py-16 small:py-24">
          {/* Brand logo on a paper plate — legible over any banner; the h1
              below always renders, so text remains the guaranteed fallback. */}
          {logoImage && (
            <div className="mb-7 inline-flex items-center bg-paper px-5 py-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* Ink silhouette: several source logos are white artwork that
                  would vanish on the paper plate if rendered unfiltered. */}
              <img
                src={logoImage}
                alt={`${collection.title} logo`}
                className="h-10 w-auto max-w-[220px] object-contain [filter:brightness(0)] md:h-12"
              />
            </div>
          )}
          <p className="mb-4 font-mono text-label uppercase tracking-label text-paper/80">
            Official range
            {productCount > 0 &&
              ` · ${productCount} ${productCount === 1 ? "product" : "products"}`}
          </p>
          <h1 className="font-display text-display-1 uppercase leading-[0.9]">
            {collection.title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl font-body text-body-lg text-paper/85">
              {description}
            </p>
          )}
        </div>
      </section>

      <div className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-x-12 small:py-12">
        <RefinementList sortBy={sort} categories={categoryOptions} />
        <div className="w-full">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              categoryIds={selectedCategoryIds}
              minPrice={parsePriceParam(minPrice)}
              maxPrice={parsePriceParam(maxPrice)}
              countryCode={countryCode}
              emptyState={{
                body: `No ${collection.title} products match these filters. Loosen one and try again.`,
                cta: {
                  label: "Clear filters",
                  href: `/collections/${collection.handle}`,
                },
              }}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
