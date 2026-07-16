import LegalPage, { legalMetadata } from "@modules/home/components/legal-page"

export const metadata = legalMetadata(
  "Authenticity Guarantee",
  "How Protein Pasal guarantees 100% genuine supplements in Nepal — sourced from authorized distributors, sealed, batch-checked, with a clear counterfeit-report path.",
)

export default function AuthenticityPage() {
  return (
    <LegalPage
      eyebrow="Authenticity guarantee"
      title="No fakes. No grey market. Just your supplements, done right."
      intro="Counterfeit and expired supplements are the single biggest risk when you buy protein in Nepal. Here is exactly how we make sure everything you order from Protein Pasal is the real thing."
      updated="Last updated · July 2026"
      sections={[
        {
          heading: "Sourced from authorized distributors",
          blocks: [
            {
              type: "p",
              text: "We stock only genuine, factory-sealed products bought through official brand distributors and authorized importers for Nepal. We do not sell parallel-imported or grey-market inventory of unknown origin — the kind that fuels most fake and expired supplement problems in the local market.",
            },
            {
              type: "p",
              text: "Every brand we carry is a deliberate, legitimate sourcing relationship, not a random dropship aggregation. If a product is on our shelves, we can stand behind where it came from.",
            },
          ],
        },
        {
          heading: "Sealed, stored, and checked before dispatch",
          blocks: [
            {
              type: "p",
              text: "Stock is kept in proper conditions at our Kathmandu warehouse and inspected before it is packed for you. Before a tub leaves us, we confirm:",
            },
            {
              type: "list",
              items: [
                "The manufacturer seal is intact and unbroken.",
                "The label matches the brand's official artwork and print quality.",
                "A batch code and expiry date are clearly printed on the physical product.",
                "There is meaningful shelf life left at the time of delivery.",
              ],
            },
            {
              type: "p",
              text: "Batch & expiry shown on physical product label; minimum 6 months shelf life guaranteed at time of delivery.",
            },
          ],
        },
        {
          heading: "How to check your product when it arrives",
          blocks: [
            {
              type: "p",
              text: "A 30-second check at the door gives you total peace of mind. When your order arrives:",
            },
            {
              type: "list",
              items: [
                "Check the outer seal and inner freshness seal are unbroken.",
                "Match the batch number and expiry date printed on the tub.",
                "Where the brand provides one, scan the authenticity QR code or hologram.",
                "Compare the label's print quality and spelling against the brand's official packaging.",
              ],
            },
          ],
        },
        {
          heading: "Think you've received a fake? Tell us immediately.",
          blocks: [
            {
              type: "p",
              text: "If anything looks off — a broken seal, a mismatched batch, an expiry that seems wrong, or print that does not look right — stop using the product and contact us straight away using the WhatsApp button in the corner of any page.",
            },
            {
              type: "p",
              text: "We will verify the batch with you and, if there is a genuine problem with authenticity or freshness, replace the product or refund you in full. Your trust is the whole business — we would rather lose a sale than lose it.",
            },
          ],
        },
      ]}
    />
  )
}
