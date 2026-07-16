"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export type HeroSlide =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string }

const INTERVAL_MS = 6000

/**
 * Crossfading media carousel behind the hero copy. Auto-advances every 6s
 * (paused while the tab is hidden), manual line-indicators, and fully static
 * under prefers-reduced-motion (no auto-advance, video paused on its poster
 * frame). Media only — the copy above it never moves.
 */
const HeroMedia = ({ slides }: { slides: HeroSlide[] }) => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length < 2) {
      return
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    const timer = setInterval(() => {
      if (!document.hidden) {
        setActive((a) => (a + 1) % slides.length)
      }
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <>
      {slides.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.type === "video" ? (
            <video
              className="img-editorial absolute inset-0 h-full w-full object-cover"
              src={slide.src}
              poster={slide.poster}
              autoPlay
              muted
              loop
              playsInline
              ref={(el) => {
                if (
                  el &&
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ) {
                  el.pause()
                }
              }}
            />
          ) : (
            <Image
              src={slide.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="img-editorial object-cover"
            />
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={`h-0.5 w-8 transition-colors duration-300 motion-reduce:transition-none ${
                i === active ? "bg-red" : "bg-paper/30 hover:bg-paper/60"
              }`}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default HeroMedia
