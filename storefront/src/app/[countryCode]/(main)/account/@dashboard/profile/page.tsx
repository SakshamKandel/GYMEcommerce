import { Metadata } from "next"

import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"

import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Protein Pasal profile.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-3">
        <p className="font-mono text-label uppercase tracking-label text-red">
          Account
        </p>
        <h1 className="font-display text-3xl md:text-4xl uppercase text-ink leading-none">
          Profile
        </h1>
        <p className="font-body text-body-sm text-ash max-w-lg">
          Keep your phone number current — riders call it to confirm every
          Cash-on-Delivery order.
        </p>
      </div>
      <div className="flex flex-col gap-y-6 w-full">
        <ProfileName customer={customer} />
        <ProfileEmail customer={customer} />
        <ProfilePhone customer={customer} />
        {/* <ProfilePassword customer={customer} /> */}
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  )
}
