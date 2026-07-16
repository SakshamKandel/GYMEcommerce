import LocalizedClientLink from "@modules/common/components/localized-client-link"

// TODO(business-contact): replace with the real business WhatsApp number via
// NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local.
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXXX"

const FOOTER_LINKS = [
  { label: "All products", href: "/store" },
  { label: "Track order", href: "/track-order" },
  { label: "Authenticity", href: "/authenticity" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "My account", href: "/account" },
]

export default async function Footer() {
  return (
    <footer className="on-dark w-full bg-ink text-paper">
      <div className="shell flex flex-col gap-8 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-3 font-display text-3xl uppercase leading-none text-paper hover:text-paper"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt=""
                className="h-14 w-auto shrink-0"
                draggable={false}
              />
              <span>Protein Pasal</span>
            </LocalizedClientLink>
            <p className="mt-3 max-w-sm font-body text-body-sm text-paper/70">
              Nepal&apos;s multi-brand supplement store. 100% authentic, Cash
              on Delivery nationwide.
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
            aria-label="Footer"
          >
            {FOOTER_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.label}
                href={link.href}
                className="font-body text-sm text-paper/70 underline-offset-4 hover:text-paper hover:underline"
              >
                {link.label}
              </LocalizedClientLink>
            ))}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="font-body text-sm text-paper/70 underline-offset-4 hover:text-paper hover:underline"
            >
              WhatsApp support
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-label-sm uppercase tracking-label text-paper/50">
            © {new Date().getFullYear()} Protein Pasal · Kathmandu, Nepal
          </p>
          {/*
            TODO(business-legal): PAN/VAT No. row — render only once the
            business supplies the real registered number (05 §6). Never ship an
            empty or fabricated slot.
          */}
          <p className="font-mono text-label-sm uppercase tracking-label text-paper/50">
            Inside Valley: 1–2 days · Outside: 3–5 days · We accept: Cash on
            Delivery
          </p>
        </div>

        <p className="pt-4 text-center font-body text-xs text-paper/40">
          powered by{" "}
          <a
            href="https://www.kurlybrains.com"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-paper/70 hover:underline"
          >
            kurlybrains
          </a>
        </p>
      </div>
    </footer>
  )
}
