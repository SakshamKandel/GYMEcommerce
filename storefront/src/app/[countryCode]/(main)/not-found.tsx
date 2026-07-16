import { Metadata } from "next"

import PillButton from "@modules/common/components/pill-button"

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you tried to access does not exist.",
}

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 bg-paper px-5 py-24 text-center">
      <p className="font-mono text-label uppercase tracking-label text-red">
        Error 404
      </p>
      <h1 className="font-display text-display-1 uppercase leading-[0.9] text-ink">
        404
        <br />
        Page not found.
      </h1>
      <p className="max-w-md font-body text-body text-ash">
        This page skipped leg day and disappeared. The rest of the store is
        still lifting.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
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
