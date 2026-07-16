import { clx } from "@medusajs/ui"
import React from "react"

/**
 * Row of icon + label trust signals (02 §5.11, contract §5.2).
 * Default badges: COD · 100% Authentic · Fast Nationwide Delivery · Easy
 * Returns. Reused on home, PDP, cart, order confirmation, footer-top strip.
 * Icons are thin-line, square-capped, ink-colored (02 §10) — never a second
 * accent color.
 */
export type TrustBadgeItem = {
  icon: React.ReactNode
  label: string
}

type TrustBadgeRowProps = {
  compact?: boolean
  items?: TrustBadgeItem[]
  className?: string
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  "aria-hidden": true,
}

const CashIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <rect x="2.75" y="6.75" width="18.5" height="10.5" />
    <circle cx="12" cy="12" r="2.75" />
    <path d="M5.75 9.75v.01M18.25 14.25v.01" />
  </svg>
)

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M12 3l7.25 2.5v5.25c0 4.5-3 8.25-7.25 9.75-4.25-1.5-7.25-5.25-7.25-9.75V5.5L12 3z" />
    <path d="M9 12l2 2 4-4.5" />
  </svg>
)

const TruckIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M2.75 6.75h11.5v9.5H2.75zM14.25 9.75h3.75l3.25 3.25v3.25h-7z" />
    <circle cx="6.5" cy="17.5" r="1.75" />
    <circle cx="17" cy="17.5" r="1.75" />
  </svg>
)

const ReturnIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className}>
    <path d="M8.5 5.5L4.75 9.25 8.5 13" />
    <path d="M4.75 9.25H15a4.25 4.25 0 010 8.5H7.5" />
  </svg>
)

const DEFAULT_ITEMS: TrustBadgeItem[] = [
  { icon: <CashIcon className="h-4 w-4" />, label: "Cash on Delivery" },
  { icon: <ShieldCheckIcon className="h-4 w-4" />, label: "100% Authentic" },
  { icon: <TruckIcon className="h-4 w-4" />, label: "Fast Nationwide Delivery" },
  { icon: <ReturnIcon className="h-4 w-4" />, label: "Easy Returns" },
]

const TrustBadgeRow = ({ compact, items, className }: TrustBadgeRowProps) => {
  const badges = items?.length ? items : DEFAULT_ITEMS

  return (
    <ul
      className={clx(
        "flex flex-wrap items-center",
        compact ? "gap-2" : "gap-3",
        className
      )}
    >
      {badges.map((badge, i) => (
        <li
          key={i}
          className={clx(
            "inline-flex items-center gap-2 border border-ink/20 font-mono uppercase tracking-label text-ash",
            compact ? "px-2.5 py-1 text-[0.625rem]" : "px-3 py-1.5 text-label-sm"
          )}
        >
          <span className="text-ink">{badge.icon}</span>
          <span>{badge.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default TrustBadgeRow
