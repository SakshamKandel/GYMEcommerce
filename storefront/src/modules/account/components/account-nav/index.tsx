"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

const NAV_LINKS = [
  { href: "/account", label: "Overview", testId: "overview-link" },
  { href: "/account/orders", label: "Orders", testId: "orders-link" },
  { href: "/account/addresses", label: "Addresses", testId: "addresses-link" },
  { href: "/account/profile", label: "Profile", testId: "profile-link" },
]

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div>
      {/* Mobile: horizontal top tabs */}
      <div className="small:hidden -mx-1" data-testid="mobile-account-nav">
        <div className="mb-6">
          <p className="font-mono text-label uppercase tracking-label text-red mb-2">
            Account
          </p>
          <h1 className="font-display text-3xl uppercase text-ink leading-none">
            {customer ? `Namaste, ${customer.first_name}` : "Account"}
          </h1>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-line px-1 pb-px">
          {NAV_LINKS.map((link) => (
            <AccountNavLink
              key={link.href}
              href={link.href}
              route={route!}
              data-testid={link.testId}
            >
              {link.label}
            </AccountNavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 whitespace-nowrap py-3 font-body text-sm font-semibold uppercase tracking-wide text-ash hover:text-red"
            data-testid="logout-button"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Desktop: vertical nav */}
      <div className="hidden small:block" data-testid="account-nav">
        <p className="font-mono text-label uppercase tracking-label text-ash mb-6">
          Account
        </p>
        <ul className="flex flex-col gap-y-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <AccountNavLink
                href={link.href}
                route={route!}
                data-testid={link.testId}
              >
                {link.label}
              </AccountNavLink>
            </li>
          ))}
          <li className="mt-4 pt-4 border-t border-line">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 font-body text-sm font-semibold uppercase tracking-wide text-ash hover:text-red"
              data-testid="logout-button"
            >
              <ArrowRightOnRectangle className="h-4 w-4" />
              Log out
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "block whitespace-nowrap py-2.5 font-body text-sm font-semibold uppercase tracking-wide text-ash transition-colors hover:text-ink",
        {
          "text-red hover:text-red": active,
        }
      )}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
