import ScrollReveal from "@modules/home/components/scroll-reveal"

/**
 * HOME — INTRO STATEMENT (kinetic upgrade).
 * Paper band. The 03 §2.2 statement, now with a red pivot phrase and a mono
 * checklist column on desktop. Scroll-reveals once; static under
 * prefers-reduced-motion / no-JS.
 */
const PROOFS = ["Sealed", "Sourced", "Verified"]

const IntroStatement = () => {
  return (
    <section className="bg-paper">
      <div className="shell section-y grid gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
        <ScrollReveal>
          <p className="mb-6 font-mono text-label uppercase tracking-label text-red">
            Why Protein Pasal
          </p>
          <p className="max-w-4xl font-body text-body-lg font-semibold leading-tight text-ink small:text-[2.15rem] small:leading-[1.12]">
            Nepal&apos;s supplements are full of fakes.{" "}
            <span className="text-red">We&apos;re not.</span> Every tub is
            sealed, sourced, and verified — from the brands lifters actually
            trust.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={160} className="hidden md:block">
          <ul className="space-y-3 border-l border-ink/15 pl-6">
            {PROOFS.map((proof) => (
              <li
                key={proof}
                className="flex items-center gap-3 font-mono text-label uppercase tracking-label text-ash"
              >
                <span aria-hidden="true" className="text-red">
                  ✱
                </span>
                {proof}
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default IntroStatement
