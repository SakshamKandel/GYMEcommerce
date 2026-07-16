"use client"

import React, { useEffect, useMemo, useActionState } from "react"

import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import {
  NEPAL_PROVINCES,
  NEPAL_PHONE_PATTERN,
  NEPAL_PHONE_TITLE,
} from "@modules/account/utils/np-address"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const ProfileBillingAddress: React.FC<MyInformationProps> = ({
  customer,
  regions,
}) => {
  const regionOptions = useMemo(() => {
    return (
      regions
        ?.map((region) => {
          return region.countries?.map((country) => ({
            value: country.iso_2,
            label: country.display_name,
          }))
        })
        .flat() || []
    )
  }, [regions])

  const [successState, setSuccessState] = React.useState(false)

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  const initialState: Record<string, any> = {
    isDefaultBilling: true,
    isDefaultShipping: false,
    error: false,
    success: false,
  }

  if (billingAddress) {
    initialState.addressId = billingAddress.id
  }

  const [state, formAction] = useActionState(
    billingAddress ? updateCustomerAddress : addCustomerAddress,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  const currentInfo = useMemo(() => {
    if (!billingAddress) {
      return "No billing address"
    }

    const country =
      regionOptions?.find(
        (country) => country?.value === billingAddress.country_code
      )?.label || billingAddress.country_code?.toUpperCase()

    return (
      <div
        className="flex flex-col font-body text-body-sm text-ink font-semibold text-right"
        data-testid="current-info"
      >
        <span>
          {billingAddress.first_name} {billingAddress.last_name}
        </span>
        <span className="font-normal text-ash">
          {billingAddress.address_1}
          {billingAddress.address_2 ? `, ${billingAddress.address_2}` : ""}
        </span>
        <span className="font-normal text-ash">
          {billingAddress.city}
          {billingAddress.postal_code ? `, ${billingAddress.postal_code}` : ""}
        </span>
        <span className="font-normal text-ash">{country}</span>
      </div>
    )
  }, [billingAddress, regionOptions])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <input type="hidden" name="addressId" value={billingAddress?.id} />
      <AccountInfo
        label="Billing address"
        currentInfo={currentInfo}
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}
        data-testid="account-billing-address-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <div className="grid grid-cols-2 gap-x-2">
            <Input
              label="First name"
              name="first_name"
              defaultValue={billingAddress?.first_name || undefined}
              required
              data-testid="billing-first-name-input"
            />
            <Input
              label="Last name"
              name="last_name"
              defaultValue={billingAddress?.last_name || undefined}
              required
              data-testid="billing-last-name-input"
            />
          </div>
          <Input
            label="Phone (98XXXXXXXX)"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            pattern={NEPAL_PHONE_PATTERN}
            title={NEPAL_PHONE_TITLE}
            inputMode="numeric"
            maxLength={10}
            defaultValue={billingAddress?.phone ?? customer?.phone ?? ""}
            data-testid="billing-phone-input"
          />
          <NativeSelect
            name="province"
            placeholder="Province"
            defaultValue={billingAddress?.province || undefined}
            data-testid="billing-province-select"
          >
            {NEPAL_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </NativeSelect>
          <Input
            label="Municipality / City & District"
            name="city"
            defaultValue={billingAddress?.city || undefined}
            required
            data-testid="billing-city-input"
          />
          <Input
            label="Ward No. & Area / Tole"
            name="address_2"
            defaultValue={billingAddress?.address_2 || undefined}
            data-testid="billing-address-2-input"
          />
          <Input
            label="Street / Landmark"
            name="address_1"
            defaultValue={billingAddress?.address_1 || undefined}
            required
            data-testid="billing-address-1-input"
          />
          <div className="grid grid-cols-[144px_1fr] gap-x-2">
            <Input
              label="Postal code (optional)"
              name="postal_code"
              defaultValue={billingAddress?.postal_code || undefined}
              data-testid="billing-postcal-code-input"
            />
            <Input
              label="Company (optional)"
              name="company"
              defaultValue={billingAddress?.company || undefined}
              data-testid="billing-company-input"
            />
          </div>
          <NativeSelect
            name="country_code"
            defaultValue={billingAddress?.country_code || "np"}
            required
            data-testid="billing-country-code-select"
          >
            <option value="">-</option>
            {regionOptions.map((option, i) => {
              return (
                <option key={i} value={option?.value}>
                  {option?.label}
                </option>
              )
            })}
          </NativeSelect>
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileBillingAddress
