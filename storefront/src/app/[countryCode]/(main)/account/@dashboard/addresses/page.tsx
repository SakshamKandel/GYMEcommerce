import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View and manage your Protein Pasal shipping addresses.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-3">
        <p className="font-mono text-label uppercase tracking-label text-red">
          Account
        </p>
        <h1 className="font-display text-3xl md:text-4xl uppercase text-ink leading-none">
          Shipping addresses
        </h1>
        <p className="font-body text-body-sm text-ash max-w-lg">
          Save as many delivery addresses as you like — province, district,
          ward and all — so checkout is one tap next time. Couriers call the
          phone on file to confirm Cash-on-Delivery orders.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
