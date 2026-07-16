import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type Goal = {
  label: string
  sub: string
  hook: string
  href: string
  image: string
}

/**
 * Square editorial goal card — deliberately STABLE per user feedback:
 * no lift/scale, no image zoom, no sweep bars. The only hover feedback is
 * the grayscale photo warming to colour and the arrow glyph sliding — both
 * subtle, layout-stable, and reduced-motion safe.
 */
const GoalCard = ({ goal }: { goal: Goal }) => {
  return (
    <LocalizedClientLink
      href={goal.href}
      className="group relative flex aspect-square snap-start shrink-0 flex-col justify-end overflow-hidden rounded-photo bg-coal"
      data-testid="goal-card"
    >
      {/* // TODO(real-photography) — placeholder editorial imagery */}
      <Image
        src={goal.image}
        alt=""
        fill
        sizes="(max-width: 768px) 78vw, 25vw"
        className="img-editorial-hover object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

      <div className="relative z-10 p-5 pb-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-label-sm uppercase tracking-label text-paper/70">
              {goal.sub}
            </p>
            <h3 className="font-display text-2xl uppercase leading-none text-paper md:text-3xl">
              {goal.label}
            </h3>
          </div>
          {/* Plain arrow glyph — slides forward on hover, no box. */}
          <svg
            viewBox="0 0 16 16"
            className="mb-0.5 h-5 w-5 shrink-0 text-paper transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:text-red motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
          </svg>
        </div>
        <p className="mt-3 max-w-[26ch] font-body text-body-sm leading-snug text-paper/75">
          {goal.hook}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

export default GoalCard
