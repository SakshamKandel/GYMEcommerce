import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import EmptyState, { PlpEmptyState } from "@modules/store/components/empty-state"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  q?: string
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  collectionIds,
  categoryIds,
  minPrice,
  maxPrice,
  q,
  countryCode,
  emptyState,
}: {
  sortBy?: SortOptions
  page: number
  /** single-id props kept for backward compatibility */
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  /** multi-select facets — brand/category can combine (e.g. brand page + category filter) */
  collectionIds?: string[]
  categoryIds?: string[]
  /** whole NPR rupees — client-side clamp, approach (a) */
  minPrice?: number
  maxPrice?: number
  /** keyword search passthrough to /store/products */
  q?: string
  countryCode: string
  emptyState?: PlpEmptyState
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  const effectiveCollectionIds =
    collectionIds && collectionIds.length
      ? collectionIds
      : collectionId
      ? [collectionId]
      : undefined

  const effectiveCategoryIds =
    categoryIds && categoryIds.length
      ? categoryIds
      : categoryId
      ? [categoryId]
      : undefined

  if (effectiveCollectionIds) {
    queryParams["collection_id"] = effectiveCollectionIds
  }

  if (effectiveCategoryIds) {
    queryParams["category_id"] = effectiveCategoryIds
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (q) {
    // TODO: swap to Meilisearch post-launch (01 §8.4)
    queryParams["q"] = q
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    minPrice,
    maxPrice,
  })

  if (!products.length) {
    return <EmptyState {...emptyState} />
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)
  const from = (page - 1) * PRODUCT_LIMIT + 1
  const to = (page - 1) * PRODUCT_LIMIT + products.length

  return (
    <>
      <p
        className="mb-6 font-mono text-label-sm uppercase tracking-label text-ash"
        data-testid="product-count"
      >
        Showing {from}–{to} of {count} {count === 1 ? "product" : "products"}
      </p>
      <ul
        className="grid w-full grid-cols-2 gap-x-4 gap-y-10 small:grid-cols-3 medium:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
