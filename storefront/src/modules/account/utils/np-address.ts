/**
 * Nepal address constants shared across account address forms
 * (add-address, edit-address-modal, profile-billing-address).
 *
 * NEPAL ADDRESS FIELD MAPPING (per master plan §2 binding — the same mapping
 * Workstream E documents in checkout/components/shipping-address; mirrored
 * here for account-owned address forms since Medusa's address schema is
 * identical in both places):
 *   first_name + last_name = Full name
 *   phone                  = Phone (required, primary — couriers call to confirm COD)
 *   province                = one of Nepal's 7 provinces (dropdown, below)
 *   city                    = Municipality/City — District is captured inside
 *                             this same field as free text (e.g.
 *                             "Kathmandu Metropolitan City, Kathmandu"),
 *                             since Medusa's address schema has no separate
 *                             district column.
 *   address_2               = Ward No. + Area/Tole
 *   address_1               = Street/Tole + landmark (detailed local description)
 *   postal_code             = optional
 */

export const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
] as const

// Soft validation only — 10 digits starting 97 or 98 (Nepali mobile prefixes).
export const NEPAL_PHONE_PATTERN = "9[78][0-9]{8}"
export const NEPAL_PHONE_TITLE =
  "Enter a 10-digit Nepali mobile number starting with 97 or 98."
