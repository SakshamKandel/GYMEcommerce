import { HttpTypes } from "@medusajs/types"
import BrandRow from "./brand-row"

/**
 * HOME — Section 8: BRAND LINK-LIST (NEW, id="brands", per 03 §2.7 + R15).
 * One giant BrandRow per collection (Brand = Collection), dynamic from listCollections,
 * capped at 10, with a final "ALL BRANDS →" row → /store. Designed empty state if none.
 */
const BrandList = ({
  collections,
}: {
  collections: HttpTypes.StoreCollection[]
}) => {
  const brands = (collections ?? []).slice(0, 10)

  return (
    <section id="brands" className="scroll-mt-24 bg-paper">
      <div className="shell section-y">
        <header className="mb-10 md:mb-14">
          <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
            The roster
          </p>
          <h2 className="font-display text-display-1 uppercase text-ink">
            Brands we carry
          </h2>
        </header>

        {brands.length === 0 ? (
          <div className="border-y border-ink/15 py-16 text-center">
            <p className="font-display text-display-2 uppercase text-ink">
              Roster loading soon
            </p>
            <p className="mx-auto mt-3 max-w-md font-body text-body-sm text-ash">
              Our authorized-distributor brand line-up is being stocked. Browse
              everything in the meantime.
            </p>
          </div>
        ) : (
          <nav className="border-b border-ink/15">
            {brands.map((collection) => (
              <BrandRow
                key={collection.id}
                title={collection.title}
                href={`/collections/${collection.handle}`}
              />
            ))}
            <BrandRow title="All brands" href="/store" meta="Everything in stock" />
          </nav>
        )}
      </div>
    </section>
  )
}

export default BrandList
