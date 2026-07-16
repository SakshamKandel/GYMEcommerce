import { Metadata } from "next"
import { Suspense } from "react"

import { getRegion } from "@lib/data/regions"
import { listCollections } from "@lib/data/collections"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import TrustBadgeRow from "@modules/common/components/trust-badges"

import Hero from "@modules/home/components/hero"
import IntroStatement from "@modules/home/components/intro-statement"
import FeaturedPick from "@modules/home/components/featured-pick"
import ShopByGoal from "@modules/home/components/shop-by-goal"
import BrandList from "@modules/home/components/brand-list"
import Authenticity from "@modules/home/components/authenticity"
import ScrollReveal from "@modules/home/components/scroll-reveal"
import { FreshStock, BestSellers } from "@modules/home/components/featured-products"

export const metadata: Metadata = {
  title: "Protein Pasal — Authentic Protein & Sports Nutrition in Nepal",
  description:
    "Nepal's multi-brand supplement store. Genuine whey, mass gainers, creatine, pre-workout & more from the world's top brands — 100% authentic, Cash on Delivery nationwide.",
}

/** Small mono "VIEW ALL →" section-header action link. */
const ViewAllLink = ({ href, label }: { href: string; label: string }) => (
  <LocalizedClientLink
    href={href}
    className="group inline-flex items-center gap-2 font-mono text-label uppercase tracking-label text-ink hover:text-red"
  >
    {label}
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  </LocalizedClientLink>
)

const SectionHeader = ({
  eyebrow,
  title,
  accent,
  subtext,
  viewAllHref,
}: {
  eyebrow: string
  title: string
  accent?: string
  subtext?: string
  viewAllHref?: string
}) => (
  <ScrollReveal>
    <header className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-4 font-mono text-label uppercase tracking-label text-red">
          {eyebrow}
        </p>
        <h2 className="font-display text-display-1 uppercase text-ink">
          {title}
          {accent && <span className="text-red"> {accent}</span>}
        </h2>
        {subtext && (
          <p className="mt-4 max-w-lg font-body text-body-sm text-ash">
            {subtext}
          </p>
        )}
      </div>
      {viewAllHref && <ViewAllLink href={viewAllHref} label="View all" />}
    </header>
  </ScrollReveal>
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
      {/* 1 · HERO — minimal media carousel */}
      <Hero />

      {/* 2 · INTRO STATEMENT */}
      <IntroStatement />

      {/* 4 · FEATURED PICK — real product spotlight */}
      {region ? (
        <Suspense fallback={null}>
          <FeaturedPick region={region} countryCode={countryCode} />
        </Suspense>
      ) : null}

      {/* 5 · SHOP BY GOAL — staggered editorial cards */}
      <ShopByGoal />

      {/* 6 · FRESH STOCK — staggered product grid */}
      <section className="relative overflow-hidden bg-fog">
        <div className="shell section-y relative">
          <SectionHeader
            eyebrow="Just landed"
            title="Fresh stock"
            subtext="The newest arrivals, sealed and sourced from authorized distributors."
            viewAllHref="/store?sortBy=created_at"
          />
          {region ? (
            <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
              <FreshStock region={region} countryCode={countryCode} />
            </Suspense>
          ) : null}
        </div>
      </section>

      {/* 7 · BRAND LINK-LIST — hover image peek follows the rows */}
      <BrandList collections={collections ?? []} />

      {/* 8 · DARK AUTHENTICITY PROMISE — parallax photo + rotating seal */}
      <Authenticity />

      {/* 9 · BEST SELLERS — drag rail with progress + arrows */}
      <section className="relative overflow-hidden bg-paper">
        <div className="shell section-y relative">
          <SectionHeader
            eyebrow="Moving fast"
            title="Best sellers"
            subtext="What Nepal's lifters keep coming back for."
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
          <ScrollReveal>
            <TrustBadgeRow className="justify-center" />
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
