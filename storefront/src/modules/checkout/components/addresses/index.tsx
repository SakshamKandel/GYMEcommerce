"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useToggleState } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="border-b border-line pb-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="flex items-center gap-x-3 font-display text-2xl uppercase text-ink leading-none">
          <span className="font-mono text-label text-red not-italic tracking-label">
            01
          </span>
          Delivery address
          {!isOpen && <CheckCircleSolid className="text-ink" />}
        </h2>
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="font-mono text-label-sm uppercase tracking-label text-red hover:text-red-deep"
            data-testid="edit-address-button"
          >
            Edit
          </button>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-4">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <h2 className="font-display text-xl uppercase text-ink pb-6 pt-2">
                  Billing address
                </h2>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton
              className="mt-6 uppercase tracking-wide"
              data-testid="submit-address-button"
            >
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="font-body text-body-sm">
            {cart && cart.shipping_address ? (
              <div className="flex items-start gap-x-8">
                <div className="flex items-start gap-x-1 w-full">
                  <div
                    className="flex flex-col w-1/3"
                    data-testid="shipping-address-summary"
                  >
                    <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-2">
                      Delivery address
                    </p>
                    <p className="text-ink font-medium">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </p>
                    <p className="text-ash">
                      {cart.shipping_address.address_1}
                    </p>
                    <p className="text-ash">
                      {cart.shipping_address.city}
                      {cart.shipping_address.province &&
                        `, ${cart.shipping_address.province}`}
                    </p>
                    <p className="text-ash">
                      {cart.shipping_address.postal_code}{" "}
                      {cart.shipping_address.country_code?.toUpperCase()}
                    </p>
                  </div>

                  <div
                    className="flex flex-col w-1/3"
                    data-testid="shipping-contact-summary"
                  >
                    <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-2">
                      Contact
                    </p>
                    <p className="text-ash">{cart.shipping_address.phone}</p>
                    <p className="text-ash">{cart.email}</p>
                  </div>

                  <div
                    className="flex flex-col w-1/3"
                    data-testid="billing-address-summary"
                  >
                    <p className="font-mono text-label-sm uppercase tracking-label text-ash mb-2">
                      Billing address
                    </p>

                    {sameAsBilling ? (
                      <p className="text-ash">
                        Same as delivery address.
                      </p>
                    ) : (
                      <>
                        <p className="text-ink font-medium">
                          {cart.billing_address?.first_name}{" "}
                          {cart.billing_address?.last_name}
                        </p>
                        <p className="text-ash">
                          {cart.billing_address?.address_1}
                        </p>
                        <p className="text-ash">
                          {cart.billing_address?.city}
                          {cart.billing_address?.province &&
                            `, ${cart.billing_address?.province}`}
                        </p>
                        <p className="text-ash">
                          {cart.billing_address?.postal_code}{" "}
                          {cart.billing_address?.country_code?.toUpperCase()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Addresses
