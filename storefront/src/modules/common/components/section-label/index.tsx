import { clx } from "@medusajs/ui"
import React from "react"

/**
 * Mono uppercase eyebrow / kicker label (02 §5.11, contract §5.2).
 * Sits directly above a heading; uppercase is applied via CSS.
 */
type SectionLabelProps = {
  children: React.ReactNode
  tone?: "red" | "ash" | "paper"
  className?: string
}

const TONE_CLASSES: Record<NonNullable<SectionLabelProps["tone"]>, string> = {
  red: "text-red",
  ash: "text-ash",
  paper: "text-paper/80",
}

const SectionLabel = ({
  children,
  tone = "red",
  className,
}: SectionLabelProps) => {
  return (
    <p
      className={clx(
        "font-mono text-label uppercase tracking-label",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </p>
  )
}

export default SectionLabel
