import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import TrustBadgeRow from "@modules/common/components/trust-badges"

// TODO(business-contact): replace with the real business WhatsApp number via
// NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local.
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXXX"

const footerLinkClasses =
  "font-body text-sm text-paper/70 hover:text-paper hover:underline underline-offset-4"

const columnLabelClasses =
  "font-mono text-label uppercase tracking-label text-paper/50"

// Delivery strings come verbatim from master plan §3 (R8) — do not paraphrase.
const SHOP_LINKS = [
  { label: "All products", href: "/store" },
  { label: "New arrivals", href: "/store?sortBy=created_at" },
  { label: "Authenticity promise", href: "/authenticity" },
]

const HELP_LINKS = [
  { label: "Shipping & delivery", href: "/shipping" },
  { label: "Returns & refunds", href: "/returns" },
  { label: "Authenticity", href: "/authenticity" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
]

const ACCOUNT_LINKS = [
  { label: "Log in / register", href: "/account" },
  { label: "My orders", href: "/account/orders" },
  { label: "Cart", href: "/cart" },
]

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "id,handle,title",
  })
  const productCategories = await listCategories()

  const topLevelCategories = (productCategories ?? []).filter(
    (c) => !c.parent_category
  )

  const marqueeCopies = Array.from({ length: 8 })

  return (
    <footer className="w-full">
      {/* Trust-badge top strip (03 §12.1) */}
      <div className="bg-fog border-t border-line">
        <div className="shell flex justify-center py-8">
          <TrustBadgeRow className="justify-center" />
        </div>
      </div>

      <div className="on-dark bg-ink text-paper">
        {/* Link columns */}
        <div className="shell grid gap-10 py-16 md:py-20 md:grid-cols-3 medium:grid-cols-[1.6fr_repeat(5,1fr)]">
          <div>
            <LocalizedClientLink
              href="/"
              className="font-display text-3xl uppercase leading-none text-paper hover:text-paper"
            >
              Protein Pasal
            </LocalizedClientLink>
            <p className="mt-4 max-w-xs font-body text-body-sm text-paper/70">
              Nepal&apos;s multi-brand supplement store. Authentic sports
              nutrition from the world&apos;s most trusted brands — sourced
              from authorized distributors and delivered across Nepal, Cash on
              Delivery.
            </p>
            <p className="mt-4 font-mono text-label-sm uppercase tracking-label text-paper/50">
              Inside Kathmandu Valley: 1–2 days · Outside Valley: 3–5 days
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="Shop">
            <p className={columnLabelClasses}>Shop</p>
            {SHOP_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.label}
                href={link.href}
                className={footerLinkClasses}
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </nav>

          {collections && collections.length > 0 && (
            <nav className="flex flex-col gap-3" aria-label="Brands">
              <p className={columnLabelClasses}>Brands</p>
              {collections.slice(0, 8).map((c) => (
                <LocalizedClientLink
                  key={c.id}
                  href={`/collections/${c.handle}`}
                  className={footerLinkClasses}
                >
                  {c.title}
                </LocalizedClientLink>
              ))}
              <LocalizedClientLink href="/store" className={footerLinkClasses}>
                All brands
              </LocalizedClientLink>
            </nav>
          )}

          {topLevelCategories.length > 0 && (
            <nav className="flex flex-col gap-3" aria-label="Categories">
              <p className={columnLabelClasses}>Categories</p>
              <ul
                className="flex flex-col gap-3"
                data-testid="footer-categories"
              >
                {topLevelCategories.slice(0, 7).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      className={footerLinkClasses}
                      href={`/categories/${c.handle}`}
                      data-testid="category-link"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav className="flex flex-col gap-3" aria-label="Help">
            <p className={columnLabelClasses}>Help</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className={footerLinkClasses}
            >
              WhatsApp support
            </a>
            {HELP_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.label}
                href={link.href}
                className={footerLinkClasses}
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </nav>

          <nav className="flex flex-col gap-3" aria-label="Account">
            <p className={columnLabelClasses}>Account</p>
            {ACCOUNT_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.label}
                href={link.href}
                className={footerLinkClasses}
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        {/* Contact / payment row */}
        <div className="shell flex flex-col gap-4 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-label-sm uppercase tracking-label text-paper/70 hover:text-paper"
            >
              WhatsApp / Viber
            </a>
            {/* TODO(business-contact): swap placeholder social profiles for the
                real accounts once the business creates them. */}
            <a
              href="https://instagram.com/proteinpasal"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-label-sm uppercase tracking-label text-paper/70 hover:text-paper"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com/proteinpasal"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-label-sm uppercase tracking-label text-paper/70 hover:text-paper"
            >
              Facebook
            </a>
            <a
              href="https://tiktok.com/@proteinpasal"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-label-sm uppercase tracking-label text-paper/70 hover:text-paper"
            >
              TikTok
            </a>
          </div>
          <p className="font-mono text-label-sm uppercase tracking-label text-paper/50">
            We accept: Cash on Delivery
          </p>
        </div>

        {/* Legal row */}
        <div className="shell flex flex-col gap-3 border-t border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-label-sm uppercase tracking-label text-paper/50">
            © {new Date().getFullYear()} Protein Pasal · Kathmandu, Nepal
          </p>
          {/*
            TODO(business-legal): PAN/VAT No. row — render only once the
            business supplies the real registered number (05 §6). Never ship an
            empty or fabricated slot:
            <p className="font-mono text-label-sm uppercase tracking-label text-paper/50">
              PAN/VAT No.: XXXXXXXXX
            </p>
          */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <LocalizedClientLink
              href="/privacy"
              className="font-mono text-label-sm uppercase tracking-label text-paper/50 hover:text-paper"
            >
              Privacy
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/terms"
              className="font-mono text-label-sm uppercase tracking-label text-paper/50 hover:text-paper"
            >
              Terms
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/returns"
              className="font-mono text-label-sm uppercase tracking-label text-paper/50 hover:text-paper"
            >
              Returns
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/shipping"
              className="font-mono text-label-sm uppercase tracking-label text-paper/50 hover:text-paper"
            >
              Shipping
            </LocalizedClientLink>
          </div>
        </div>

        {/* Giant repeating brand marquee (02 §5.10) — first copy real, rest aria-hidden */}
        <div className="overflow-hidden border-t border-white/10 py-6 select-none">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {marqueeCopies.map((_, i) => (
              <span
                key={i}
                aria-hidden={i > 0 || undefined}
                className={`shrink-0 whitespace-nowrap pr-8 font-display text-[clamp(3rem,12vw,10rem)] uppercase leading-none ${
                  i % 2 === 0 ? "text-paper/90" : "text-stroke"
                }`}
              >
                Protein Pasal ✦&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
