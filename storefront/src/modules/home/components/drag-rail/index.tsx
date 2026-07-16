"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

/**
 * HOME — DRAG RAIL (client): horizontal product rail with visible scroll
 * affordance. Progressive enhancement over a plain overflow-x rail:
 *  - native touch / trackpad / keyboard scrolling always works (no-JS safe),
 *  - mouse users can grab-drag the rail (click vs drag disambiguated with a
 *    6px threshold so product links still click cleanly),
 *  - prev/next square buttons + a red progress bar appear when it overflows,
 *  - smooth button scrolling downgrades to instant under reduced motion.
 * Edge insets match `.shell` so first/last cards align (02 §5.6). The page
 * body never scrolls horizontally — all overflow lives inside the rail.
 */
type DragRailProps = {
  children: React.ReactNode
  itemClassName?: string
  /** Accessible name for the rail region + button labels. */
  label?: string
}

const DragRail = ({
  children,
  itemClassName = "w-[78vw] xsmall:w-[340px]",
  label = "Products",
}: DragRailProps) => {
  const railRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 })
  const rafRef = useRef(0)

  const [overflowing, setOverflowing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = railRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setOverflowing(max > 8)
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft >= max - 2)
    if (barRef.current) {
      const p = max > 0 ? el.scrollLeft / max : 0
      barRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`
    }
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      sync()
    })
  }, [sync])

  useEffect(() => {
    sync()
    const onResize = () => sync()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [sync])

  const scrollByPage = (dir: 1 | -1) => {
    const el = railRef.current
    if (!el) return
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    el.scrollBy({
      left: dir * el.clientWidth * 0.85,
      behavior: reduced ? "auto" : "smooth",
    })
  }

  // ── Mouse drag-to-scroll ──────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return
    const el = railRef.current
    if (!el) return
    drag.current = {
      down: true,
      moved: false,
      startX: e.clientX,
      startLeft: el.scrollLeft,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = railRef.current
    if (!el || !drag.current.down) return
    const dx = e.clientX - drag.current.startX
    if (!drag.current.moved && Math.abs(dx) > 6) {
      drag.current.moved = true
      setDragging(true)
      el.setPointerCapture(e.pointerId)
    }
    if (drag.current.moved) {
      el.scrollLeft = drag.current.startLeft - dx
    }
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return
    drag.current.down = false
    setDragging(false)
    if (drag.current.moved && railRef.current?.hasPointerCapture(e.pointerId)) {
      railRef.current.releasePointerCapture(e.pointerId)
    }
  }

  /** Swallow the click that ends a drag so links don't navigate. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    // Negative margins cancel the `.shell` padding so cards align with the
    // section header while the scroll area bleeds to the shell edge.
    <div className="-mx-5 md:-mx-8 lg:-mx-12">
      <div
        ref={railRef}
        role="region"
        aria-label={label}
        className={[
          // scroll-padding mirrors the responsive inset so the first card
          // rests at scrollLeft 0 (snap-mandatory snaps on load otherwise).
          "flex gap-4 overflow-x-auto no-scrollbar scroll-px-5 md:scroll-px-8 lg:scroll-px-12 px-5 md:px-8 lg:px-12 pb-4",
          dragging
            ? "cursor-grabbing select-none snap-none"
            : "cursor-grab snap-x snap-mandatory",
        ].join(" ")}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {React.Children.map(children, (child) =>
          child == null ? null : (
            <div className={`snap-start shrink-0 ${itemClassName}`}>{child}</div>
          )
        )}
      </div>

      {/* Scroll affordance: drag hint · progress track · square arrows. */}
      {overflowing && (
        <div className="mt-6 flex items-center gap-5 px-5 md:px-8 lg:px-12">
          <span
            aria-hidden="true"
            className="hidden font-mono text-label-sm uppercase tracking-label text-ash md:inline"
          >
            Drag
          </span>
          <div
            aria-hidden="true"
            className="h-px flex-1 overflow-hidden bg-ink/10"
          >
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-red transition-transform duration-150 ease-out motion-reduce:transition-none"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={`${label} — scroll back`}
              disabled={atStart}
              onClick={() => scrollByPage(-1)}
              className="grid h-11 w-11 place-items-center border border-ink/25 text-ink transition-colors duration-150 hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M13 8H3M7 4L3 8l4 4" strokeLinecap="square" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={`${label} — scroll forward`}
              disabled={atEnd}
              onClick={() => scrollByPage(1)}
              className="grid h-11 w-11 place-items-center border border-ink/25 text-ink transition-colors duration-150 hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DragRail
