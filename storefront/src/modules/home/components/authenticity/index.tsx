import PillButton from "@modules/common/components/pill-button"
import ScrollReveal from "@modules/home/components/scroll-reveal"
import ParallaxMedia from "./parallax-media"
import styles from "./authenticity.module.css"

/**
 * HOME — AUTHENTICITY PROMISE (kinetic upgrade of the dark split section).
 * Ink band: giant headline + verification chips one side; parallax editorial
 * photo with a slow-rotating "100% AUTHENTIC" seal the other. Only honest,
 * non-falsifiable claims (R10).
 */
const CHECKS = ["Sealed from source", "Batch-checked", "Authorized distributors"]

const Seal = () => (
  <div className="absolute -bottom-7 -left-5 z-10 md:-bottom-9 md:-left-9">
    <svg
      viewBox="0 0 120 120"
      className={`h-28 w-28 drop-shadow-lg md:h-36 md:w-36 ${styles.seal}`}
      aria-hidden="true"
    >
      <defs>
        <path
          id="seal-text-circle"
          d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
        />
      </defs>
      <circle cx="60" cy="60" r="58" className="fill-red" />
      <circle
        cx="60"
        cy="60"
        r="33"
        fill="none"
        strokeWidth="1"
        className="stroke-paper/50"
      />
      {/* ~37 mono glyphs × (6.3 advance + 1.2 tracking) ≈ 278 ≈ 2π·45 — fills the ring. */}
      <text
        className="fill-paper font-mono"
        fontSize="10.5"
        letterSpacing="1.2"
      >
        <textPath href="#seal-text-circle">
          100% AUTHENTIC · SEALED · VERIFIED ·
        </textPath>
      </text>
      {/* Check glyph, square-capped per icon law (02 §10). */}
      <path
        d="M50 60.5l7 7 14.5-16"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="square"
        className="stroke-paper"
      />
    </svg>
  </div>
)

const Authenticity = () => {
  return (
    <section className="on-dark relative overflow-hidden bg-ink text-paper">
      <div className="shell section-y relative grid items-center gap-14 md:grid-cols-2 md:gap-16">
        <ScrollReveal>
          <p className="mb-5 font-mono text-label uppercase tracking-label text-red">
            Our promise
          </p>
          <h2 className="font-display text-display-1 uppercase leading-[0.9]">
            100% genuine.
            <br />
            <span className="text-red">No fakes.</span>
          </h2>
          <p className="mt-6 max-w-md font-body text-body-lg text-paper/80">
            Every tub is imported through authorized distributors, sealed, and
            batch-checked before it reaches your door. No parallel imports. No
            grey market. Just the supplements the world&apos;s best brands
            actually make.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {CHECKS.map((check) => (
              <li
                key={check}
                className="inline-flex items-center gap-2 border border-paper/25 px-3 py-1.5 font-mono text-label-sm uppercase tracking-label text-paper/75"
              >
                <span aria-hidden="true" className="text-red">
                  ✱
                </span>
                {check}
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <PillButton href="/authenticity" variant="inverse">
              How we verify
            </PillButton>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={140} className="relative">
          <ParallaxMedia className="relative aspect-[4/5] rounded-photo bg-coal">
            {/* Editorial photos are grayscale by law (02 §7); decorative alt="". */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1400&q=80"
              alt=""
              loading="lazy"
              className="img-editorial h-full w-full object-cover"
            />
          </ParallaxMedia>
          <Seal />
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Authenticity
