import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type NutritionFactsProps = {
  product: HttpTypes.StoreProduct
  className?: string
}

// Batch/expiry fallback — binding string from master plan §2 / 05 §5.2.
// Never silently absent: an empty expiry area reads as evasive to a Nepali
// buyer already primed to distrust supplement authenticity.
const BATCH_FALLBACK =
  "Shown on the physical product label. Minimum 6 months shelf life guaranteed at time of delivery."

const metaString = (
  metadata: Record<string, unknown> | null | undefined,
  key: string
): string | undefined => {
  const raw = metadata?.[key]
  if (raw === null || raw === undefined) return undefined
  const value = typeof raw === "string" ? raw.trim() : String(raw)
  return value.length ? value : undefined
}

/**
 * FDA-label style "SUPPLEMENT FACTS" panel.
 * Reads exactly the four seeded metadata keys (R11):
 *   protein_per_serving · servings · origin_country · flavor_notes
 * plus Brand / Category / Net weight derived from product data. Every row is
 * render-if-present; the batch/expiry row is always rendered as a static
 * fallback so the panel is never empty. Thick ink rules + mono numbers +
 * zebra fog rows per the spec-sheet identity.
 */
const NutritionFacts = ({ product, className }: NutritionFactsProps) => {
  const rows: { label: string; value: string }[] = []

  const push = (label: string, value?: string) => {
    if (value) rows.push({ label, value })
  }

  push("Brand", product.collection?.title ?? undefined)
  push("Category", product.categories?.[0]?.name ?? undefined)
  push(
    "Net weight",
    typeof product.weight === "number" ? `${product.weight} g` : undefined
  )
  push("Protein per serving", metaString(product.metadata, "protein_per_serving"))
  push("Servings per container", metaString(product.metadata, "servings"))
  push("Flavour notes", metaString(product.metadata, "flavor_notes"))
  push("Country of origin", metaString(product.metadata, "origin_country"))

  return (
    <div
      data-testid="product-nutrition-facts"
      className={clx("border-2 border-ink bg-paper", className)}
    >
      {/* Panel masthead */}
      <div className="px-4 pb-3 pt-4 xsmall:px-5">
        <p className="font-display text-3xl uppercase leading-none text-ink xsmall:text-4xl">
          Supplement facts
        </p>
        <p className="mt-2 font-mono text-label-sm uppercase tracking-label text-ash">
          {product.title}
        </p>
      </div>

      {/* Thick FDA rule */}
      <div aria-hidden="true" className="mx-4 h-2 bg-ink xsmall:mx-5" />

      <dl className="px-4 py-2 xsmall:px-5">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={clx(
              "-mx-2 flex items-baseline justify-between gap-6 border-b border-line px-2 last:border-b-0",
              i % 2 === 1 && "bg-fog"
            )}
          >
            <dt className="py-2.5 font-mono text-label-sm uppercase tracking-label text-ash">
              {row.label}
            </dt>
            <dd className="py-2.5 text-right font-mono text-sm font-bold text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Medium rule before the footnote */}
      <div aria-hidden="true" className="mx-4 h-1 bg-ink xsmall:mx-5" />

      <div className="px-4 py-4 xsmall:px-5">
        <p className="font-mono text-label-sm uppercase tracking-label text-ink">
          Batch &amp; expiry
        </p>
        <p className="mt-1.5 font-body text-body-sm leading-relaxed text-ash">
          {BATCH_FALLBACK}
        </p>
      </div>
    </div>
  )
}

export default NutritionFacts
