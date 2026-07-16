import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Giant stacked brand link row (02 §5.7 verbatim / R15): hairline-separated full-width row,
 * ink fill sweeps up on hover, text inverts to paper, arrow tip turns red. GPU-cheap translate.
 * No fabricated product counts (R10) — meta is a static honest label.
 */
const BrandRow = ({
  title,
  href,
  meta = "Official range",
}: {
  title: string
  href: string
  meta?: string
}) => {
  return (
    <LocalizedClientLink
      href={href}
      className="group relative flex items-center justify-between overflow-hidden border-t border-ink/15 px-1 py-6 md:py-9"
      data-testid="brand-row"
    >
      <span className="pointer-events-none absolute inset-0 -z-0 translate-y-full bg-ink transition-transform duration-200 ease-out group-hover:translate-y-0" />
      <span className="relative z-10 font-display text-display-2 uppercase leading-none text-ink transition-colors duration-200 group-hover:text-paper">
        {title}
      </span>
      <span className="relative z-10 flex items-center gap-3 transition-colors duration-200 group-hover:text-paper">
        <span className="hidden font-mono text-label uppercase tracking-label text-ash group-hover:text-paper/70 xsmall:inline">
          {meta}
        </span>
        <svg
          viewBox="0 0 16 16"
          className="h-5 w-5 -translate-x-1 text-ink transition-transform duration-200 group-hover:translate-x-0 group-hover:text-red"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
        </svg>
      </span>
    </LocalizedClientLink>
  )
}

export default BrandRow
