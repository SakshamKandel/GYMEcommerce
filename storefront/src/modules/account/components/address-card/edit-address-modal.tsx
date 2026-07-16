"use client"

import React, { useEffect, useState, useActionState } from "react"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import {
  NEPAL_PROVINCES,
  NEPAL_PHONE_PATTERN,
  NEPAL_PHONE_TITLE,
} from "@modules/account/utils/np-address"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "flex min-h-[220px] h-full w-full flex-col justify-between border border-line p-5 transition-colors",
          {
            "border-ink": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <p
            className="font-body text-sm font-semibold uppercase tracking-wide text-ink"
            data-testid="address-name"
          >
            {address.first_name} {address.last_name}
          </p>
          {address.company && (
            <p
              className="font-body text-body-sm text-ash"
              data-testid="address-company"
            >
              {address.company}
            </p>
          )}
          <div className="flex flex-col gap-0.5 mt-3 font-body text-body-sm text-ash">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.city}
              {address.postal_code && `, ${address.postal_code}`}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
            {address.phone && <span>{address.phone}</span>}
          </div>
        </div>
        <div className="flex items-center gap-x-5 mt-4">
          <button
            className="flex items-center gap-x-2 font-mono text-label-sm uppercase tracking-label text-ink hover:text-red"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            className="flex items-center gap-x-2 font-mono text-label-sm uppercase tracking-label text-ash hover:text-red"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash className="h-3.5 w-3.5" />}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <span className="font-display text-2xl uppercase text-ink">
            Edit address
          </span>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
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
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
              <NativeSelect
                name="province"
                placeholder="Province"
                required
                defaultValue={address.province || undefined}
                data-testid="province-select"
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
                required
                autoComplete="address-level2"
                defaultValue={address.city || undefined}
                data-testid="city-input"
              />
              <Input
                label="Ward No. & Area / Tole"
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <Input
                label="Street / Landmark"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="Postal code (optional)"
                  name="postal_code"
                  autoComplete="postal-code"
                  defaultValue={address.postal_code || undefined}
                  data-testid="postal-code-input"
                />
                <Input
                  label="Company (optional)"
                  name="company"
                  autoComplete="organization"
                  defaultValue={address.company || undefined}
                  data-testid="company-input"
                />
              </div>
              <CountrySelect
                name="country_code"
                region={region}
                required
                autoComplete="country"
                defaultValue={address.country_code || "np"}
                data-testid="country-select"
              />
            </div>
            {formState.error && (
              <div className="pt-2 font-body text-body-sm text-red">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6 w-full">
              <button
                type="reset"
                onClick={close}
                className="flex-1 rounded-full border border-ink px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-ink hover:bg-ink hover:text-paper"
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <SubmitButton
                data-testid="save-button"
                className="flex-1 !rounded-full !bg-red hover:!bg-red-deep !text-paper !font-body !text-sm !font-semibold !uppercase !tracking-wide !h-auto !py-3"
              >
                Save
              </SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
