import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type Goal = {
  label: string
  sub: string
  href: string
  image: string
}

/**
 * Square editorial goal card: grayscale photo that reveals colour on hover
 * (.img-editorial-hover + group), paper label + advancing arrow over an ink scrim.
 * Whole card is one link. Sharp corners per design identity.
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
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
      <div className="relative z-10 flex items-end justify-between gap-3 p-5">
        <div>
          <p className="mb-1 font-mono text-label-sm uppercase tracking-label text-paper/70">
            {goal.sub}
          </p>
          <h3 className="font-display text-2xl uppercase leading-none text-paper">
            {goal.label}
          </h3>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center text-paper transition-transform duration-150 ease-out group-hover:translate-x-1">
          <svg
            viewBox="0 0 16 16"
            className="h-5 w-5 text-red"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
          </svg>
        </span>
      </div>
    </LocalizedClientLink>
  )
}

export default GoalCard
