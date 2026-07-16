"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

export type OptionValueMeta = {
  /** Combo is unavailable: inventory-managed, non-backorder, qty <= 0 (or no
   *  variant exists for this value with the other selected options). */
  unavailable: boolean
  /** Formatted price for the variant this value resolves to (formatNPR). */
  priceLabel?: string
}

type OptionTilesProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  disabled: boolean
  getValueMeta: (optionId: string, value: string) => OptionValueMeta
  "data-testid"?: string
}

/**
 * Rich variant selector. Two renderings driven by the data:
 * - values whose resolved prices DIFFER (e.g. Size) → rectangular tiles that
 *   show each value's own price;
 * - values with identical pricing (e.g. Flavor) → pill chips (design 02 §5.11).
 * Unavailable combos stay clickable (selection can never dead-end) but are
 * dimmed, struck through, and carry aria-disabled + an sr-only note.
 */
const OptionTiles: React.FC<OptionTilesProps> = ({
  option,
  current,
  updateOption,
  disabled,
  getValueMeta,
  "data-testid": dataTestId,
}) => {
  const values = (option.values ?? []).map((v) => v.value)
  const metas = values.map((value) => getValueMeta(option.id, value))

  const distinctPrices = new Set(
    metas.map((m) => m.priceLabel).filter(Boolean) as string[]
  )
  const showPrices = distinctPrices.size > 1

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-mono text-label uppercase tracking-label text-ash">
          {option.title}
        </span>
        {current && (
          <span
            key={current}
            className="animate-fade-in-top font-body text-xs font-semibold text-ink motion-reduce:animate-none"
          >
            {current}
          </span>
        )}
      </div>

      <div
        className={clx(
          showPrices
            ? "grid grid-cols-2 gap-2 xsmall:grid-cols-3 small:grid-cols-2"
            : "flex flex-wrap gap-2"
        )}
        data-testid={dataTestId}
      >
        {values.map((value, index) => {
          const meta = metas[index]
          const isSelected = value === current

          if (showPrices) {
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateOption(option.id, value)}
                disabled={disabled}
                aria-disabled={meta.unavailable || undefined}
                aria-pressed={isSelected}
                data-testid="option-button"
                className={clx(
                  "flex flex-col items-start gap-1 border px-4 py-3 text-left transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
                  isSelected
                    ? "border-ink bg-ink text-paper"
                    : meta.unavailable
                    ? "border-line bg-paper text-ash opacity-60"
                    : "border-line bg-paper text-ink hover:border-ink"
                )}
              >
                <span
                  className={clx(
                    "font-body text-xs font-semibold uppercase tracking-wide",
                    meta.unavailable && !isSelected && "line-through"
                  )}
                >
                  {value}
                </span>
                <span
                  className={clx(
                    "font-mono text-label-sm tracking-wider",
                    isSelected ? "text-paper/70" : "text-ash"
                  )}
                >
                  {meta.unavailable ? "Unavailable" : meta.priceLabel ?? "—"}
                </span>
                {meta.unavailable && (
                  <span className="sr-only">
                    This combination is currently unavailable
                  </span>
                )}
              </button>
            )
          }

          return (
            <button
              key={value}
              type="button"
              onClick={() => updateOption(option.id, value)}
              disabled={disabled}
              aria-disabled={meta.unavailable || undefined}
              aria-pressed={isSelected}
              data-testid="option-button"
              className={clx(
                "rounded-full border px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
                isSelected
                  ? "border-ink bg-ink text-paper"
                  : meta.unavailable
                  ? "border-line bg-paper text-ash line-through opacity-60"
                  : "border-ink/25 bg-paper text-ink hover:border-ink"
              )}
            >
              {value}
              {meta.unavailable && (
                <span className="sr-only">
                  {" "}
                  — this combination is currently unavailable
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionTiles
