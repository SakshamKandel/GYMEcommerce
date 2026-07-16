"use client"

import { clx } from "@medusajs/ui"
import React, { useEffect, useRef, useState } from "react"

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Stagger delay in ms applied to the reveal transition. */
  delay?: number
}

/**
 * Reveal-on-scroll wrapper (design 02 §6: run once, 500ms, no bounce).
 *
 * Progressive-enhancement contract: content renders fully visible by default.
 * Only after hydration — and only when the element is still below the fold,
 * motion is not reduced, and IntersectionObserver exists — do we "arm" the
 * hidden state and reveal on intersection. Without JS nothing is ever hidden.
 */
const Reveal = ({ children, className, delay }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<"idle" | "armed" | "shown">("idle")

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === "undefined") return
    if (!("IntersectionObserver" in window)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Already (partially) on screen at hydration time — never hide it.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.95) return

    setPhase("armed")
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("shown")
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={clx(
        "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        phase === "armed" && "translate-y-4 opacity-0",
        phase === "shown" && "translate-y-0 opacity-100",
        className
      )}
    >
      {children}
    </div>
  )
}

export default Reveal
