import React from "react"

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXXX" // TODO(business-contact)

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  "aria-hidden": true,
}

const CashIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <rect x="2.75" y="6.75" width="18.5" height="10.5" />
    <circle cx="12" cy="12" r="2.75" />
    <path d="M5.75 9.75v.01M18.25 14.25v.01" />
  </svg>
)

const TruckIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <path d="M2.75 6.75h11.5v9.5H2.75zM14.25 9.75h3.75l3.25 3.25v3.25h-7z" />
    <circle cx="6.5" cy="17.5" r="1.75" />
    <circle cx="17" cy="17.5" r="1.75" />
  </svg>
)

const ShieldCheckIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <path d="M12 3l7.25 2.5v5.25c0 4.5-3 8.25-7.25 9.75-4.25-1.5-7.25-5.25-7.25-9.75V5.5L12 3z" />
    <path d="M9 12l2 2 4-4.5" />
  </svg>
)

const ChatIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <path d="M3.75 4.75h16.5v11.5H8.5L4.75 20v-3.75h-1z" />
    <path d="M7.75 9h8.5M7.75 12h5.5" />
  </svg>
)

/**
 * Static under-CTA block of the buy box: COD callout, delivery ETA rows
 * (R8 verbatim strings), authenticity badge, WhatsApp ask-a-question link.
 * Server-rendered outside the actions Suspense boundary so it paints
 * immediately while pricing streams in.
 */
const BuyBoxPerks = ({ productTitle }: { productTitle: string }) => {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Protein Pasal! I have a question about ${productTitle}.`
  )}`

  return (
    <div
      className="flex flex-col divide-y divide-line border-y border-line"
      data-testid="product-delivery-strip"
    >
      {/* COD callout */}
      <div className="flex items-center gap-3.5 py-4">
        <span className="text-ink">
          <CashIcon />
        </span>
        <div className="flex flex-col gap-y-0.5">
          <p className="font-body text-body-sm font-semibold text-ink">
            Cash on Delivery
          </p>
          <p className="font-mono text-label-sm uppercase tracking-label text-ash">
            Free delivery over Rs. 10,000
          </p>
        </div>
      </div>

      {/* Delivery ETA rows — R8 single-source strings, verbatim. */}
      <dl className="flex flex-col gap-y-2.5 py-4">
        <div className="flex items-center gap-3.5">
          <span className="text-ink">
            <TruckIcon />
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <dt className="font-mono text-label-sm uppercase tracking-label text-ash">
              Inside Kathmandu Valley
            </dt>
            <dd className="font-body text-body-sm font-semibold text-ink">
              Delivered in 1–2 days
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <span aria-hidden="true" className="h-5 w-5 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <dt className="font-mono text-label-sm uppercase tracking-label text-ash">
              Outside Valley
            </dt>
            <dd className="font-body text-body-sm font-semibold text-ink">
              Delivered in 3–5 days
            </dd>
          </div>
        </div>
      </dl>

      {/* Persistent PDP trust badge — copy verbatim from master plan §3 / 05 §5.2. */}
      <div className="flex items-center gap-3.5 py-4">
        <span className="text-ink">
          <ShieldCheckIcon />
        </span>
        <p className="font-mono text-label-sm uppercase tracking-label text-ash">
          100% Authentic — Sourced from Authorized Distributors
        </p>
      </div>

      {/* WhatsApp ask-a-question */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="product-whatsapp-link"
        className="group flex items-center justify-between gap-3.5 py-4 transition-colors hover:text-red"
      >
        <span className="flex items-center gap-3.5">
          <span className="text-ink transition-colors group-hover:text-red">
            <ChatIcon />
          </span>
          <span className="font-mono text-label-sm uppercase tracking-label text-ink transition-colors group-hover:text-red">
            Questions? Ask us on WhatsApp
          </span>
        </span>
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4 text-ink transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:text-red"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
        </svg>
      </a>
    </div>
  )
}

export default BuyBoxPerks
