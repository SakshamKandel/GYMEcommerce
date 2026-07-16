"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

/**
 * Header/side-menu search field. Submits to `/search?q=` — the route itself
 * is Workstream C's; the URL contract is frozen in master plan §5.4.
 */
type SearchBarProps = {
  className?: string
  /** Called after a successful submit (e.g. to close the side menu). */
  onSubmitted?: () => void
}

const SearchBar = ({ className, onSubmitted }: SearchBarProps) => {
  const { countryCode } = useParams()
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      return
    }
    router.push(`/${countryCode}/search?q=${encodeURIComponent(q)}`)
    onSubmitted?.()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex items-stretch ${className ?? ""}`}
      data-testid="nav-search-form"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="h-10 w-full min-w-0 bg-coal border border-white/15 border-r-0 px-3 font-body text-sm text-paper placeholder:text-paper/40 focus:border-red focus:outline-none"
        data-testid="nav-search-input"
      />
      <button
        type="submit"
        aria-label="Search"
        className="grid h-10 w-10 shrink-0 place-items-center border border-white/15 bg-coal text-paper/80 transition-colors hover:bg-red hover:text-paper"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.75" />
          <path d="M15.5 15.5L21 21" />
        </svg>
      </button>
    </form>
  )
}

export default SearchBar
