import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ScrollReveal from "@modules/home/components/scroll-reveal"

/**
 * HOME — BRANDS WE CARRY logo wall (id="brands").
 * Hairline-grid wall of real brand logos (collection metadata.logo_image),
 * dynamic from listCollections (Brand = Collection), capped at 12.
 * Each tile links to /collections/{handle}. Logos render as permanent INK
 * SILHOUETTES (brightness(0)) — several source logos are white artwork that
 * would blend into the white tiles if ever un-filtered — and "come alive" on
 * hover via opacity + the shared card pop (lift/shadow/zoom) + red base
 * sweep. All hover motion is transform/opacity only, gated behind
 * motion-safe. Tiles fall back to the brand name in display type when a
 * collection carries no logo.
 * Designed empty state if no collections exist.
 */
const BrandList = ({
  collections,
}: {
  collections: HttpTypes.StoreCollection[]
}) => {
  const brands = (collections ?? []).slice(0, 12)

  return (
    <section id="brands" className="scroll-mt-24 bg-paper">
      <div className="shell section-y">
        <ScrollReveal>
          <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
                The roster
              </p>
              <h2 className="font-display text-display-1 uppercase text-ink">
                Brands we carry
              </h2>
            </div>
            <LocalizedClientLink
              href="/store"
              className="group inline-flex items-center gap-2 font-mono text-label uppercase tracking-label text-ink hover:text-red"
            >
              All brands
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
              </svg>
            </LocalizedClientLink>
          </header>
        </ScrollReveal>

        {brands.length === 0 ? (
          <div className="border-y border-line py-16 text-center">
            <p className="font-display text-display-2 uppercase text-ink">
              Roster loading soon
            </p>
            <p className="mx-auto mt-3 max-w-md font-body text-body-sm text-ash">
              Our authorized-distributor brand line-up is being stocked. Browse
              everything in the meantime.
            </p>
          </div>
        ) : (
          <ul
            className="grid grid-cols-2 border-l border-t border-line md:grid-cols-4"
            aria-label="Brands"
          >
            {brands.map((collection, i) => {
              const logo =
                typeof collection.metadata?.logo_image === "string"
                  ? collection.metadata.logo_image
                  : null

              return (
                <li
                  key={collection.id}
                  className="relative border-b border-r border-line hover:z-10"
                >
                  <ScrollReveal delay={(i % 4) * 60} className="h-full">
                    <LocalizedClientLink
                      href={`/collections/${collection.handle}`}
                      className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-paper p-7 motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:scale-[1.03] motion-safe:hover:shadow-xl motion-safe:hover:shadow-ink/15 md:p-10"
                      data-testid="brand-tile"
                    >
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logo}
                          alt={`${collection.title} logo`}
                          loading="lazy"
                          draggable={false}
                          className="max-h-14 w-auto max-w-full object-contain opacity-60 [filter:brightness(0)] transition-[opacity,transform] duration-300 ease-out group-hover:opacity-100 motion-safe:group-hover:scale-[1.06] motion-reduce:transition-none md:max-h-20"
                        />
                      ) : (
                        <span className="text-center font-display text-2xl uppercase leading-none text-ash transition-colors duration-300 ease-out group-hover:text-ink motion-reduce:transition-none md:text-3xl">
                          {collection.title}
                        </span>
                      )}

                      {/* Red base sweep — shared hover language with goal cards. */}
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-red transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                      />
                    </LocalizedClientLink>
                  </ScrollReveal>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default BrandList
