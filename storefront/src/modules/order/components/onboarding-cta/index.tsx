"use client"

import { resetOnboardingState } from "@lib/data/onboarding"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <div className="w-full max-w-4xl border border-ink bg-fog p-6 flex flex-col gap-y-3 items-center text-center">
      <p className="font-body text-ink text-lg font-semibold">
        Your test order was successfully created!
      </p>
      <p className="font-body text-body-sm text-ash">
        You can now complete setting up your store in the admin.
      </p>
      <button
        type="button"
        className="mt-2 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 font-body text-sm font-semibold uppercase tracking-wide text-paper transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-coal"
        onClick={() => resetOnboardingState(orderId)}
      >
        Complete setup in admin
      </button>
    </div>
  )
}

export default OnboardingCta
