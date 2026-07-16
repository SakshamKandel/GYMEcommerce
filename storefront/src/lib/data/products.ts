"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

/**
 * Lists products from `/store/products`.
 *
 * `queryParams` passes straight through to the Store API, so callers can send
 * `q` (keyword search over title/description) and array filters
 * (`collection_id[]`, `category_id[]`) — the launch search/facet system relies
 * on this passthrough.
 * // TODO: swap to Meilisearch once the post-launch criteria in 01 §8.4 are met.
 */
export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*collection,",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * Returns the cheapest calculated variant amount for a product — the same
 * amount the product card displays ("from" price).
 */
const getCheapestAmount = (product: HttpTypes.StoreProduct): number | null => {
  const amounts = (product.variants ?? [])
    .map((variant: any) => variant?.calculated_price?.calculated_amount)
    .filter((amount: any): amount is number => typeof amount === "number")

  return amounts.length ? Math.min(...amounts) : null
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 *
 * `minPrice` / `maxPrice` (whole NPR rupees) implement the price facet as a
 * client-side clamp on `calculated_price` within the fetched window — approach
 * (a) from the master plan (§2, "Price facet"); the launch catalog fits in a
 * single 100-product fetch, so counts and pagination stay consistent.
 * // TODO price-facet server-side (price-range query / Meilisearch filter post-launch)
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  minPrice,
  maxPrice,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  sortBy?: SortOptions
  countryCode: string
  minPrice?: number
  maxPrice?: number
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const hasPriceFilter =
    typeof minPrice === "number" || typeof maxPrice === "number"

  const filteredProducts = hasPriceFilter
    ? sortedProducts.filter((product) => {
        const amount = getCheapestAmount(product)

        if (amount === null) {
          return false
        }
        if (typeof minPrice === "number" && amount < minPrice) {
          return false
        }
        if (typeof maxPrice === "number" && amount > maxPrice) {
          return false
        }

        return true
      })
    : sortedProducts

  const resultCount = hasPriceFilter ? filteredProducts.length : count

  const pageParam = (page - 1) * limit

  const nextPage = resultCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = filteredProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: resultCount,
    },
    nextPage,
    queryParams,
  }
}

/**
 * Products carrying a merchandising tag (managed in Admin → Products →
 * Organize → Tags). Powers the tag-driven home sections:
 *   "featured"    → Featured Pick spotlight
 *   "best-seller" → Best Sellers rail
 *   "trending"    → Trending rail
 * Tag lookup revalidates every 60s, so adding/removing a tag in the admin
 * reshuffles the homepage within a minute. Returns [] when the tag doesn't
 * exist or nothing carries it — callers fall back to their default source.
 */
export const listProductsByTag = async ({
  tagValue,
  countryCode,
  limit = 8,
}: {
  tagValue: string
  countryCode: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> => {
  try {
    const { product_tags } = await sdk.client.fetch<{
      product_tags: { id: string; value: string }[]
    }>(`/store/product-tags`, {
      method: "GET",
      query: { value: tagValue, limit: 1, fields: "id,value" },
      next: { revalidate: 60 },
      cache: "force-cache",
    })

    const tag = product_tags?.[0]
    if (!tag) {
      return []
    }

    const {
      response: { products },
    } = await listProducts({
      countryCode,
      queryParams: { tag_id: [tag.id], limit } as any,
    })

    return products
  } catch {
    return []
  }
}
