"use client"

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { formatNPR } from "@lib/util/money"
import {
  FacetOption,
  parseCsvParam,
} from "@modules/store/lib/facet-utils"

import SortProducts, { SortOptions, sortOptions } from "./sort-products"

/**
 * Facet panel (Workstream C, checklist 3). URL/searchParams-driven exactly like
 * the starter's sortBy handling — server components re-fetch on param change.
 *
 * URL contract (frozen): ?brand=&category=&minPrice=&maxPrice=&sortBy=&page=
 * Brand/category facets are server-side (`collection_id[]` / `category_id[]`);
 * price is a client-side clamp — approach (a), see lib/data/products.ts.
 */

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "Under Rs. 3,000", max: 3000 },
  { label: "Rs. 3,000 – 6,000", min: 3000, max: 6000 },
  { label: "Rs. 6,000 – 10,000", min: 6000, max: 10000 },
  { label: "Over Rs. 10,000", min: 10000 },
]

type RefinementListProps = {
  sortBy: SortOptions
  /** brand facet options (collection handle/title) — omit to lock/hide (brand pages) */
  brands?: FacetOption[]
  /** category facet options (category handle/name) — omit to lock/hide (category pages) */
  categories?: FacetOption[]
  search?: boolean
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  brands,
  categories,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedBrands = parseCsvParam(searchParams.get("brand"))
  const selectedCategories = parseCsvParam(searchParams.get("category"))
  const minPriceParam = searchParams.get("minPrice")
  const maxPriceParam = searchParams.get("maxPrice")

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [minInput, setMinInput] = useState(minPriceParam ?? "")
  const [maxInput, setMaxInput] = useState(maxPriceParam ?? "")

  useEffect(() => {
    setMinInput(minPriceParam ?? "")
  }, [minPriceParam])

  useEffect(() => {
    setMaxInput(maxPriceParam ?? "")
  }, [maxPriceParam])

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)
      mutate(params)
      // any refinement change resets pagination
      params.delete("page")
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    updateParams((params) => params.set(name, value))
  }

  const toggleCsvValue = (name: string, value: string) => {
    updateParams((params) => {
      const current = new Set(parseCsvParam(params.get(name)))

      if (current.has(value)) {
        current.delete(value)
      } else {
        current.add(value)
      }

      if (current.size) {
        params.set(name, Array.from(current).join(","))
      } else {
        params.delete(name)
      }
    })
  }

  const setPriceRange = (min?: number, max?: number) => {
    updateParams((params) => {
      if (min !== undefined) {
        params.set("minPrice", String(min))
      } else {
        params.delete("minPrice")
      }
      if (max !== undefined) {
        params.set("maxPrice", String(max))
      } else {
        params.delete("maxPrice")
      }
    })
  }

  const clearAll = () => {
    updateParams((params) => {
      params.delete("brand")
      params.delete("category")
      params.delete("minPrice")
      params.delete("maxPrice")
    })
  }

  const activePreset = PRICE_PRESETS.find(
    (preset) =>
      (preset.min !== undefined
        ? minPriceParam === String(preset.min)
        : minPriceParam === null) &&
      (preset.max !== undefined
        ? maxPriceParam === String(preset.max)
        : maxPriceParam === null)
  )

  const handlePresetClick = (preset: (typeof PRICE_PRESETS)[number]) => {
    if (activePreset === preset) {
      setPriceRange(undefined, undefined)
    } else {
      setPriceRange(preset.min, preset.max)
    }
  }

  const applyCustomPrice = (event: React.FormEvent) => {
    event.preventDefault()

    const parse = (value: string): number | undefined => {
      const parsed = Number(value)
      return value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0
        ? Math.floor(parsed)
        : undefined
    }

    let min = parse(minInput)
    let max = parse(maxInput)

    if (min !== undefined && max !== undefined && min > max) {
      ;[min, max] = [max, min]
    }

    setPriceRange(min, max)
  }

  const priceChipLabel = (() => {
    if (activePreset) {
      return activePreset.label
    }

    const min = minPriceParam !== null ? Number(minPriceParam) : undefined
    const max = maxPriceParam !== null ? Number(maxPriceParam) : undefined

    if (min !== undefined && max !== undefined) {
      return `${formatNPR(min)} – ${formatNPR(max)}`
    }
    if (max !== undefined) {
      return `Under ${formatNPR(max)}`
    }
    if (min !== undefined) {
      return `Over ${formatNPR(min)}`
    }

    return null
  })()

  type Chip = { key: string; label: string; onRemove: () => void }

  const chips: Chip[] = [
    ...selectedBrands.map((handle) => ({
      key: `brand-${handle}`,
      label: brands?.find((b) => b.value === handle)?.label ?? handle,
      onRemove: () => toggleCsvValue("brand", handle),
    })),
    ...selectedCategories.map((handle) => ({
      key: `category-${handle}`,
      label: categories?.find((c) => c.value === handle)?.label ?? handle,
      onRemove: () => toggleCsvValue("category", handle),
    })),
    ...(priceChipLabel
      ? [
          {
            key: "price",
            label: priceChipLabel,
            onRemove: () => setPriceRange(undefined, undefined),
          },
        ]
      : []),
  ]

  const facetGroups = (
    <>
      {brands && brands.length > 0 && (
        <FacetGroup title="Brand">
          {brands.map((brand) => (
            <FacetCheckbox
              key={brand.value}
              label={brand.label}
              checked={selectedBrands.includes(brand.value)}
              onToggle={() => toggleCsvValue("brand", brand.value)}
            />
          ))}
        </FacetGroup>
      )}
      {categories && categories.length > 0 && (
        <FacetGroup title="Category">
          {categories.map((category) => (
            <FacetCheckbox
              key={category.value}
              label={category.label}
              checked={selectedCategories.includes(category.value)}
              onToggle={() => toggleCsvValue("category", category.value)}
            />
          ))}
        </FacetGroup>
      )}
      <FacetGroup title="Price (NPR)">
        {PRICE_PRESETS.map((preset) => {
          const isActive = activePreset === preset

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset)}
              aria-pressed={isActive}
              className="group flex items-center gap-x-3 py-0.5 text-left"
            >
              <span
                aria-hidden="true"
                className={clx(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors",
                  isActive ? "border-ink" : "border-ink/40 group-hover:border-ink"
                )}
              >
                {isActive && <span className="h-2 w-2 rounded-full bg-red" />}
              </span>
              <span
                className={clx(
                  "font-body text-sm transition-colors",
                  isActive
                    ? "font-semibold text-ink"
                    : "text-ash group-hover:text-ink"
                )}
              >
                {preset.label}
              </span>
            </button>
          )
        })}
        <form
          onSubmit={applyCustomPrice}
          className="flex items-center gap-x-2 pt-3"
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Minimum price in rupees</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Min"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-full min-w-0 border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ash focus:border-ink"
            />
          </label>
          <span className="shrink-0 text-ash" aria-hidden="true">
            –
          </span>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Maximum price in rupees</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Max"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-full min-w-0 border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ash focus:border-ink"
            />
          </label>
          <button
            type="submit"
            className="shrink-0 border border-ink px-3 py-2 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Go
          </button>
        </form>
      </FacetGroup>
    </>
  )

  const chipsRow = chips.length > 0 && (
    <div
      className="mb-6 flex flex-wrap items-center gap-2"
      data-testid="active-filters"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex items-center gap-x-2 rounded-full border border-ink/25 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink"
        >
          {chip.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="font-mono text-label-sm uppercase tracking-label text-ash underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        Clear all
      </button>
    </div>
  )

  return (
    <div className="mb-8 w-full small:sticky small:top-24 small:mb-0 small:w-60 small:shrink-0">
      {/* Mobile: FILTERS button + compact sort select */}
      <div className="mb-6 flex items-center justify-between gap-x-3 small:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex h-11 items-center gap-x-2 rounded-full border border-ink px-5 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
          data-testid="mobile-filters-button"
        >
          Filters
          {chips.length > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 text-[11px] font-bold text-paper">
              {chips.length}
            </span>
          )}
        </button>
        <label className="flex min-w-0 items-center">
          <span className="sr-only">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setQueryParams("sortBy", e.target.value)}
            className="h-11 min-w-0 border border-line bg-paper px-3 font-body text-xs font-semibold uppercase tracking-wide text-ink focus:border-ink"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {chipsRow}

      {/* Desktop sidebar */}
      <aside className="hidden small:flex small:flex-col small:gap-y-8 small:pr-4">
        {facetGroups}
        <div className="border-t border-line pt-6">
          <SortProducts
            sortBy={sortBy}
            setQueryParams={setQueryParams}
            data-testid={dataTestId}
          />
        </div>
      </aside>

      {/* Mobile: full-height filters drawer */}
      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        className="relative z-50 small:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-ink/60" />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel
            className="flex h-full w-full max-w-sm flex-col bg-paper"
            data-testid="mobile-filters-drawer"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-mono text-label uppercase tracking-label text-ink">
                Filters
              </p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="grid h-11 w-11 place-items-center rounded-full border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <XMark />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-y-8 overflow-y-auto px-5 py-6">
              {facetGroups}
            </div>
            <div className="flex items-center gap-x-3 border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 rounded-full border border-ink py-3 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-full bg-red py-3 font-body text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-red-deep"
              >
                Show results
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

const FacetGroup = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-3 border-t border-line pt-6 first:border-t-0 first:pt-0">
    <p className="font-mono text-label uppercase tracking-label text-ash">
      {title}
    </p>
    <div className="flex flex-col gap-y-2">{children}</div>
  </div>
)

const FacetCheckbox = ({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) => (
  <label className="group flex cursor-pointer items-center gap-x-3 py-0.5">
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      className="sr-only"
    />
    <span
      aria-hidden="true"
      className={clx(
        "grid h-4 w-4 shrink-0 place-items-center border transition-colors",
        checked
          ? "border-ink bg-ink text-paper"
          : "border-ink/40 bg-transparent text-transparent group-hover:border-ink"
      )}
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M3 8.5L6.5 12L13 4.5" strokeLinecap="square" />
      </svg>
    </span>
    <span
      className={clx(
        "font-body text-sm transition-colors",
        checked ? "font-semibold text-ink" : "text-ash group-hover:text-ink"
      )}
    >
      {label}
    </span>
  </label>
)

export default RefinementList
