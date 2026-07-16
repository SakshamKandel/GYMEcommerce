import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you tried to access does not exist.",
}

// Root-level 404 lives outside the [countryCode] segment, so it uses plain
// next/link (the middleware redirects bare paths to the active region).
const pillBase =
  "group inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-body text-sm font-semibold uppercase tracking-wide transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 will-change-transform"

const Arrow = () => (
  <span className="grid h-5 w-5 place-items-center transition-transform duration-150 ease-out group-hover:translate-x-1">
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 12L12 4M6 4h6v6" strokeLinecap="square" />
    </svg>
  </span>
)

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
        <Link
          href="/store"
          className={`${pillBase} bg-red text-paper hover:bg-red-deep`}
        >
          Shop all
          <Arrow />
        </Link>
        <Link
          href="/"
          className={`${pillBase} border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper`}
        >
          Go home
          <Arrow />
        </Link>
      </div>
    </div>
  )
}
