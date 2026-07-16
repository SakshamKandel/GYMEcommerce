"use client"

import { clx } from "@medusajs/ui"
import React, { useCallback, useEffect, useRef, useState } from "react"

/**
 * Client interactivity layer for HScrollRail (02 §5.6). Renders the ref'd
 * scroll container plus the premium micro-interactions:
 *   • snap-x snap-mandatory scrolling
 *   • edge fade masks that appear only on the scrollable side(s)
 *   • desktop-only prev/next arrow buttons (§5.6 icon-button spec) that scroll
 *     the container, auto-hidden when it doesn't overflow and per-side at an end
 * Scrolling honours prefers-reduced-motion (instant jump instead of smooth).
 *
 * It receives already server-rendered `children` and wraps each in a snap cell,
 * so the parent (a server component) keeps rendering server children — only the
 * scroll chrome is client-side (keeps the server/client boundary correct).
 */
type RailClientProps = {
  children: React.ReactNode
  itemClassName: string
}

const RailArrow = ({
  direction,
  onClick,
  visible,
  disabled,
}: {
  direction: "prev" | "next"
  onClick: () => void
  visible: boolean
  disabled: boolean
}) => (
  <button
    type="button"
    aria-label={direction === "prev" ? "Scroll left" : "Scroll right"}
    tabIndex={-1}
    onClick={onClick}
    disabled={disabled}
    className={clx(
      "absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink bg-paper/90 text-ink shadow-sm backdrop-blur-sm transition-all duration-150 ease-out hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-0",
      direction === "prev" ? "left-2 md:left-5" : "right-2 md:right-5",
      visible && "lg:grid"
    )}
  >
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {direction === "prev" ? (
        <path d="M10 3L5 8l5 5" strokeLinecap="square" />
      ) : (
        <path d="M6 3l5 5-5 5" strokeLinecap="square" />
      )}
    </svg>
  </button>
)

const RailClient = ({ children, itemClassName }: RailClientProps) => {
  // Ref'd scroll container drives the arrows + edge-fade state.
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 1)
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1)
  }, [])

  useEffect(() => {
    update()
    const el = scrollRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update])

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: reduce ? "auto" : "smooth",
    })
  }

  const overflowing = canScrollLeft || canScrollRight
  // Fade only the side(s) with hidden content, so cards at an end stay crisp.
  // Mask fades content (not a colored gutter), so it's background-agnostic.
  const maskImage = `linear-gradient(to right, ${
    canScrollLeft ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)"
  } 0, rgba(0,0,0,1) 3rem, rgba(0,0,0,1) calc(100% - 3rem), ${
    canScrollRight ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)"
  } 100%)`

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 no-scrollbar md:px-8 lg:px-12"
        style={{ WebkitMaskImage: maskImage, maskImage }}
      >
        {React.Children.map(children, (child) =>
          child == null ? null : (
            <div className={`snap-start shrink-0 ${itemClassName}`}>{child}</div>
          )
        )}
      </div>

      <RailArrow
        direction="prev"
        onClick={() => scrollByPage(-1)}
        visible={overflowing}
        disabled={!canScrollLeft}
      />
      <RailArrow
        direction="next"
        onClick={() => scrollByPage(1)}
        visible={overflowing}
        disabled={!canScrollRight}
      />
    </div>
  )
}

export default RailClient
