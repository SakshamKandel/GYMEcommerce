import GoalCard, { Goal } from "./goal-card"
import ScrollReveal from "@modules/home/components/scroll-reveal"

/**
 * HOME — SHOP BY GOAL (kinetic upgrade, per 03 §2.5 + R18).
 * Four goals, each mapped to a REAL seeded category (04 handles) so every link
 * resolves. Cards carry a one-line hook, red base sweep, a hover pop and
 * colour+scale image reveal; each card scroll-reveals with a stagger.
 * Mobile: horizontal snap-scroll rail. Desktop (md+): 4-up grid.
 */
const GOALS: Goal[] = [
  {
    label: "Build muscle",
    sub: "Whey protein",
    hook: "Isolates and blends that actually hit your macros.",
    href: "/categories/whey-protein",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Gain size",
    sub: "Mass gainers",
    hook: "Calorie-dense fuel for the hard gainers.",
    href: "/categories/mass-gainer",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Train harder",
    sub: "Pre-workout",
    hook: "Energy, focus and pump — on demand.",
    href: "/categories/pre-workout",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Recover well",
    sub: "BCAA & EAA",
    hook: "Aminos that take the edge off tomorrow.",
    href: "/categories/bcaa-eaa",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  },
]

const ShopByGoal = () => {
  return (
    <section className="bg-paper">
      <div className="shell section-y">
        <ScrollReveal>
          <header className="mb-10 md:mb-14">
            <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
              Shop by goal
            </p>
            <h2 className="font-display text-display-1 uppercase text-ink">
              What are you <span className="text-red">training</span> for?
            </h2>
            <p className="mt-4 max-w-lg font-body text-body-sm text-ash">
              Four goals, one shelf — find the stack that matches your
              training.
            </p>
          </header>
        </ScrollReveal>

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
          {GOALS.map((goal, i) => (
            <div
              key={goal.label}
              className="w-[72vw] shrink-0 xsmall:w-[320px] md:w-auto"
            >
              <ScrollReveal delay={i * 90} className="h-full">
                <GoalCard goal={goal} />
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShopByGoal
