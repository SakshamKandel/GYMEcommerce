import fs from "node:fs"
import path from "node:path"

import PillButton from "@modules/common/components/pill-button"
import HeroMedia, { HeroSlide } from "./hero-media"

/**
 * HOME — HERO (minimal carousel, per user feedback).
 * Static, minimal copy — eyebrow, two-line headline, one CTA — over a
 * crossfading media carousel. When a generated video exists at
 * public/hero/gym-loop.mp4 it automatically becomes the first slide
 * (muted loop, grayscale treatment); until then the carousel runs on
 * editorial photos. // TODO(real-photography)
 */

const HERO_VIDEO_PUBLIC_PATH = "/hero/gym-loop.mp4"

const IMAGES = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=2400&q=80",
]

const Hero = () => {
  const hasVideo = fs.existsSync(
    path.join(process.cwd(), "public", "hero", "gym-loop.mp4")
  )

  const slides: HeroSlide[] = [
    ...(hasVideo
      ? [
          {
            type: "video" as const,
            src: HERO_VIDEO_PUBLIC_PATH,
            poster: IMAGES[0],
          },
        ]
      : []),
    ...IMAGES.map((src) => ({ type: "image" as const, src })),
  ]

  return (
    <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden bg-ink">
      <HeroMedia slides={slides} />

      {/* Scrim guarantees paper-on-media contrast on every slide. */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-ink/55"
        aria-hidden="true"
      />

      <div className="on-dark relative z-20 shell py-28 text-center text-paper">
        <p className="mb-5 font-mono text-label uppercase tracking-label text-paper/75">
          Protein &amp; sports nutrition · Nepal
        </p>

        {/* Two-register headline: solid line + outlined line with a single
            red accent — quieter than a full red block. */}
        <h1 className="font-display uppercase">
          <span className="block text-display-hero leading-[0.85]">
            Every brand.
          </span>
          <span className="text-stroke block text-display-hero leading-[0.85]">
            One shop<span className="text-red [-webkit-text-stroke:0]">.</span>
          </span>
        </h1>

        <div className="mt-10 flex items-center justify-center">
          <PillButton href="/store" variant="red" data-testid="hero-shop-all">
            Shop all
          </PillButton>
        </div>
      </div>
    </section>
  )
}

export default Hero
