import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import Breadcrumb from "@modules/products/components/breadcrumb"
import NutritionFacts from "@modules/products/components/nutrition-facts"
import SplitFeature from "@modules/common/components/split-feature"
import TrustBadgeRow from "@modules/common/components/trust-badges"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

// Persistent PDP trust badge — copy verbatim from master plan §3 / 05 §5.2.
const AuthenticityBadge = () => (
  <div className="flex items-start gap-2.5 border border-ink/20 px-3 py-2.5">
    <svg
      viewBox="0 0 16 16"
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="M3 8l3.5 3.5L13 4" strokeLinecap="square" />
    </svg>
    <span className="font-mono text-label-sm uppercase tracking-label text-ash">
      100% Authentic — Sourced from Authorized Distributors
    </span>
  </div>
)

// R8: single-source delivery/COD strings, reused verbatim across the site.
const DeliveryStrip = () => {
  const items = [
    { label: "Inside Kathmandu Valley", value: "Delivered in 1–2 days" },
    { label: "Outside Valley", value: "Delivered in 3–5 days" },
    { label: "Payment", value: "Cash on Delivery, nationwide" },
    { label: "Shipping", value: "Flat rate shown at checkout" },
  ]

  return (
    <section className="bg-fog" data-testid="product-delivery-strip">
      <div className="shell py-10">
        <dl className="grid grid-cols-2 divide-y divide-ink/15 border-y border-ink/15 md:grid-cols-4 md:divide-x md:divide-y-0">
          {items.map((item) => (
            <div key={item.label} className="px-5 py-6 md:px-6">
              <dt className="font-mono text-label-sm uppercase tracking-label text-ash">
                {item.label}
              </dt>
              <dd className="mt-2 font-body text-body-sm font-semibold text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div className="content-container pt-6" data-testid="product-breadcrumb-container">
        <Breadcrumb product={product} />
      </div>

      <div
        className="content-container relative flex flex-col py-6 small:flex-row small:items-start small:gap-x-8"
        data-testid="product-container"
      >
        <div className="flex w-full flex-col gap-y-8 py-8 small:sticky small:top-32 small:max-w-[340px] small:py-0">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>

        <div className="relative block w-full">
          <ImageGallery images={images} />
        </div>

        <div className="flex w-full flex-col gap-y-6 py-8 small:sticky small:top-32 small:max-w-[340px] small:py-0">
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          <div className="flex flex-col gap-y-4">
            <TrustBadgeRow compact />
            <AuthenticityBadge />
          </div>
        </div>
      </div>

      <NutritionFacts product={product} />

      <DeliveryStrip />

      {/* TODO(real-photography): swap imageSrc for a real warehouse/sealed-stock shot. */}
      <SplitFeature
        compact
        eyebrow="Our promise"
        title="100% genuine. No fakes."
        body="Every tub we sell is sourced directly from authorized distributors — sealed, verified, and stored right. No grey market, no parallel imports. Just the real thing, delivered across Nepal."
        cta={{ label: "How we verify", href: "/authenticity" }}
        imageSrc="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
        imageAlt=""
      />

      <div
        className="my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
