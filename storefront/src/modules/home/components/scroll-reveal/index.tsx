"use client"

import React, { useEffect, useRef, useState } from "react"
import styles from "./scroll-reveal.module.css"

/**
 * HOME — shared once-per-section scroll reveal.
 *
 * Progressive-enhancement contract (guardrail: content must NEVER be stuck
 * invisible):
 *  - SSR / no-JS renders children fully visible (no reveal attribute at all).
 *  - On mount, if the user prefers reduced motion → do nothing, stay static.
 *  - Otherwise an IntersectionObserver checks the element once:
 *      · already on screen  → leave it visible (no hide/re-show flash),
 *      · below the fold     → park it hidden, then animate it in the first
 *                             time it enters the viewport (one-shot).
 */
type ScrollRevealProps = {
  children: React.ReactNode
  /** Extra classes on the wrapper (layout classes welcome — e.g. h-full). */
  className?: string
  /** Stagger offset in ms, applied via CSS animation-delay. */
  delay?: number
}

type RevealState = "idle" | "hidden" | "in"

const ScrollReveal = ({ children, className, delay = 0 }: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState<RevealState>("idle")

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let sawFirstEntry = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (!sawFirstEntry) {
          sawFirstEntry = true
          if (entry.isIntersecting) {
            // Already on screen when JS arrived — never hide visible content.
            observer.disconnect()
            return
          }
          setState("hidden")
          return
        }
        if (entry.isIntersecting) {
          setState("in")
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className ? `${styles.item} ${className}` : styles.item}
      data-reveal={state === "idle" ? undefined : state}
      style={
        delay > 0
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  )
}

export default ScrollReveal
