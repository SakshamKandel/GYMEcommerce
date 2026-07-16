import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"

/**
 * NEPAL ADDRESS ↔ MEDUSA FIELD MAPPING (master-plan §2 binding + 05 §3.1)
 * ---------------------------------------------------------------------------
 * Nepali addresses are landmark-based, not structured street addresses, and
 * the starter's `setAddresses` server action (src/lib/data/cart.ts, NOT owned
 * by this workstream) hardcodes `address_2: ""` — so address_2 cannot persist
 * anything. We therefore map onto the fields the action actually reads:
 *
 *   first_name / last_name → Full name
 *   phone                  → Mobile (required, first contact field, 9[78]xxxxxxxx)
 *   email                  → Email (required; guest checkout stays on)
 *   province               → Province (dropdown of Nepal's 7 provinces)
 *   city                   → District  (the primary COD courier routing unit;
 *                            binding allowed "District captured within address_2
 *                            or city" — city is chosen since address_2 is dead)
 *   address_1              → Municipality/City + Ward No. + Tole/Street + Landmark
 *                            (one rich, landmark-based delivery line)
 *   postal_code            → Postal code (optional — never blocks checkout)
 *   company                → Company (optional; kept for business/VAT buyers)
 *
 * Field ORDER on screen follows 05 §3.1: Name → Phone → Email → Province →
 * District → Municipality/Ward/Tole → Postal.
 */

const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
]

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  // Nepal is the only region → pre-select its single country (NP).
  const defaultCountry =
    cart?.shipping_address?.country_code ||
    cart?.region?.countries?.[0]?.iso_2 ||
    ""

  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": defaultCountry,
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const sectionLabel =
    "font-mono text-label uppercase tracking-label text-red mb-4"

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}

      {/* CONTACT — phone first & required (COD couriers call to confirm) */}
      <p className={sectionLabel}>Contact</p>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Phone (mobile)"
          name="shipping_address.phone"
          autoComplete="tel"
          type="tel"
          inputMode="numeric"
          pattern="9[7-8][0-9]{8}"
          title="Enter a valid Nepali mobile number, e.g. 98XXXXXXXX"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="shipping-phone-input"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
      </div>
      <p className="mt-2 font-body text-body-sm text-ash">
        We&apos;ll call this number to confirm your Cash-on-Delivery order.
      </p>

      {/* DELIVERY ADDRESS — Nepali norms: Province → District → local line */}
      <p className={`${sectionLabel} mt-8`}>Delivery address</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col w-full">
          <NativeSelect
            name="shipping_address.province"
            placeholder="Province"
            value={formData["shipping_address.province"]}
            onChange={handleChange}
            required
            data-testid="shipping-province-input"
          >
            {NEPAL_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Input
          label="District"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <div className="col-span-2">
          <Input
            label="Municipality / City, Ward No., Tole & landmark"
            name="shipping_address.address_1"
            autoComplete="street-address"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            required
            data-testid="shipping-address-input"
          />
        </div>
        <Input
          label="Postal code (optional)"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          data-testid="shipping-postal-code-input"
        />
        <Input
          label="Company (optional)"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        <div className="col-span-2">
          <CountrySelect
            name="shipping_address.country_code"
            autoComplete="country"
            region={cart?.region}
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-country-select"
          />
        </div>
      </div>

      <div className="my-8">
        <Checkbox
          label="Billing address same as delivery address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
    </>
  )
}

export default ShippingAddress
