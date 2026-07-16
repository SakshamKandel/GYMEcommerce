import { Metadata } from "next"

import PillButton from "@modules/common/components/pill-button"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default async function NotFound() {
  return (
    <div className="bg-paper flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
      <p className="font-mono text-label uppercase tracking-label text-red mb-5">
        Page not found
      </p>
      <h1 className="font-display text-display-2 uppercase text-ink leading-none">
        Nothing to check out here.
      </h1>
      <p className="mt-6 max-w-md font-body text-body-lg text-ash">
        The page you tried to reach does not exist. Head back to your bag or
        keep shopping.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <PillButton href="/cart" variant="red">
          Go to bag
        </PillButton>
        <PillButton href="/store" variant="outline">
          Shop all
        </PillButton>
      </div>
    </div>
  )
}
