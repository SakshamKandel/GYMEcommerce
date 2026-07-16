import React from "react"

import PillButton from "@modules/common/components/pill-button"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXXX" // TODO(business-contact)

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 bg-paper py-10 md:py-16" data-testid="account-page">
      <div className="content-container max-w-5xl mx-auto flex flex-col">
        <div className="grid grid-cols-1 small:grid-cols-[220px_1fr] gap-10 small:gap-16">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
        {customer && (
          <div className="mt-16 border-t border-line pt-10 flex flex-col small:flex-row items-start small:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-label uppercase tracking-label text-red mb-2">
                Need help?
              </p>
              <h3 className="font-display text-2xl uppercase text-ink">
                We&apos;re a message away
              </h3>
              <p className="font-body text-body-sm text-ash mt-2 max-w-sm">
                Questions about an order, delivery zones, or authenticity?
                Reach us on WhatsApp/Viber or by phone — we reply fast.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-ink px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-ink transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-ink hover:text-paper"
              >
                WhatsApp us
              </a>
              <PillButton href="/authenticity" variant="primary">
                Authenticity promise
              </PillButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountLayout
