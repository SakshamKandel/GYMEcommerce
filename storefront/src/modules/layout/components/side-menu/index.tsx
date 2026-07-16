"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import { Locale } from "@lib/data/locales"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SearchBar from "@modules/layout/components/search-bar"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"

// Giant Anton menu links. Keys keep the starter's `${name}-link` testid
// pattern (home-link, store-link, account-link, cart-link) so QA still passes.
const SideMenuItems: { name: string; label: string; href: string }[] = [
  { name: "home", label: "Home", href: "/" },
  { name: "store", label: "Shop all", href: "/store" },
  { name: "brands", label: "Brands", href: "/#brands" },
  { name: "account", label: "Account", href: "/account" },
  { name: "cart", label: "Cart", href: "/cart" },
]

type SideMenuCategory = {
  id: string
  name: string
  handle: string
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: SideMenuCategory[]
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  categories,
}: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  // Single region at launch — hide the country selector but keep the fetch
  // and plumbing intact (master plan §4 A checklist item 4).
  const showCountrySelect = !!regions && regions.length > 1

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center gap-2 transition-all ease-out duration-200 focus:outline-none text-paper/80 hover:text-paper"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                  <span className="hidden xsmall:block font-body text-xs font-semibold uppercase tracking-wide">
                    Menu
                  </span>
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-ink/40 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 -translate-x-4"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-4"
              >
                <PopoverPanel className="on-dark flex flex-col absolute w-full sm:w-[420px] sm:min-w-min h-[100dvh] z-[51] inset-x-0 top-0 text-sm text-paper">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-ink justify-between p-6 overflow-y-auto no-scrollbar"
                  >
                    <div className="flex flex-col gap-y-8">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-display text-xl uppercase tracking-tight text-paper/90">
                          Protein Pasal
                        </span>
                        <button
                          data-testid="close-menu-button"
                          onClick={close}
                          aria-label="Close menu"
                          className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-paper transition-colors hover:bg-paper hover:text-ink"
                        >
                          <XMark />
                        </button>
                      </div>

                      <SearchBar onSubmitted={close} />

                      <ul className="flex flex-col gap-5 items-start justify-start">
                        {SideMenuItems.map((item) => {
                          return (
                            <li key={item.name}>
                              <LocalizedClientLink
                                href={item.href}
                                className="font-display text-4xl leading-none uppercase text-paper transition-colors hover:text-red"
                                onClick={close}
                                data-testid={`${item.name}-link`}
                              >
                                {item.label}
                              </LocalizedClientLink>
                            </li>
                          )
                        })}
                      </ul>

                      {!!categories?.length && (
                        <div className="flex flex-col gap-3">
                          <p className="font-mono text-label uppercase tracking-label text-paper/50">
                            Categories
                          </p>
                          <ul className="flex flex-col gap-2.5">
                            {categories.map((category) => (
                              <li key={category.id}>
                                <LocalizedClientLink
                                  href={`/categories/${category.handle}`}
                                  className="font-body text-sm font-semibold uppercase tracking-wide text-paper/80 transition-colors hover:text-paper"
                                  onClick={close}
                                  data-testid="category-link"
                                >
                                  {category.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-y-6 pt-10">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      {showCountrySelect && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={countryToggleState.open}
                          onMouseLeave={countryToggleState.close}
                        >
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions!}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              countryToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <p className="font-mono text-label-sm uppercase tracking-label text-paper/50">
                        © {new Date().getFullYear()} Protein Pasal ·
                        Kathmandu, Nepal
                      </p>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
