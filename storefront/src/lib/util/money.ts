import { isEmpty } from "./isEmpty"

/**
 * Groups an unsigned integer string in the South Asian lakh/crore style:
 * last three digits form one group, remaining digits group in twos.
 *
 *   "4500"    -> "4,500"
 *   "150000"  -> "1,50,000"
 *   "12345678"-> "1,23,45,678"
 *
 * Pure string logic — deliberately NOT `Intl`-based, because `ne-NP`/lakh
 * grouping support is inconsistent across JS engines' ICU builds (05 §2.2).
 */
export function groupLakh(digits: string): string {
  if (digits.length <= 3) {
    return digits
  }
  const last3 = digits.slice(-3)
  const rest = digits.slice(0, -3)
  const restGrouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")
  return `${restGrouped},${last3}`
}

/**
 * Formats a whole-rupee NPR amount for display (R4, R5).
 *
 * - `amount` is in Medusa major units — whole rupees, NOT paisa (R5).
 * - Lakh/crore grouping with `Rs. ` prefix, zero decimals (R4):
 *     formatNPR(4500)   -> "Rs. 4,500"
 *     formatNPR(150000) -> "Rs. 1,50,000"
 * - Every NPR price surface (card, PDP, cart, mini-cart, checkout, order,
 *   account) must go through this — never raw `Intl` output (§4.0 guardrail 7).
 */
export function formatNPR(amount: number): string {
  const rounded = Math.round(amount)
  const sign = rounded < 0 ? "-" : ""
  const digits = Math.abs(rounded).toString()
  return `${sign}Rs. ${groupLakh(digits)}`
}

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

/**
 * Starter helper, kept for non-NPR compatibility (§5.3).
 * For NPR amounts prefer `formatNPR`.
 */
export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}
