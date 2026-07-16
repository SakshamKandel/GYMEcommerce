import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type NutritionFactsProps = {
  product: HttpTypes.StoreProduct
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
 * Supplement-label style spec sheet.
 * Reads exactly the four seeded metadata keys (R11):
 *   protein_per_serving · servings · origin_country · flavor_notes
 * plus Brand / Category / Net weight derived from product data. Every row is
 * render-if-present; the batch/expiry row is always rendered as a static
 * fallback so the block is never empty.
 */
const NutritionFacts = ({ product }: NutritionFactsProps) => {
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
    <section
      aria-labelledby="product-specs-heading"
      data-testid="product-nutrition-facts"
      className="shell section-y"
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
          The spec sheet
        </p>
        <h2
          id="product-specs-heading"
          className="mb-8 font-display text-display-2 uppercase text-ink"
        >
          Product details
        </h2>

        <dl className="border border-ink">
          <div className="grid grid-cols-[1fr_1.3fr] bg-ink text-paper">
            <p className="px-4 py-3 font-mono text-label-sm uppercase tracking-label">
              Specification
            </p>
            <p className="px-4 py-3 font-mono text-label-sm uppercase tracking-label">
              Detail
            </p>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.label}
              className={clx(
                "grid grid-cols-[1fr_1.3fr] border-t border-line",
                i % 2 === 1 && "bg-fog"
              )}
            >
              <dt className="px-4 py-3 font-mono text-label-sm uppercase tracking-label text-ash">
                {row.label}
              </dt>
              <dd className="px-4 py-3 font-mono text-sm text-ink">
                {row.value}
              </dd>
            </div>
          ))}

          <div
            className={clx(
              "grid grid-cols-[1fr_1.3fr] border-t border-line",
              rows.length % 2 === 1 && "bg-fog"
            )}
          >
            <dt className="px-4 py-3 font-mono text-label-sm uppercase tracking-label text-ash">
              Batch &amp; expiry
            </dt>
            <dd className="px-4 py-3 font-body text-body-sm text-ink">
              {BATCH_FALLBACK}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export default NutritionFacts
