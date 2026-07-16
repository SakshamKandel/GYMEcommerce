import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import React, { useState } from "react"
import CountrySelect from "../country-select"

// Same Nepal ↔ Medusa field mapping as shipping-address (see that file's
// header comment): city = District, address_1 = Municipality/Ward/Tole/landmark,
// province = Province dropdown. address_2 is dropped by setAddresses.
const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
]

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code":
      cart?.billing_address?.country_code ||
      cart?.region?.countries?.[0]?.iso_2 ||
      "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

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

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="First name"
        name="billing_address.first_name"
        autoComplete="given-name"
        value={formData["billing_address.first_name"]}
        onChange={handleChange}
        required
        data-testid="billing-first-name-input"
      />
      <Input
        label="Last name"
        name="billing_address.last_name"
        autoComplete="family-name"
        value={formData["billing_address.last_name"]}
        onChange={handleChange}
        required
        data-testid="billing-last-name-input"
      />
      <Input
        label="Phone (mobile)"
        name="billing_address.phone"
        autoComplete="tel"
        type="tel"
        inputMode="numeric"
        pattern="9[7-8][0-9]{8}"
        title="Enter a valid Nepali mobile number, e.g. 98XXXXXXXX"
        value={formData["billing_address.phone"]}
        onChange={handleChange}
        required
        data-testid="billing-phone-input"
      />
      <Input
        label="Company (optional)"
        name="billing_address.company"
        value={formData["billing_address.company"]}
        onChange={handleChange}
        autoComplete="organization"
        data-testid="billing-company-input"
      />
      <div className="flex flex-col w-full">
        <NativeSelect
          name="billing_address.province"
          placeholder="Province"
          value={formData["billing_address.province"]}
          onChange={handleChange}
          required
          data-testid="billing-province-input"
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
        name="billing_address.city"
        autoComplete="address-level2"
        value={formData["billing_address.city"]}
        onChange={handleChange}
        required
        data-testid="billing-city-input"
      />
      <div className="col-span-2">
        <Input
          label="Municipality / City, Ward No., Tole & landmark"
          name="billing_address.address_1"
          autoComplete="street-address"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />
      </div>
      <Input
        label="Postal code (optional)"
        name="billing_address.postal_code"
        autoComplete="postal-code"
        value={formData["billing_address.postal_code"]}
        onChange={handleChange}
        data-testid="billing-postal-input"
      />
      <div className="col-span-2">
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        />
      </div>
    </div>
  )
}

export default BillingAddress
