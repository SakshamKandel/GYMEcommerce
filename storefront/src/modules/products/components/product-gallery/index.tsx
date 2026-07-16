"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Image from "next/image"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

type ProductGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  /** Real product title for descriptive alt text (design 02 §8). */
  title: string
}

const ArrowIcon = ({ flipped }: { flipped?: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    className={clx("h-4 w-4", flipped && "rotate-180")}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
  </svg>
)

const CloseIcon = () => (
  <svg
    viewBox="0 0 16 16"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path d="M3 3l10 10M13 3L3 13" strokeLinecap="square" />
  </svg>
)

const ExpandIcon = () => (
  <svg
    viewBox="0 0 16 16"
    className="h-3.5 w-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9 7M2.5 13.5L7 9" strokeLinecap="square" />
  </svg>
)

/**
 * PDP gallery — main stage + thumbnail strip on desktop, snap-scroll swipe
 * carousel with dot/count indicator on mobile. Click opens an accessible
 * lightbox (focus trapped, Escape closes, arrow keys navigate). Crossfade on
 * image swap, cursor-tracked hover zoom on the stage. Product photos are
 * ALWAYS full color (`img-product`) — brand colors are load-bearing for trust
 * (design 02 §7).
 */
const ProductGallery = ({ images, title }: ProductGalleryProps) => {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%")

  const trackRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const scrollRafRef = useRef<number | null>(null)

  const count = images.length
  const imagesKey = useMemo(() => images.map((i) => i.id).join("|"), [images])

  // Variant switch filters the image set server-side — reset to the first frame.
  useEffect(() => {
    setActive(0)
    trackRef.current?.scrollTo({ left: 0 })
  }, [imagesKey])

  const clampedActive = Math.min(active, Math.max(0, count - 1))

  const goTo = useCallback(
    (index: number) => {
      const next = (index + count) % count
      setActive(next)
      const track = trackRef.current
      if (track) {
        track.scrollTo({ left: next * track.clientWidth })
      }
    },
    [count]
  )

  // Mobile carousel index tracking (rAF-throttled).
  const handleTrackScroll = useCallback(() => {
    if (scrollRafRef.current !== null) return
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null
      const track = trackRef.current
      if (!track || track.clientWidth === 0) return
      const index = Math.round(track.scrollLeft / track.clientWidth)
      setActive((prev) =>
        prev === index ? prev : Math.min(Math.max(index, 0), count - 1)
      )
    })
  }, [count])

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current)
      }
    }
  }, [])

  // Hover zoom lens: track the cursor so the scaled image zooms toward it.
  const handleStageMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`)
    },
    []
  )
  const resetZoomOrigin = useCallback(() => setZoomOrigin("50% 50%"), [])

  const openLightbox = useCallback(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    lastFocusedRef.current?.focus?.()
  }, [])

  // Lightbox: scroll lock, Escape, arrow keys, and a manual focus trap.
  useEffect(() => {
    if (!lightboxOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        closeLightbox()
        return
      }
      if (e.key === "ArrowRight" && count > 1) {
        e.preventDefault()
        goTo(clampedActive + 1)
        return
      }
      if (e.key === "ArrowLeft" && count > 1) {
        e.preventDefault()
        goTo(clampedActive - 1)
        return
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current
        if (!dialog) return
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, [href], [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"))
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxOpen, clampedActive, count, closeLightbox, goTo])

  if (!count) {
    return (
      <div
        className="relative aspect-[4/5] w-full bg-fog"
        data-testid="product-gallery"
        aria-hidden="true"
      />
    )
  }

  const altFor = (index: number) => `${title} — image ${index + 1} of ${count}`

  return (
    <div className="w-full" data-testid="product-gallery">
      {/* ── Desktop: vertical thumbnail strip + zoomable stage ─────────── */}
      <div className="hidden w-full items-start gap-4 small:flex">
        {count > 1 && (
          <div
            className="flex w-20 shrink-0 flex-col gap-3"
            role="group"
            aria-label="Product images"
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${count}`}
                aria-current={index === clampedActive ? "true" : undefined}
                data-testid="gallery-thumbnail"
                className={clx(
                  "relative aspect-square w-full overflow-hidden bg-fog transition-[border-color,opacity] duration-150 ease-out",
                  index === clampedActive
                    ? "border-2 border-ink"
                    : "border border-line opacity-80 hover:border-ash hover:opacity-100"
                )}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="img-product object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openLightbox}
            onMouseMove={handleStageMouseMove}
            onMouseLeave={resetZoomOrigin}
            aria-label={`Open image ${clampedActive + 1} of ${count} in full screen`}
            data-testid="gallery-stage"
            className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-fog"
          >
            {images.map((image, index) => (
              <span
                key={image.id}
                aria-hidden={index !== clampedActive}
                className={clx(
                  "absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none",
                  index === clampedActive
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                )}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    alt={index === clampedActive ? altFor(index) : ""}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 720px"
                    style={{ transformOrigin: zoomOrigin }}
                    className={clx(
                      "img-product object-cover transition-transform duration-300 ease-out motion-reduce:transition-none",
                      index === clampedActive &&
                        "group-hover:scale-[1.75] motion-reduce:group-hover:scale-100"
                    )}
                  />
                )}
              </span>
            ))}

            <span className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 bg-ink/80 px-2.5 py-1.5 font-mono text-label-sm uppercase tracking-label text-paper opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
              <ExpandIcon />
              {count > 1 ? `${clampedActive + 1} / ${count}` : "Enlarge"}
            </span>
          </button>
          <p className="mt-3 font-mono text-label-sm uppercase tracking-label text-ash">
            Hover to zoom · click to enlarge
          </p>
        </div>
      </div>

      {/* ── Mobile: swipe carousel with dot / count indicator ──────────── */}
      <div className="small:hidden">
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          aria-roledescription="carousel"
          aria-label="Product images"
          className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={openLightbox}
              aria-label={`Open image ${index + 1} of ${count} in full screen`}
              className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-fog"
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt={altFor(index)}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="img-product object-cover"
                />
              )}
            </button>
          ))}
        </div>

        {count > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  tabIndex={-1}
                  onClick={() => goTo(index)}
                  className={clx(
                    "h-1.5 rounded-full transition-all duration-200 ease-out",
                    index === clampedActive ? "w-5 bg-ink" : "w-1.5 bg-line"
                  )}
                />
              ))}
            </div>
            <p
              className="font-mono text-label-sm uppercase tracking-label text-ash"
              aria-live="polite"
            >
              {clampedActive + 1} / {count}
            </p>
          </div>
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — image viewer`}
          data-testid="gallery-lightbox"
          className="on-dark fixed inset-0 z-[90] flex flex-col bg-ink/95"
        >
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <p className="font-mono text-label uppercase tracking-label text-paper/70">
              {clampedActive + 1} / {count}
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Close image viewer"
              data-testid="gallery-lightbox-close"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/40 text-paper transition-colors duration-150 hover:bg-paper hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>

          <div
            className="relative min-h-0 flex-1"
            onClick={closeLightbox}
            aria-hidden="true"
          >
            {!!images[clampedActive]?.url && (
              <Image
                src={images[clampedActive].url}
                alt={altFor(clampedActive)}
                fill
                sizes="100vw"
                className="img-product object-contain p-4 md:p-10"
              />
            )}
          </div>

          <div className="flex items-center justify-center gap-4 px-4 py-4 md:py-6">
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(clampedActive - 1)}
                  aria-label="Previous image"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/40 text-paper transition-colors duration-150 hover:bg-paper hover:text-ink"
                >
                  <ArrowIcon flipped />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(clampedActive + 1)}
                  aria-label="Next image"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/40 text-paper transition-colors duration-150 hover:bg-paper hover:text-ink"
                >
                  <ArrowIcon />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductGallery
