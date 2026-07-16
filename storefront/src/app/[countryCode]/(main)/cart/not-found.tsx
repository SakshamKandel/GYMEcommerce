import { Metadata } from "next"

import PillButton from "@modules/common/components/pill-button"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="bg-paper flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
      <p className="font-mono text-label uppercase tracking-label text-red mb-5">
        Cart not found
      </p>
      <h1 className="font-display text-display-2 uppercase text-ink leading-none">
        We lost your bag.
      </h1>
      <p className="mt-6 max-w-md font-body text-body-lg text-ash">
        This cart does not exist. Clear your cookies and start a fresh one, or
        head back to the shop.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <PillButton href="/store" variant="red">
          Shop all
        </PillButton>
        <PillButton href="/" variant="outline">
          Go home
        </PillButton>
      </div>
    </div>
  )
}
