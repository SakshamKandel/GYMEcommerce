import { Metadata } from "next"
import { Suspense } from "react"

import { getRegion } from "@lib/data/regions"
import { listCollections } from "@lib/data/collections"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Marquee from "@modules/common/components/marquee"
import SplitFeature from "@modules/common/components/split-feature"
import TrustBadgeRow from "@modules/common/components/trust-badges"

import Hero from "@modules/home/components/hero"
import IntroStatement from "@modules/home/components/intro-statement"
import StatsRow from "@modules/home/components/stats-row"
import ShopByGoal from "@modules/home/components/shop-by-goal"
import BrandList from "@modules/home/components/brand-list"
import { FreshStock, BestSellers } from "@modules/home/components/featured-products"

export const metadata: Metadata = {
  title: "Protein Pasal — Authentic Protein & Sports Nutrition in Nepal",
  description:
    "Nepal's multi-brand supplement store. Genuine whey, mass gainers, creatine, pre-workout & more from the world's top brands — 100% authentic, Cash on Delivery nationwide.",
}

// Category ticker (03 §2.4 exact list — no price/policy claims here).
const CATEGORY_TICKER = [
  "Whey",
  "Creatine",
  "Mass Gainer",
  "Pre-Workout",
  "BCAA",
  "Protein Bars",
  "Multivitamins",
]

/** Small mono "VIEW ALL →" section-header action link. */
const ViewAllLink = ({ href, label }: { href: string; label: string }) => (
  <LocalizedClientLink
    href={href}
    className="group inline-flex items-center gap-2 font-mono text-label uppercase tracking-label text-ink hover:text-red"
  >
    {label}
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  </LocalizedClientLink>
)

const SectionHeader = ({
  eyebrow,
  title,
  accent,
  viewAllHref,
}: {
  eyebrow: string
  title: string
  accent?: string
  viewAllHref?: string
}) => (
  <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
        {eyebrow}
      </p>
      <h2 className="font-display text-display-1 uppercase text-ink">
        {title}
        {accent && <span className="text-red"> {accent}</span>}
      </h2>
    </div>
    {viewAllHref && <ViewAllLink href={viewAllHref} label="View all" />}
  </header>
)

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const region = await getRegion(countryCode)
  const { collections } = await listCollections({
    fields: "id, handle, title, metadata",
  })

  return (
    <>
      {/* 1 · HERO */}
      <Hero />

      {/* 2 · INTRO STATEMENT */}
      <IntroStatement />

      {/* 3 · STATS ROW */}
      <StatsRow />

      {/* 4 · RED CATEGORY MARQUEE */}
      <Marquee items={CATEGORY_TICKER} variant="red" separator="✱" />

      {/* 5 · SHOP BY GOAL */}
      <ShopByGoal />

      {/* 6 · FRESH STOCK */}
      <section className="bg-fog">
        <div className="shell section-y">
          <SectionHeader
            eyebrow="Just landed"
            title="Fresh stock"
            viewAllHref="/store?sortBy=created_at"
          />
          {region ? (
            <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
              <FreshStock region={region} countryCode={countryCode} />
            </Suspense>
          ) : null}
        </div>
      </section>

      {/* 7 · BRAND LINK-LIST */}
      <BrandList collections={collections ?? []} />

      {/* 8 · DARK SPLIT — AUTHENTICITY PROMISE */}
      <SplitFeature
        eyebrow="Our promise"
        title="100% genuine. No fakes."
        body="Every tub is imported through authorized distributors, sealed, and batch-checked before it reaches your door. No parallel imports. No grey market. Just the supplements the world's best brands actually make."
        cta={{ label: "How we verify", href: "/authenticity" }}
        imageSrc="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1400&q=80"
        imageAlt=""
      />

      {/* 9 · BEST SELLERS */}
      <section className="bg-paper">
        <div className="shell section-y">
          <SectionHeader
            eyebrow="Moving fast"
            title="Best sellers"
            viewAllHref="/store"
          />
          {region ? (
            <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
              <BestSellers region={region} countryCode={countryCode} />
            </Suspense>
          ) : null}
        </div>
      </section>

      {/* 10 · TRUST BADGE ROW */}
      <section className="bg-fog">
        <div className="shell py-14 md:py-16">
          <TrustBadgeRow className="justify-center" />
        </div>
      </section>
    </>
  )
}
