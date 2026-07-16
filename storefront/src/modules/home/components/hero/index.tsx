import Image from "next/image"
import PillButton from "@modules/common/components/pill-button"

/**
 * HOME — Section 1: HERO (REBUILD, per 03 §2.1 + 02 §5.9 + master-plan hero copy/R10).
 * Full-bleed grayscale editorial photo, ink scrim, giant Anton headline with ONE red word,
 * three-brand subline (no counts — R10), red "SHOP ALL" + outline-dark "BROWSE BRANDS" (#brands),
 * COD reassurance microline. GitHub button removed. Above-the-fold: no scroll-reveal.
 */
const Hero = () => {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-ink">
      {/* Grayscale editorial hero photo — decorative (alt=""). // TODO(real-photography) */}
      <Image
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="img-editorial object-cover"
      />
      {/* Scrim guarantees paper-on-photo contrast at any breakpoint. */}
      <div className="absolute inset-0 bg-ink/55" />

      <div className="on-dark relative z-10 shell py-24 text-center text-paper">
        <p className="mb-6 font-mono text-label uppercase tracking-label text-paper/80">
          Protein &amp; sports nutrition · Nepal
        </p>

        <h1 className="font-display text-display-hero uppercase leading-[0.85]">
          Fuel your <span className="text-red">grind.</span>
          <br />
          Every brand. One shop.
        </h1>

        <p className="mx-auto mt-7 max-w-2xl font-body text-body-lg text-paper/85">
          Optimum Nutrition, MuscleBlaze, Dymatize &amp; more world-class brands —
          100% authentic, sealed, and delivered across Nepal.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PillButton href="/store" variant="red" data-testid="hero-shop-all">
            Shop all
          </PillButton>
          <PillButton href="#brands" variant="outline-dark" arrow={false}>
            Browse brands
          </PillButton>
        </div>

        <p className="mt-8 font-mono text-label-sm uppercase tracking-label text-paper/70">
          Cash on delivery all over Nepal · 100% authentic
        </p>
      </div>
    </section>
  )
}

export default Hero
