import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { getLocale } from "@lib/data/locale-actions"
import { listLocales } from "@lib/data/locales"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SearchBar from "@modules/layout/components/search-bar"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  // Regions/locales fetches are KEPT (single-region for launch, so the
  // country selector is hidden — master plan §4 A checklist item 4).
  const [regions, locales, currentLocale, categories] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
  ])

  const topLevelCategories = (categories ?? []).filter(
    (c) => !c.parent_category
  )

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="on-dark relative h-16 mx-auto duration-200 bg-ink text-paper border-b border-white/10">
        <nav className="content-container flex items-center justify-between w-full h-full">
          {/* Left: hamburger + primary links */}
          <div className="flex-1 basis-0 h-full flex items-center gap-x-5">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                categories={topLevelCategories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  handle: c.handle,
                }))}
              />
            </div>
            <div className="hidden small:flex items-center gap-x-5 h-full">
              <LocalizedClientLink
                href="/store"
                className="font-body text-xs font-semibold uppercase tracking-wide text-paper/80 hover:text-paper transition-colors"
                data-testid="nav-shop-link"
              >
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/#brands"
                className="font-body text-xs font-semibold uppercase tracking-wide text-paper/80 hover:text-paper transition-colors"
                data-testid="nav-brands-link"
              >
                Brands
              </LocalizedClientLink>
            </div>
          </div>

          {/* Center: Anton wordmark */}
          <div className="flex items-center h-full shrink-0">
            <LocalizedClientLink
              href="/"
              className="font-display text-2xl uppercase tracking-tight leading-none text-paper hover:text-paper transition-colors"
              data-testid="nav-store-link"
            >
              Protein Pasal
            </LocalizedClientLink>
          </div>

          {/* Right: search + account + cart */}
          <div className="flex items-center gap-x-5 h-full flex-1 basis-0 justify-end">
            <SearchBar className="hidden medium:flex w-56" />
            <div className="hidden small:flex items-center gap-x-5 h-full">
              <LocalizedClientLink
                className="font-body text-xs font-semibold uppercase tracking-wide text-paper/80 hover:text-paper transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wide text-paper/80 hover:text-paper transition-colors"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <span>Cart</span>
                  <span className="min-w-5 h-5 rounded-full bg-red text-paper text-[11px] font-bold grid place-items-center px-1">
                    0
                  </span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
