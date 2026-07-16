import React, { Suspense } from "react"

import ProductActions from "@modules/products/components/product-actions"
import ProductGallery from "@modules/products/components/product-gallery"
import ProductInfoSections from "@modules/products/components/product-info-sections"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import Breadcrumb from "@modules/products/components/breadcrumb"
import BuyBoxPerks from "@modules/products/components/buy-box-perks"
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

/**
 * PDP layout — Amazon-grade two-column split in the editorial identity:
 * scrollable gallery left, sticky buy box right (below the 64px nav).
 * Mobile is gallery-first, then the buy box, then anchored info sections.
 */
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
      <div
        className="content-container pt-6"
        data-testid="product-breadcrumb-container"
      >
        <Breadcrumb product={product} />
      </div>

      <div
        className="content-container grid grid-cols-1 gap-x-10 gap-y-8 py-6 pb-16 small:grid-cols-[minmax(0,1fr)_400px] small:gap-x-14 small:py-10 small:pb-24 medium:grid-cols-[minmax(0,1fr)_420px]"
        data-testid="product-container"
      >
        {/* Gallery — scrolls with the page. */}
        <div className="relative w-full min-w-0">
          <ProductGallery images={images} title={product.title} />
        </div>

        {/* Buy box — sticky on desktop, self-start so it can pin. */}
        <div className="flex w-full flex-col gap-y-6 small:sticky small:top-24 small:self-start">
          <ProductInfo product={product} />

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

          <BuyBoxPerks productTitle={product.title} />

          <TrustBadgeRow compact />
        </div>
      </div>

      {/* Anchored info sections: Description · Supplement facts · How to use ·
          Delivery & COD · Authenticity. */}
      <ProductInfoSections product={product} />

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
