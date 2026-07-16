import GoalCard, { Goal } from "./goal-card"

/**
 * HOME — Section 6: SHOP BY GOAL (NEW, per 03 §2.5 + R18).
 * Four goals, each mapped to a REAL seeded category (04 handles) so every link resolves:
 *   BUILD MUSCLE → whey-protein · GAIN SIZE → mass-gainer
 *   TRAIN HARDER → pre-workout · RECOVER WELL → bcaa-eaa
 * Mobile: horizontal snap-scroll rail. Desktop (md+): 4-up grid.
 * (Uses a responsive scroll→grid wrapper rather than HScrollRail so desktop is a true 4-up grid.)
 */
const GOALS: Goal[] = [
  {
    label: "Build muscle",
    sub: "Whey protein",
    href: "/categories/whey-protein",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Gain size",
    sub: "Mass gainers",
    href: "/categories/mass-gainer",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Train harder",
    sub: "Pre-workout",
    href: "/categories/pre-workout",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Recover well",
    sub: "BCAA & EAA",
    href: "/categories/bcaa-eaa",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  },
]

const ShopByGoal = () => {
  return (
    <section className="bg-paper">
      <div className="shell section-y">
        <header className="mb-10 md:mb-14">
          <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
            Shop by goal
          </p>
          <h2 className="font-display text-display-1 uppercase text-ink">
            What are you <span className="text-red">training</span> for?
          </h2>
        </header>

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
          {GOALS.map((goal) => (
            <div
              key={goal.label}
              className="w-[72vw] shrink-0 xsmall:w-[320px] md:w-auto"
            >
              <GoalCard goal={goal} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShopByGoal
