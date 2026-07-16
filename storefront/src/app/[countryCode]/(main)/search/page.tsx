import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

/**
 * Search results (NEW route — Workstream C, checklist 5).
 * Launch search = Medusa built-in `q=` passthrough over /store/products
 * (title/description match). The nav search box (Workstream A) submits to
 * `/search?q=` — that URL is the only contract between the two.
 * Reuses the store PLP shell so search inherits facets/sort/pagination.
 */

type Params = {
  searchParams: Promise<{
    q?: string
    sortBy?: SortOptions
    page?: string
    brand?: string
    category?: string
    minPrice?: string
    maxPrice?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { q } = await props.searchParams
  const query = q?.trim()

  return {
    title: query
      ? `Search results for "${query}" | Protein Pasal`
      : "Search | Protein Pasal",
    description:
      "Search genuine protein and sports supplements from 8 global brands — 100% authentic, Cash on Delivery across Nepal.",
  }
}

export default async function SearchPage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { q, sortBy, page, brand, category, minPrice, maxPrice } = searchParams

  const query = q?.trim() || undefined

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      brand={brand}
      category={category}
      minPrice={minPrice}
      maxPrice={maxPrice}
      q={query}
      eyebrow="Search"
      heading={query ? `Results for “${query}”` : "Search the shop"}
      countryCode={params.countryCode}
      emptyState={{
        title: query ? `No matches for “${query}”.` : "Nothing to search yet.",
        body: query
          ? "Check the spelling, try a shorter keyword, or jump into a popular category instead."
          : "Type a product, brand, or category into the search bar above to get started.",
        cta: { label: "Browse all products", href: "/store" },
        chips: [
          { label: "Whey Protein", href: "/categories/whey-protein" },
          { label: "Creatine", href: "/categories/creatine" },
          { label: "Pre-Workout", href: "/categories/pre-workout" },
          { label: "Mass Gainer", href: "/categories/mass-gainer" },
        ],
      }}
    />
  )
}
