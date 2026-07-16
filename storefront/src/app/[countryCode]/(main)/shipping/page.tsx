import LegalPage, { legalMetadata } from "@modules/home/components/legal-page"

export const metadata = legalMetadata(
  "Shipping & Delivery",
  "How Protein Pasal delivers across Nepal — Inside Kathmandu Valley in 1–2 days, Outside Valley in 3–5 days, with flat-rate fees and Cash on Delivery nationwide.",
)

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Help"
      title="Shipping & delivery"
      intro="We ship authentic supplements nationwide from our Kathmandu warehouse, with a flat delivery fee by zone and Cash on Delivery available everywhere in Nepal."
      updated="Last updated · July 2026"
      sections={[
        {
          heading: "Where we deliver",
          blocks: [
            {
              type: "p",
              text: "We deliver all over Nepal. Every order ships from our warehouse in Kathmandu, so delivery time depends on whether your address is inside or outside the Kathmandu Valley.",
            },
          ],
        },
        {
          heading: "Delivery zones and times",
          blocks: [
            {
              type: "list",
              items: [
                "Inside Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur): delivered in 1–2 days.",
                "Outside Valley (rest of Nepal): delivered in 3–5 days.",
              ],
            },
            {
              type: "p",
              text: "A flat delivery fee applies per zone. The exact fee for your address is always shown at checkout before you confirm your order — you will never be surprised by the delivery cost.",
            },
            {
              type: "p",
              text: "Some remote hill and mountain districts can take a little longer depending on the local courier network. If we expect a delay, we will call or message you.",
            },
          ],
        },
        {
          heading: "Cash on Delivery",
          blocks: [
            {
              type: "p",
              text: "You can pay cash when your order arrives — no advance online payment is needed. Please keep the order amount ready for the delivery rider. Our team may call to confirm your order before dispatch, so a reachable phone number is required at checkout.",
            },
          ],
        },
        {
          heading: "Order updates and support",
          blocks: [
            {
              type: "p",
              text: "After you place an order, we confirm it by phone or message and keep you posted through delivery. For any delivery question — a change of address, timing, or a delayed parcel — reach us on WhatsApp using the button in the corner of any page.",
            },
          ],
        },
      ]}
    />
  )
}
