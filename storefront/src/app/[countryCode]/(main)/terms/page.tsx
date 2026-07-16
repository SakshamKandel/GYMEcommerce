import LegalPage, { legalMetadata } from "@modules/home/components/legal-page"

export const metadata = legalMetadata(
  "Terms of Service",
  "The terms for shopping with Protein Pasal in Nepal — orders, VAT-inclusive NPR pricing, Cash on Delivery, delivery, and returns.",
)

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of service"
      intro="These terms cover how you shop with Protein Pasal. We have kept them plain and short. By placing an order, you agree to them."
      updated="Last updated · July 2026"
      sections={[
        {
          heading: "About Protein Pasal",
          blocks: [
            {
              type: "p",
              text: "Protein Pasal is an online store selling authentic protein and sports-nutrition products in Nepal. We operate from Kathmandu and deliver nationwide.",
            },
          ],
        },
        {
          heading: "Prices and VAT",
          blocks: [
            {
              type: "p",
              text: "All prices are shown in Nepalese Rupees (Rs.) and are inclusive of 13% VAT. The price you see on a product is the final price you pay — it does not change between the product page, your cart, and checkout. We may update prices and product availability at any time before an order is placed.",
            },
          ],
        },
        {
          heading: "Orders",
          blocks: [
            {
              type: "p",
              text: "When you place an order, you are making an offer to buy. We confirm your order — often with a quick phone call or message — before we dispatch it. We may decline or cancel an order if a product is out of stock, a price was clearly wrong, or we cannot verify the delivery details.",
            },
          ],
        },
        {
          heading: "Payment",
          blocks: [
            {
              type: "p",
              text: "At launch we accept Cash on Delivery: you pay the delivery rider in cash when your order arrives. No advance online payment is required. Please keep the order amount ready at delivery.",
            },
          ],
        },
        {
          heading: "Delivery and returns",
          blocks: [
            {
              type: "p",
              text: "Delivery times and fees are set out on our Shipping & Delivery page, and your right to return items is set out on our Returns & Refunds page. Both form part of these terms.",
            },
          ],
        },
        {
          heading: "Product information",
          blocks: [
            {
              type: "p",
              text: "Nutritional information and product claims come from the manufacturer's official labelling. Supplements are not medicines and are not intended to diagnose, treat, cure, or prevent any disease. If you have a medical condition or are pregnant, consult a qualified health professional before use.",
            },
          ],
        },
        {
          heading: "Your responsibilities",
          blocks: [
            {
              type: "p",
              text: "Please give an accurate delivery address and a reachable phone number, and be available to receive and pay for Cash on Delivery orders. Repeated refusal of confirmed COD orders may affect future orders.",
            },
          ],
        },
        {
          heading: "Contact",
          blocks: [
            {
              type: "p",
              text: "Questions about these terms? Reach us on WhatsApp using the button in the corner of any page and our team will help.",
            },
          ],
        },
      ]}
    />
  )
}
