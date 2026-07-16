import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-paper relative small:min-h-screen">
      <div className="h-16 bg-ink text-paper on-dark">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-x-2 flex-1 basis-0 font-mono text-label-sm uppercase tracking-label text-paper/70 hover:text-paper transition-colors"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block">
              Back to bag
            </span>
            <span className="mt-px block small:hidden">Back</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/"
            className="font-display text-2xl uppercase tracking-tight text-paper leading-none"
            data-testid="store-link"
          >
            Protein Pasal
          </LocalizedClientLink>

          <div className="flex flex-1 basis-0 items-center justify-end gap-x-2 font-mono text-label-sm uppercase tracking-label text-paper/70">
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="7" width="10" height="7" rx="0.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="square" />
            </svg>
            <span className="hidden small:block">Secure checkout</span>
          </div>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
