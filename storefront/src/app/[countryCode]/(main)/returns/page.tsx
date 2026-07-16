import LegalPage, { legalMetadata } from "@modules/home/components/legal-page"

export const metadata = legalMetadata(
  "Returns & Refunds",
  "Protein Pasal's returns and refunds policy for Nepal — 7-day returns on unopened sealed products, and free replacement or full refund for anything damaged, wrong, or expired on arrival.",
)

export default function ReturnsPage() {
  return (
    <LegalPage
      eyebrow="Help"
      title="Returns & refunds"
      intro="We want you to buy with confidence. If something is wrong with your order, we will make it right. This is our returns policy for supplements, where hygiene and safety set some sensible limits."
      updated="Last updated · July 2026"
      sections={[
        {
          heading: "7-day return window",
          blocks: [
            {
              type: "p",
              text: "You can request a return within 7 days of delivery for products that are unopened, still sealed, and in their original packaging. Once we receive and inspect the item, we will process your refund or exchange.",
            },
          ],
        },
        {
          heading: "What cannot be returned",
          blocks: [
            {
              type: "p",
              text: "For health and safety reasons we cannot accept returns of supplements once the seal is broken or the product has been opened or used — unless the item was damaged, incorrect, or expired when it reached you (see below).",
            },
          ],
        },
        {
          heading: "Damaged, wrong, or expired on arrival",
          blocks: [
            {
              type: "p",
              text: "If your product arrives damaged, is not what you ordered, or does not have the shelf life we promise, contact us within 48 hours of delivery with a photo of the item and its batch/expiry label.",
            },
            {
              type: "p",
              text: "We will arrange a free replacement or a full refund — including any delivery fee you paid — at no extra cost to you.",
            },
          ],
        },
        {
          heading: "How to start a return",
          blocks: [
            {
              type: "p",
              text: "Message us on WhatsApp using the button in the corner of any page, or reach our support team, with your order number and the reason for the return. We will confirm the next steps and, where needed, arrange pickup or drop-off.",
            },
          ],
        },
        {
          heading: "Refunds",
          blocks: [
            {
              type: "p",
              text: "Because most orders are paid by Cash on Delivery, approved refunds are issued by bank transfer, wallet transfer, or store credit — whichever you prefer. Refunds are processed within 3–5 business days after we receive and inspect the returned item.",
            },
          ],
        },
      ]}
    />
  )
}
