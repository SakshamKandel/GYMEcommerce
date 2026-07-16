"use client"

import React, { useEffect, useRef } from "react"

/**
 * HOME — subtle scroll parallax (client).
 * The child media drifts vertically (±`travel`px) as the wrapper crosses the
 * viewport. Progressive enhancement:
 *  - SSR / no-JS: plain static media, no transform at all,
 *  - prefers-reduced-motion: effect never activates,
 *  - active: inner layer is scaled up slightly so the drift never exposes
 *    edges; rAF-throttled passive scroll listener, work skipped off-screen.
 */
const ParallaxMedia = ({
  children,
  className,
  travel = 26,
}: {
  children: React.ReactNode
  className?: string
  travel?: number
}) => {
  const outerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const rect = outer.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < -travel || rect.top > vh + travel) return
      // -1 (below viewport) … 0 (centered) … 1 (above viewport)
      const p =
        (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2)
      const y = (p * travel).toFixed(1)
      inner.style.transform = `translate3d(0, ${y}px, 0) scale(1.12)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    // Activate: apply the bleed scale only once JS owns the transform.
    inner.style.transform = "translate3d(0, 0, 0) scale(1.12)"
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [travel])

  return (
    <div ref={outerRef} className={`overflow-hidden ${className ?? ""}`}>
      <div ref={innerRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  )
}

export default ParallaxMedia
