"use client"

import { clx } from "@medusajs/ui"
import React from "react"

type QuantityStepperProps = {
  quantity: number
  onChange: (quantity: number) => void
  max: number
  disabled?: boolean
}

const stepButtonClass =
  "grid h-11 w-11 place-items-center rounded-full text-ink transition-colors duration-150 ease-out hover:bg-fog disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"

/**
 * Quantity stepper — rounded-pill per radius policy (design 02 §2.1).
 * Min 1, max = min(10, available stock) enforced by the parent.
 */
const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onChange,
  max,
  disabled,
}) => {
  return (
    <div
      role="group"
      aria-label="Quantity"
      data-testid="quantity-stepper"
      className={clx(
        "inline-flex items-center rounded-full border border-ink/25 bg-paper",
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
        data-testid="quantity-decrease"
        className={stepButtonClass}
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M3 8h10" strokeLinecap="square" />
        </svg>
      </button>

      <span
        aria-live="polite"
        data-testid="quantity-value"
        className="min-w-8 text-center font-mono text-sm font-bold text-ink"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
        data-testid="quantity-increase"
        className={stepButtonClass}
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M3 8h10M8 3v10" strokeLinecap="square" />
        </svg>
      </button>
    </div>
  )
}

export default QuantityStepper
