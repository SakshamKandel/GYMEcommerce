import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

/**
 * Pill CTA with the signature sliding arrow (02 §5.1, contract §5.2).
 * Wraps `LocalizedClientLink` when `href` is given, else renders a <button>.
 * Uppercase comes from CSS — pass children in normal casing.
 */
export type PillButtonProps = {
  href?: string
  variant: "primary" | "inverse" | "red" | "outline" | "outline-dark"
  arrow?: boolean
  children: React.ReactNode
  className?: string
  "data-testid"?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

const BASE_CLASSES =
  "inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-body text-sm font-semibold uppercase tracking-wide transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 will-change-transform group"

const VARIANT_CLASSES: Record<PillButtonProps["variant"], string> = {
  primary: "bg-ink text-paper hover:bg-coal",
  inverse: "bg-paper text-ink hover:bg-white",
  red: "bg-red text-paper hover:bg-red-deep",
  outline:
    "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
  "outline-dark":
    "bg-transparent text-paper border border-white/40 hover:bg-paper hover:text-ink",
}

const ArrowGlyph = () => (
  <span className="grid h-5 w-5 place-items-center transition-transform duration-150 ease-out group-hover:translate-x-1">
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 12L12 4M6 4h6v6" strokeLinecap="square" />
    </svg>
  </span>
)

const PillButton = ({
  href,
  variant,
  arrow = true,
  children,
  className,
  "data-testid": dataTestId,
  onClick,
  type = "button",
  disabled,
}: PillButtonProps) => {
  const classes = clx(BASE_CLASSES, VARIANT_CLASSES[variant], className)

  if (href) {
    return (
      <LocalizedClientLink
        href={href}
        className={classes}
        data-testid={dataTestId}
        onClick={onClick}
      >
        {children}
        {arrow && <ArrowGlyph />}
      </LocalizedClientLink>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      data-testid={dataTestId}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {arrow && <ArrowGlyph />}
    </button>
  )
}

export default PillButton
