import { HttpTypes } from "@medusajs/types"
import { listProductsByTag } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import DragRail from "@modules/home/components/drag-rail"
import ScrollReveal from "@modules/home/components/scroll-reveal"

/**
 * HOME — TRENDING rail, fully admin-curated: renders ONLY when at least one
 * product carries the "trending" tag (Admin → Products → Organize → Tags).
 * Untagged catalog → the section doesn't exist on the page, so there's no
 * empty-state design debt. Same DragRail/ProductPreview language as the
 * other rails.
 */
const TrendingSection = async ({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) => {
  const products = await listProductsByTag({
    tagValue: "trending",
    countryCode,
    limit: 8,
  })

  if (!products?.length) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="shell section-y relative">
        <ScrollReveal>
          <header className="mb-10 md:mb-14">
            <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
              Hot right now
            </p>
            <h2 className="font-display text-display-1 uppercase text-ink">
              Trending
            </h2>
            <p className="mt-4 max-w-lg font-body text-body-sm text-ash">
              What everyone&apos;s grabbing this week.
            </p>
          </header>
        </ScrollReveal>
        <DragRail itemClassName="w-[64vw] xsmall:w-[280px]" label="Trending">
          {products.map((product) => (
            <ProductPreview key={product.id} product={product} region={region} />
          ))}
        </DragRail>
      </div>
    </section>
  )
}

export default TrendingSection
