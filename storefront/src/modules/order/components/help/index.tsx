import LocalizedClientLink from "@modules/common/components/localized-client-link"

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXXX" // TODO(business-contact)

const Help = () => {
  return (
    <div className="border-t border-line pt-6">
      <p className="font-mono text-label uppercase tracking-label text-red mb-2">
        Need help?
      </p>
      <h3 className="font-body text-h4 font-semibold text-ink mb-3">
        We&apos;re here for you
      </h3>
      <ul className="flex flex-col gap-y-2 font-body text-body-sm">
        <li>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline underline-offset-4 hover:text-red"
          >
            Chat with us on WhatsApp
          </a>
        </li>
        <li>
          <LocalizedClientLink
            href="/returns"
            className="text-ink underline underline-offset-4 hover:text-red"
          >
            Returns &amp; exchanges
          </LocalizedClientLink>
        </li>
        <li>
          <LocalizedClientLink
            href="/authenticity"
            className="text-ink underline underline-offset-4 hover:text-red"
          >
            Authenticity promise
          </LocalizedClientLink>
        </li>
      </ul>
    </div>
  )
}

export default Help
