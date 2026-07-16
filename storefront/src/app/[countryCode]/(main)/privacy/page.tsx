import LegalPage, { legalMetadata } from "@modules/home/components/legal-page"

export const metadata = legalMetadata(
  "Privacy Policy",
  "How Protein Pasal collects and uses your information — name, phone, email, and delivery address — to fulfil your orders in Nepal. We never sell your data.",
)

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      intro="We only collect what we need to get your order to your door. Here is what we hold, why we hold it, and the control you have over it."
      updated="Last updated · July 2026"
      sections={[
        {
          heading: "What we collect",
          blocks: [
            {
              type: "p",
              text: "When you shop or create an account, we collect your name, phone number, email address, delivery address, and your order history. If you check out as a guest, we collect the same order and delivery details without creating an account.",
            },
          ],
        },
        {
          heading: "How we use it",
          blocks: [
            {
              type: "list",
              items: [
                "To process and deliver your orders.",
                "To confirm Cash on Delivery orders by phone or message before dispatch.",
                "To send order and delivery updates.",
                "To provide customer support and handle returns.",
              ],
            },
          ],
        },
        {
          heading: "Who we share it with",
          blocks: [
            {
              type: "p",
              text: "We share your name, address, and phone number with our delivery partners only so they can deliver your order and collect Cash on Delivery. We do not sell your personal information to anyone.",
            },
          ],
        },
        {
          heading: "Payment information",
          blocks: [
            {
              type: "p",
              text: "Because we use Cash on Delivery at launch, we do not collect or store any card or bank details on this website.",
            },
          ],
        },
        {
          heading: "Cookies",
          blocks: [
            {
              type: "p",
              text: "We use essential cookies so the site works — keeping your cart and your session active as you browse. We do not use them to build advertising profiles of you.",
            },
          ],
        },
        {
          heading: "Your choices",
          blocks: [
            {
              type: "p",
              text: "You can view and update your details any time from your account. To request a copy of your data or ask us to delete it, contact us on WhatsApp using the button in the corner of any page and we will help.",
            },
          ],
        },
      ]}
    />
  )
}
