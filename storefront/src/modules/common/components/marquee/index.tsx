import { clx } from "@medusajs/ui"
import React from "react"

/**
 * Infinite horizontal ticker strip (02 §5.4, contract §5.2).
 *
 * Structure: an overflow-hidden band with a flex track holding two identical
 * rows; the track animates -50% for a seamless loop. The duplicate row is
 * `aria-hidden`. Pauses on hover/focus; fully static under
 * `prefers-reduced-motion` (handled in globals.css).
 */
type MarqueeProps = {
  items: string[]
  variant?: "red" | "black" | "outline"
  speed?: "normal" | "fast"
  separator?: string
  className?: string
}

const BAND_CLASSES: Record<NonNullable<MarqueeProps["variant"]>, string> = {
  red: "bg-red text-paper",
  black: "bg-ink text-paper",
  outline: "bg-paper text-ink border-y border-ink/15",
}

const SEPARATOR_CLASSES: Record<NonNullable<MarqueeProps["variant"]>, string> =
  {
    red: "text-paper/80",
    black: "text-red",
    outline: "text-red",
  }

// Edge-fade overlays dissolve the text into the band colour at both ends, so
// items never hard-cut at the viewport edge. Gradients use palette tokens (the
// band's own colour) — never a hardcoded hex.
const EDGE_FROM: Record<NonNullable<MarqueeProps["variant"]>, string> = {
  red: "from-red",
  black: "from-ink",
  outline: "from-paper",
}

const Row = ({
  items,
  separator,
  separatorClass,
  hidden,
}: {
  items: string[]
  separator: string
  separatorClass: string
  hidden?: boolean
}) => (
  <ul
    aria-hidden={hidden || undefined}
    className="flex shrink-0 items-center gap-10 pr-10 font-display text-2xl uppercase tracking-tight"
  >
    {items.map((item, i) => (
      <React.Fragment key={i}>
        <li className="whitespace-nowrap">{item}</li>
        <li aria-hidden="true" className={separatorClass}>
          {separator}
        </li>
      </React.Fragment>
    ))}
  </ul>
)

const Marquee = ({
  items,
  variant = "red",
  speed = "normal",
  separator = "✦",
  className,
}: MarqueeProps) => {
  if (!items.length) {
    return null
  }

  const separatorClass = SEPARATOR_CLASSES[variant]

  return (
    <div
      className={clx(
        "relative overflow-hidden py-3 select-none",
        BAND_CLASSES[variant],
        className
      )}
    >
      <div
        className={clx(
          "flex w-max",
          speed === "fast" ? "animate-marquee-fast" : "animate-marquee",
          "hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
        )}
      >
        <Row items={items} separator={separator} separatorClass={separatorClass} />
        <Row
          items={items}
          separator={separator}
          separatorClass={separatorClass}
          hidden
        />
      </div>
      <div
        aria-hidden="true"
        className={clx(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r to-transparent md:w-24",
          EDGE_FROM[variant]
        )}
      />
      <div
        aria-hidden="true"
        className={clx(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent md:w-24",
          EDGE_FROM[variant]
        )}
      />
    </div>
  )
}

export default Marquee
