import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PillButton from "@modules/common/components/pill-button"

/**
 * Designed zero-result state shared by /store, /search, brand and category
 * pages (universal guardrail 4 — no bare empty grids, ever).
 */
export type PlpEmptyState = {
  title?: string
  body?: string
  cta?: { label: string; href: string }
  /** optional wayfinding chips (used by search: popular categories) */
  chips?: { label: string; href: string }[]
}

const EmptyState = ({
  title = "Nothing here — yet.",
  body = "No products match these filters. Loosen one and try again.",
  cta = { label: "Clear filters", href: "/store" },
  chips,
}: PlpEmptyState) => {
  return (
    <div
      className="flex w-full flex-col items-center justify-center bg-fog px-6 py-20 text-center small:py-28"
      data-testid="empty-state"
    >
      <p className="font-mono text-label uppercase tracking-label text-ash">
        0 products found
      </p>
      <h2 className="mt-4 max-w-3xl font-display text-display-2 uppercase leading-[0.92] text-ink">
        {title}
      </h2>
      <p className="mt-4 max-w-md font-body text-body text-ash">{body}</p>
      {chips && chips.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <LocalizedClientLink
              key={chip.href}
              href={chip.href}
              className="inline-flex items-center rounded-full border border-ink/25 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              {chip.label}
            </LocalizedClientLink>
          ))}
        </div>
      )}
      <div className="mt-8">
        <PillButton href={cta.href} variant="red">
          {cta.label}
        </PillButton>
      </div>
    </div>
  )
}

export default EmptyState
