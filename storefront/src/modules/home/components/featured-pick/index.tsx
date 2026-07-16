import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import { listProductsWithSort } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import PillButton from "@modules/common/components/pill-button"
import ScrollReveal from "@modules/home/components/scroll-reveal"

/**
 * HOME — FEATURED PICK (replaces the stats band per user feedback:
 * "something product, more better for the users").
 * Spotlights one real catalog product — image, brand, price, CTA — on a fog
 * band. Picks the highest-priced product from the newest page so the spotlight
 * always shows a flagship-feeling item without needing a manual merchandising
 * flag. // TODO(merchandising): drive via product metadata.featured later.
 * Renders nothing if the catalog is empty (page stays clean).
 */
const FeaturedPick = async ({
  region: _region,
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
    return null
  }

  const pick = [...products].sort((a, b) => {
    const priceOf = (p: HttpTypes.StoreProduct) =>
      getProductPrice({ product: p }).cheapestPrice?.calculated_price_number ??
      0
    return priceOf(b) - priceOf(a)
  })[0]

  const { cheapestPrice } = getProductPrice({ product: pick })
  const brand = pick.collection?.title

  return (
    <section className="bg-fog">
      <div className="shell section-y">
        <ScrollReveal>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-base bg-paper">
              {pick.thumbnail && (
                <Image
                  src={pick.thumbnail}
                  alt={brand ? `${brand} — ${pick.title}` : pick.title}
                  fill
                  sizes="(max-width: 768px) 90vw, 40vw"
                  className="object-contain p-8"
                />
              )}
            </div>

            <div className="text-center md:text-left">
              <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
                Featured pick
              </p>
              {brand && (
                <p className="mb-2 font-mono text-label uppercase tracking-label text-ash">
                  {brand}
                </p>
              )}
              <h2 className="font-display text-display-2 uppercase leading-none text-ink">
                {pick.title}
              </h2>
              {cheapestPrice && (
                <p className="mt-5 font-body text-h2 font-semibold text-ink">
                  From {cheapestPrice.calculated_price}
                </p>
              )}
              <p className="mt-3 font-body text-body-sm text-ash">
                100% authentic · Cash on Delivery · Free delivery over Rs.
                10,000
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <PillButton
                  href={`/products/${pick.handle}`}
                  variant="primary"
                  data-testid="featured-pick-cta"
                >
                  View product
                </PillButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default FeaturedPick
