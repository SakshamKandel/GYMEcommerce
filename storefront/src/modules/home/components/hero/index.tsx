import Image from "next/image"
import type { CSSProperties } from "react"
import PillButton from "@modules/common/components/pill-button"
import styles from "./hero.module.css"

/**
 * HOME — Section 1: HERO (kinetic upgrade).
 * Server component, zero client JS: the load choreography is pure CSS
 * (hero.module.css) so first paint is instant and reduced-motion users get a
 * fully-composed static hero.
 *  - Headline lines clip-reveal upward with a stagger.
 *  - Photo settles with a 14s Ken-Burns zoom.
 *  - Scroll cue pulses at the bottom edge.
 * Copy contract kept: one red word, no invented counts (R10), COD microline.
 */

/** Staggered entrance delays (ms) — headline first, support copy after. */
const D = {
  eyebrow: 80,
  line1: 140,
  line2: 280,
  line3: 420,
  sub: 640,
  ctas: 780,
  micro: 920,
  cue: 1400,
}

const delay = (ms: number) => ({ "--d": `${ms}ms` } as CSSProperties)

const Hero = () => {
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-ink">
      {/* Grayscale editorial hero photo — decorative (alt=""). // TODO(real-photography) */}
      <Image
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`img-editorial object-cover ${styles.kenburns}`}
      />
      {/* Scrim guarantees paper-on-photo contrast at any breakpoint. */}
      <div className="absolute inset-0 bg-ink/60" />
      {/* Bottom gradient anchors the scroll cue and deepens the stage. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/70 to-transparent" />

      <div className="on-dark relative z-10 shell pt-24 pb-32 text-center text-paper">
        <p
          className={`mb-6 font-mono text-label uppercase tracking-label text-paper/80 ${styles.rise}`}
          style={delay(D.eyebrow)}
        >
          Protein &amp; sports nutrition · Nepal
        </p>

        <h1 className="font-display text-display-hero uppercase leading-[0.85]">
          <span className={styles.mask}>
            <span className={styles.line} style={delay(D.line1)}>
              Fuel your <span className="text-red">grind.</span>
            </span>
          </span>
          <span className={styles.mask}>
            <span className={styles.line} style={delay(D.line2)}>
              Every brand.
            </span>
          </span>
          <span className={styles.mask}>
            <span className={styles.line} style={delay(D.line3)}>
              One shop.
            </span>
          </span>
        </h1>

        <p
          className={`mx-auto mt-7 max-w-2xl font-body text-body-lg text-paper/85 ${styles.rise}`}
          style={delay(D.sub)}
        >
          Optimum Nutrition, MuscleBlaze, Dymatize &amp; more world-class brands —
          100% authentic, sealed, and delivered across Nepal.
        </p>

        <div
          className={`mt-9 flex flex-wrap items-center justify-center gap-3 ${styles.rise}`}
          style={delay(D.ctas)}
        >
          <PillButton href="/store" variant="red" data-testid="hero-shop-all">
            Shop all
          </PillButton>
          <PillButton href="#brands" variant="outline-dark" arrow={false}>
            Browse brands
          </PillButton>
        </div>

        <p
          className={`mt-8 font-mono text-label-sm uppercase tracking-label text-paper/70 ${styles.rise}`}
          style={delay(D.micro)}
        >
          Cash on delivery all over Nepal · 100% authentic
        </p>
      </div>

      {/* Scroll cue — decorative, pulses under no-preference only. */}
      <div
        aria-hidden="true"
        className={`absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 [@media(min-height:44rem)]:flex ${styles.rise}`}
        style={delay(D.cue)}
      >
        <span className="font-mono text-label-sm uppercase tracking-wider text-paper/60">
          Scroll
        </span>
        <span className="block h-12 w-px overflow-hidden bg-paper/20">
          <span className={`block h-full w-px bg-red ${styles.cueLine}`} />
        </span>
      </div>
    </section>
  )
}

export default Hero
