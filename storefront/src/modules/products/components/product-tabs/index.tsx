"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Description",
      component: <DescriptionTab product={product} />,
    },
    {
      label: "How to use",
      component: <HowToUseTab />,
    },
    {
      label: "Ingredients",
      component: <IngredientsTab />,
    },
    {
      label: "Delivery & COD",
      component: <DeliveryTab />,
    },
    {
      label: "Authenticity",
      component: <AuthenticityTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple" defaultValue={["Description"]}>
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const proseClass =
  "font-body text-body-sm text-ash leading-relaxed whitespace-pre-line"

const DescriptionTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="py-6">
      <p className={proseClass} data-testid="product-tab-description">
        {product.description ||
          "Authentic sports nutrition, sourced from authorized distributors and delivered across Nepal. Full nutritional information and directions are printed on the sealed product label."}
      </p>
    </div>
  )
}

const HowToUseTab = () => {
  return (
    <div className="flex flex-col gap-y-3 py-6">
      <p className={proseClass}>
        Add one serving (see the scoop and label for the exact amount) to
        200–300 ml of cold water or milk. Shake or blend for 20–30 seconds until
        fully mixed.
      </p>
      <p className={proseClass}>
        Best taken post-workout or between meals to hit your daily protein
        target. Do not exceed the serving size stated on the label. Keep sealed,
        store in a cool, dry place, and use within the shelf life printed on the
        pack.
      </p>
    </div>
  )
}

const IngredientsTab = () => {
  return (
    <div className="flex flex-col gap-y-3 py-6">
      <p className={proseClass}>
        The full ingredient list, allergen information, and per-serving
        nutritional values are printed on the physical product label.
        Formulations can vary by flavour and batch, so always read the label
        before use.
      </p>
      <p className={proseClass}>
        Have a question about a specific ingredient or allergen? Message us on
        WhatsApp before you buy and we&apos;ll confirm the details for your
        chosen flavour.
      </p>
    </div>
  )
}

const DeliveryTab = () => {
  return (
    <div className="flex flex-col gap-y-4 py-6">
      <div className="flex flex-col gap-y-1">
        <span className="font-mono text-label-sm uppercase tracking-label text-ink">
          Inside Kathmandu Valley
        </span>
        <span className={proseClass}>Delivered in 1–2 days • Pay on delivery.</span>
      </div>
      <div className="flex flex-col gap-y-1">
        <span className="font-mono text-label-sm uppercase tracking-label text-ink">
          Outside Valley
        </span>
        <span className={proseClass}>Delivered in 3–5 days • Pay on delivery.</span>
      </div>
      <p className={proseClass}>
        Cash on Delivery is available nationwide — pay the rider in cash when
        your order arrives, no advance payment needed. Flat-rate shipping is
        calculated at checkout based on your delivery zone.
      </p>
    </div>
  )
}

const AuthenticityTab = () => {
  return (
    <div className="flex flex-col gap-y-3 py-6">
      <p className={proseClass}>
        Every tub is sourced directly from authorized distributors — never
        grey-market or parallel imports. Products arrive sealed, are verified on
        intake, and stored properly until they reach your door.
      </p>
      <LocalizedClientLink
        href="/authenticity"
        className="w-fit font-mono text-label-sm uppercase tracking-label text-red transition-colors hover:text-red-deep"
      >
        Read our authenticity guarantee →
      </LocalizedClientLink>
    </div>
  )
}

export default ProductTabs
