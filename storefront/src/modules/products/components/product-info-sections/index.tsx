import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NutritionFacts from "@modules/products/components/nutrition-facts"
import Reveal from "@modules/products/components/reveal"
import React from "react"

type ProductInfoSectionsProps = {
  product: HttpTypes.StoreProduct
}

const proseClass =
  "font-body text-body-sm text-ash leading-relaxed whitespace-pre-line"

const SECTIONS = [
  { id: "description", index: "01", title: "Description" },
  { id: "supplement-facts", index: "02", title: "Supplement facts" },
  { id: "how-to-use", index: "03", title: "How to use" },
  { id: "delivery-cod", index: "04", title: "Delivery & COD" },
  { id: "authenticity", index: "05", title: "Authenticity" },
] as const

const InfoSection = ({
  id,
  index,
  title,
  children,
}: {
  id: string
  index: string
  title: string
  children: React.ReactNode
}) => (
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="scroll-mt-28 border-t border-line py-10 first:border-t-0 first:pt-0"
  >
    <Reveal>
      <div className="mb-5 flex items-baseline gap-4">
        <span
          aria-hidden="true"
          className="font-mono text-label uppercase tracking-label text-red"
        >
          {index}
        </span>
        <h3
          id={`${id}-heading`}
          className="font-body text-h3 font-semibold text-ink"
        >
          {title}
        </h3>
      </div>
      {children}
    </Reveal>
  </section>
)

/**
 * Below-the-fold information architecture: a sticky anchor index on desktop
 * (horizontal chip row on mobile) plus five anchored sections. All copy is
 * the real launch copy carried over from the former tabs component — the old
 * "Ingredients" tab copy now lives under Supplement facts.
 */
const ProductInfoSections = ({ product }: ProductInfoSectionsProps) => {
  return (
    <section
      className="border-t border-ink/15 bg-paper"
      data-testid="product-info-sections"
      aria-label="Product information"
    >
      <div className="shell grid grid-cols-1 gap-10 py-14 small:grid-cols-[240px_minmax(0,1fr)] small:gap-16 small:py-20">
        {/* Anchor index */}
        <nav
          aria-label="Product information sections"
          className="min-w-0 self-start small:sticky small:top-24"
        >
          <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
            The details
          </p>
          <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 small:mx-0 small:flex-col small:gap-0 small:overflow-visible small:px-0">
            {SECTIONS.map((section) => (
              <li key={section.id} className="shrink-0 small:shrink">
                {/* Mobile: chip. Desktop: hairline index row. */}
                <a
                  href={`#${section.id}`}
                  className="group flex items-center gap-3 rounded-full border border-ink/25 px-4 py-2 transition-colors hover:border-ink small:rounded-none small:border-x-0 small:border-b-0 small:border-t small:border-line small:px-1 small:py-3"
                >
                  <span className="hidden font-mono text-label-sm uppercase tracking-label text-ash transition-colors group-hover:text-red small:inline">
                    {section.index}
                  </span>
                  <span className="whitespace-nowrap font-body text-xs font-semibold uppercase tracking-wide text-ink">
                    {section.title}
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    className="ml-auto hidden h-3.5 w-3.5 -translate-x-1 text-ink opacity-0 transition-all duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100 small:block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="flex min-w-0 flex-col">
          <InfoSection id="description" index="01" title="Description">
            <p className={proseClass} data-testid="product-tab-description">
              {product.description ||
                "Authentic sports nutrition, sourced from authorized distributors and delivered across Nepal. Full nutritional information and directions are printed on the sealed product label."}
            </p>
          </InfoSection>

          <InfoSection
            id="supplement-facts"
            index="02"
            title="Supplement facts"
          >
            <div className="max-w-xl">
              <NutritionFacts product={product} />
            </div>
            <div className="mt-5 flex max-w-xl flex-col gap-y-3">
              <p className={proseClass}>
                The full ingredient list, allergen information, and per-serving
                nutritional values are printed on the physical product label.
                Formulations can vary by flavour and batch, so always read the
                label before use.
              </p>
              <p className={proseClass}>
                Have a question about a specific ingredient or allergen?
                Message us on WhatsApp before you buy and we&apos;ll confirm
                the details for your chosen flavour.
              </p>
            </div>
          </InfoSection>

          <InfoSection id="how-to-use" index="03" title="How to use">
            <div className="flex max-w-xl flex-col gap-y-3">
              <p className={proseClass}>
                Add one serving (see the scoop and label for the exact amount)
                to 200–300 ml of cold water or milk. Shake or blend for 20–30
                seconds until fully mixed.
              </p>
              <p className={proseClass}>
                Best taken post-workout or between meals to hit your daily
                protein target. Do not exceed the serving size stated on the
                label. Keep sealed, store in a cool, dry place, and use within
                the shelf life printed on the pack.
              </p>
            </div>
          </InfoSection>

          <InfoSection id="delivery-cod" index="04" title="Delivery & COD">
            <div className="flex max-w-xl flex-col gap-y-4">
              <div className="flex flex-col gap-y-1">
                <span className="font-mono text-label-sm uppercase tracking-label text-ink">
                  Inside Kathmandu Valley
                </span>
                <span className={proseClass}>
                  Delivered in 1–2 days • Pay on delivery.
                </span>
              </div>
              <div className="flex flex-col gap-y-1">
                <span className="font-mono text-label-sm uppercase tracking-label text-ink">
                  Outside Valley
                </span>
                <span className={proseClass}>
                  Delivered in 3–5 days • Pay on delivery.
                </span>
              </div>
              <p className={proseClass}>
                Cash on Delivery is available nationwide — pay the rider in
                cash when your order arrives, no advance payment needed.
                Flat-rate shipping is calculated at checkout based on your
                delivery zone.
              </p>
            </div>
          </InfoSection>

          <InfoSection id="authenticity" index="05" title="Authenticity">
            <div className="flex max-w-xl flex-col gap-y-3">
              <p className={proseClass}>
                Every tub is sourced directly from authorized distributors —
                never grey-market or parallel imports. Products arrive sealed,
                are verified on intake, and stored properly until they reach
                your door.
              </p>
              <LocalizedClientLink
                href="/authenticity"
                className="w-fit font-mono text-label-sm uppercase tracking-label text-red transition-colors hover:text-red-deep"
              >
                Read our authenticity guarantee →
              </LocalizedClientLink>
            </div>
          </InfoSection>
        </div>
      </div>
    </section>
  )
}

export default ProductInfoSections
