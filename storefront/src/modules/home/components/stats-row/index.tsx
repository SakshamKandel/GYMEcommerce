"use client"

import { useEffect, useRef, useState } from "react"

/**
 * HOME — STATS ROW (kinetic upgrade).
 * Only real, non-falsifiable claims (R10): 8 GLOBAL BRANDS · 100+ SKUS IN
 * STOCK · 100% AUTHENTIC · COD ALL NEPAL.
 *
 * Numbers count up once when the row scrolls into view:
 *  - SSR / no-JS renders the FINAL values (never zeros).
 *  - prefers-reduced-motion → final values stay, no animation.
 *  - Screen readers always get the final value (animated digits aria-hidden).
 */

type Stat = {
  /** Numeric target when the value can count; null renders `text` statically. */
  end: number | null
  prefix?: string
  suffix?: string
  /** Static display for non-numeric stats (COD). */
  text?: string
  label: string
  sr: string
}

const STATS: Stat[] = [
  { end: 8, label: "Global brands", sr: "8 global brands" },
  { end: 100, suffix: "+", label: "SKUs in stock", sr: "Over 100 SKUs in stock" },
  { end: 100, suffix: "%", label: "Authentic", sr: "100 percent authentic" },
  {
    end: null,
    text: "COD",
    label: "All Nepal",
    sr: "Cash on delivery all over Nepal",
  },
]

const DURATION = 1400
const STAGGER = 140
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

const finalValue = (stat: Stat) =>
  stat.end === null
    ? stat.text ?? ""
    : `${stat.prefix ?? ""}${stat.end}${stat.suffix ?? ""}`

const StatsRow = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  // null → show final values (SSR, no-JS, reduced-motion, animation done).
  const [counts, setCounts] = useState<number[] | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let started = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return
        started = true
        observer.disconnect()

        const t0 = performance.now()
        const tick = (now: number) => {
          const elapsed = now - t0
          let allDone = true
          const next = STATS.map((stat, i) => {
            if (stat.end === null) return 0
            const p = Math.min(1, Math.max(0, (elapsed - i * STAGGER) / DURATION))
            if (p < 1) allDone = false
            return Math.round(easeOutExpo(p) * stat.end)
          })
          if (allDone) {
            setCounts(null) // settle on exact final strings
          } else {
            setCounts(next)
            rafRef.current = requestAnimationFrame(tick)
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      },
      { threshold: 0.35 }
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section className="bg-fog">
      <div className="shell py-14 md:py-20" ref={rootRef}>
        <dl className="grid grid-cols-2 divide-x divide-y divide-ink/15 border-y border-ink/15 md:grid-cols-4 md:divide-y-0">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="group relative px-4 py-10 text-center transition-colors duration-300 hover:bg-paper"
            >
              {/* Red tick that sweeps in on hover — pure accent. */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-red transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
              />
              <dt className="sr-only">{stat.sr}</dt>
              <dd className="font-display text-stat uppercase leading-none text-ink">
                <span aria-hidden="true">
                  {counts && stat.end !== null
                    ? `${stat.prefix ?? ""}${counts[i]}${stat.suffix ?? ""}`
                    : finalValue(stat)}
                </span>
              </dd>
              <p className="mt-3 font-mono text-label uppercase tracking-label text-ash">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default StatsRow
