"use client"

import { Plus } from "@medusajs/icons"
import { useEffect, useState, useActionState } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import Modal from "@modules/common/components/modal"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"
import {
  NEPAL_PROVINCES,
  NEPAL_PHONE_PATTERN,
  NEPAL_PHONE_TITLE,
} from "@modules/account/utils/np-address"

const AddAddress = ({
  region,
  addresses,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    isDefaultShipping: addresses.length === 0,
    success: false,
    error: null,
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

  return (
    <>
      <button
        className="flex min-h-[220px] h-full w-full flex-col justify-between border border-dashed border-line p-5 text-left transition-colors hover:border-ink"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="font-body text-sm font-semibold uppercase tracking-wide text-ink">
          New address
        </span>
        <Plus />
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <span className="font-display text-2xl uppercase text-ink">
            Add address
          </span>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="flex flex-col gap-y-3">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
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
                data-testid="phone-input"
              />
              <NativeSelect name="province" placeholder="Province" required data-testid="province-select">
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
                data-testid="city-input"
              />
              <Input
                label="Ward No. & Area / Tole"
                name="address_2"
                autoComplete="address-line2"
                data-testid="address-2-input"
              />
              <Input
                label="Street / Landmark"
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="Postal code"
                  name="postal_code"
                  autoComplete="postal-code"
                  data-testid="postal-code-input"
                />
                <Input
                  label="Company"
                  name="company"
                  autoComplete="organization"
                  data-testid="company-input"
                />
              </div>
              <CountrySelect
                region={region}
                name="country_code"
                required
                autoComplete="country"
                defaultValue="np"
                data-testid="country-select"
              />
            </div>
            {formState.error && (
              <div
                className="pt-2 font-body text-body-sm text-red"
                data-testid="address-error"
              >
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

export default AddAddress
