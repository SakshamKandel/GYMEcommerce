"use client"

import { convertToLocale, formatNPR } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_total?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_total,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  // NPR renders through formatNPR (R4/R5 — lakh grouping, "Rs. 1,50,000");
  // any other currency falls back to the starter's Intl formatter (§5.3).
  const money = (amount: number) =>
    currency_code?.toLowerCase() === "npr"
      ? formatNPR(amount)
      : convertToLocale({ amount, currency_code })

  const grandTotal = total ?? 0
  const vat = tax_total ?? 0
  // Show the tax-INCLUSIVE shipping so the Shipping line matches the Rs. figure
  // the customer selected at the delivery step (05 §4.2 — shipping is VAT-incl).
  const shipping = shipping_total ?? shipping_subtotal ?? 0
  const discount = discount_subtotal ?? 0
  const hasShipping = shipping_total != null || shipping_subtotal != null
    ? (shipping_total ?? shipping_subtotal ?? 0) > 0
    : false

  // Tax-inclusive receipt breakdown (05 §4.1, gated on real tax data — R1
  // tripwire fallback seeds no rate, so tax_total is 0 → we degrade to a
  // simple subtotal + "Includes 13% VAT" micro-label instead of a VAT line).
  const hasTax = vat > 0
  // Derive the ex-VAT subtotal so the visible lines always sum to the total:
  // subtotalExclVat − discount + VAT + shipping = total.
  const subtotalExclVat = grandTotal - vat - shipping + discount

  const rowLabel = "text-ash"
  const rowValue = "text-ink font-medium tabular-nums"

  return (
    <div className="font-body">
      <div className="flex flex-col gap-y-2.5 text-body-sm">
        {hasTax ? (
          <div className="flex items-center justify-between">
            <span className={rowLabel}>Subtotal (excl. VAT)</span>
            <span
              className={rowValue}
              data-testid="cart-subtotal"
              data-value={subtotalExclVat}
            >
              {money(subtotalExclVat)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className={rowLabel}>Subtotal</span>
            <span
              className={rowValue}
              data-testid="cart-subtotal"
              data-value={item_subtotal ?? 0}
            >
              {money(item_subtotal ?? 0)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex items-center justify-between">
            <span className={rowLabel}>Discount</span>
            <span
              className="text-red font-medium tabular-nums"
              data-testid="cart-discount"
              data-value={discount}
            >
              − {money(discount)}
            </span>
          </div>
        )}

        {hasTax && (
          <div className="flex items-center justify-between">
            <span className={rowLabel}>VAT (13%)</span>
            <span
              className={rowValue}
              data-testid="cart-taxes"
              data-value={vat}
            >
              {money(vat)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={rowLabel}>Shipping</span>
          <span
            className={hasShipping ? rowValue : "text-ash"}
            data-testid="cart-shipping"
            data-value={shipping}
          >
            {hasShipping ? money(shipping) : "Calculated at checkout"}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-line my-4" />

      <div className="flex items-center justify-between">
        <span className="font-body text-sm font-semibold uppercase tracking-wide text-ink">
          Total
        </span>
        <span
          className="font-body text-h4 font-bold text-ink tabular-nums"
          data-testid="cart-total"
          data-value={grandTotal}
        >
          {money(grandTotal)}
        </span>
      </div>

      <p className="mt-2 font-mono text-label-sm uppercase tracking-label text-ash">
        Includes 13% VAT
      </p>
    </div>
  )
}

export default CartTotals
