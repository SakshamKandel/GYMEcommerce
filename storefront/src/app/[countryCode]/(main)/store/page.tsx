import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Shop All Products | Protein Pasal",
  description:
    "Browse genuine whey protein, mass gainers, creatine, pre-workout and more from 8 global brands. 100% authentic, Cash on Delivery across Nepal.",
}

type Params = {
  searchParams: Promise<{
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

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, brand, category, minPrice, maxPrice } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      brand={brand}
      category={category}
      minPrice={minPrice}
      maxPrice={maxPrice}
      countryCode={params.countryCode}
    />
  )
}
