"use client"

import { clx } from "@medusajs/ui"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

export const sortOptions: { value: SortOptions; label: string }[] = [
  {
    value: "created_at",
    label: "Latest arrivals",
  },
  {
    value: "price_asc",
    label: "Price: low to high",
  },
  {
    value: "price_desc",
    label: "Price: high to low",
  },
]

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
  /** distinct radio-group name when rendered more than once on a page */
  name?: string
}

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
  name = "sortBy",
}: SortProductsProps) => {
  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
  }

  return (
    <div className="flex flex-col gap-y-3" data-testid={dataTestId}>
      <p className="font-mono text-label uppercase tracking-label text-ash">
        Sort by
      </p>
      <div
        className="flex flex-col gap-y-2"
        role="radiogroup"
        aria-label="Sort products"
      >
        {sortOptions.map((option) => {
          const isActive = option.value === sortBy

          return (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center gap-x-3"
              data-testid="radio-label"
              data-active={isActive}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isActive}
                onChange={() => handleChange(option.value)}
                className="sr-only"
              />
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
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default SortProducts
