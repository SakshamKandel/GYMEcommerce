# 05 — Nepal Commerce Operations

Practical, decisive operating rules for running Protein Pasal in the Nepal market. This doc is the
source of truth for payments, currency formatting, shipping, tax, authenticity trust-building, and
legal footer content. Implementation agents should lift copy and config values from here directly
rather than inventing their own.

---

## 1. Payments landscape

### 1.1 How Nepalis actually pay for online goods (2025/26 reality)

| Method | Penetration / role | Notes |
|---|---|---|
| **Cash on Delivery (COD)** | Dominant, 60-80%+ of e-commerce orders outside of top-tier digital-native buyers | Trust default. Buyers pay the rider cash or via the rider's own eSewa/Khalti QR at the door. No upfront online payment required from the buyer. |
| **eSewa** | Largest digital wallet, strong in Kathmandu Valley, widely trusted for online checkout | Wallet balance, bank-linked, or eSewa-issued card. Has a mature merchant API (ePay v2). |
| **Khalti** | #2 digital wallet, strong bank/card linking, popular with younger urban users | Also does bank transfer, mobile banking, and Khalti-issued cards through one checkout widget. |
| **Fonepay** | Interoperable QR standard used by most Nepali banks — not a wallet itself | Common as a scan-to-pay QR displayed at delivery or in-store; less common as an online-checkout redirect flow, but growing (Fonepay Payment Gateway product exists for merchants). |
| **Bank transfer / mobile banking (ConnectIPS, mobile banking apps)** | Used for higher-value or B2B-ish orders, or customers without wallet accounts | Manual reconciliation burden; not a v1 priority. |
| **Cards (Visa/Mastercard via local PSPs)** | Low penetration for D2C e-commerce; concentrated in a small urban/expat/frequent-traveler segment | International card checkout usually routed through the same wallets/gateways above or a bank's own gateway; not worth building bespoke card-only flow for launch. |

**Takeaway:** for a first-time supplement buyer in Nepal, "pay when it arrives" is the single biggest
trust lever, larger than any brand-authenticity claim. Everything in checkout UX should treat COD as
the *default*, not an alternative buried under "more payment options."

### 1.2 Launch decision: COD only, via Medusa's manual payment provider

**Decision:** Ship v1 with exactly one payment method — **Cash on Delivery**, implemented as Medusa's
built-in **`manual` payment provider** (`@medusajs/payment-manual` / the manual provider that ships
with medusa-starter-default). No live payment gateway integration at launch.

Why this is correct, not a shortcut:
- It matches actual buyer behavior (§1.1) — we are not under-serving the market by skipping wallets on day one.
- It removes an entire class of launch risk: PSP merchant onboarding (eSewa/Khalti require a
  registered Nepali company, PAN/VAT, bank account, and a manual approval process that can take
  1-4 weeks) does not block go-live.
- It removes settlement/reconciliation complexity from scope — no webhook signature verification,
  no callback race conditions, no partial-payment edge cases to handle before the store can take a
  single order.
- Medusa's manual provider is designed exactly for this: it marks the payment session as
  `authorized` without an external call, the order proceeds through the normal fulfillment flow, and
  "capture" happens operationally (rider collects cash, ops marks the order paid) rather than via API.

**Configuration:**
- In `medusa-config.ts`, register the manual provider on the NP region's payment provider list (it is
  included by default in medusa-starter-default — confirm it is not stripped out, and confirm no
  Stripe/other provider is left registered for the NP region, since it would show as a dead
  "Credit Card" option at checkout).
- Region: single region "Nepal", currency `npr`, countries: `np`.
- Storefront checkout payment step: when only one provider is configured, skip the payment-method
  *selection* UI entirely and show a static confirmation block: **"Pay with Cash on Delivery — pay the
  rider when your order arrives. No advance payment needed."** Do not render a radio button with one
  disabled-looking option; that reads as broken, not simple.
- Order confirmation copy (email + on-screen) must restate the COD amount due, because this is the
  buyer's main anxiety point ("how much do I actually hand over").
- Add a soft COD safeguard for operational risk (not a Medusa payment feature — a business rule the
  admin/ops team enforces): flag or cap COD for first-time customers on orders above a threshold
  (e.g., **NPR 15,000**) for manual phone confirmation before dispatch. Document this as an ops SOP,
  not code — high-value COD orders are the main source of return-to-origin (RTO) losses for Nepali
  e-commerce. Revisit the threshold once order-volume data exists.

### 1.3 Later integration: eSewa and Khalti as Medusa payment provider modules

Design for this now so it's a clean add, not a rewrite. Do **not** build it for launch.

**Generic redirect-gateway flow (both eSewa and Khalti follow this shape):**

1. **Initiate** — storefront calls Medusa's payment session creation for the cart; the custom payment
   provider module calls the gateway's "initiate transaction" API with amount, a merchant-generated
   transaction UUID, and success/failure callback URLs. Gateway returns a redirect URL (or, for
   Khalti's newer flow, a payment token / embeddable checkout).
2. **Redirect** — storefront sends the browser to the gateway-hosted payment page (eSewa) or opens
   the Khalti checkout widget/redirect. Buyer authenticates with the gateway (wallet PIN / OTP / bank
   login) — Protein Pasal never touches wallet credentials, satisfying PCI-ish concerns trivially
   since we never see secrets.
3. **Callback / verify** — gateway redirects the browser back to a Protein Pasal success or failure
   URL with a signed/opaque reference (eSewa: base64-encoded response payload with a signature;
   Khalti: `pidx` token). The *browser redirect alone must never be trusted as proof of payment* —
   the backend must independently call the gateway's **server-to-server verification/status API**
   (eSewa: transaction status check endpoint; Khalti: `epayment/lookup` endpoint) using the
   transaction reference, confirm amount + status match, and only then mark the Medusa payment as
   captured.
4. **Webhook (defense in depth)** — where the gateway offers server-initiated callbacks/webhooks in
   addition to the browser redirect, register them too, so a payment that completed but whose browser
   redirect got interrupted (closed tab, flaky mobile network — common on Nepali 4G) still gets
   reconciled.

**Where this plugs into Medusa v2:**
- Implement each gateway as its own **Payment Provider Module** (Medusa v2's module pattern —
  `services/esewa-payment/` and `services/khalti-payment/` following the `AbstractPaymentProvider`
  interface: `initiatePayment`, `authorizePayment`, `capturePayment`, `getPaymentStatus`,
  `refundPayment`, `cancelPayment`), registered in `medusa-config.ts` under the NP region's
  `payment` module providers array alongside `manual`.
- `initiatePayment` → step 1 above (call gateway, return the redirect URL/token to the storefront in
  the payment session's `data`).
- The storefront checkout payment step renders a gateway-specific button ("Pay with eSewa" / "Pay
  with Khalti") that performs the redirect using the URL/token from session data.
- A dedicated backend route (e.g. `/store/payment-callback/esewa`, `/store/payment-callback/khalti`)
  receives the gateway's browser callback, triggers `getPaymentStatus`/verification server-side, and
  redirects the buyer to the storefront's order-confirmation page only after verification succeeds.
  On verification failure, redirect to an order-failed/retry page — never assume success from the
  presence of a callback hit alone.
- Keep COD (`manual`) always available even after wallets are added — do not remove it. Nepal
  checkout should offer **COD first, eSewa second, Khalti third**, in that visual order, matching
  real-world usage share.
- Credentials (merchant code, secret key) go in environment variables, never hardcoded; use gateway
  **sandbox/UAT credentials** in the dev/staging Medusa instance and production credentials only in
  the production backend `.env`.

**Do not build:** Fonepay direct integration, bank-transfer-with-manual-slip-upload, or card-only
gateways for phase 1 of wallet expansion. Revisit only if order data shows real demand.

---

## 2. NPR currency formatting

### 2.1 The two conventions

- **Lakh/crore (South Asian) grouping**: `Rs. 1,50,000` — groups the first three digits from the
  right, then groups of two thereafter (1,50,000 = one lakh fifty thousand). This is how Nepalis read
  and speak prices out loud ("dedh lakh" for 1,50,000).
- **Western (international) grouping**: `Rs. 150,000` — groups of three throughout. This is what
  every off-the-shelf JS `Intl.NumberFormat` / Medusa's default currency formatting produces for
  `en-US` or generic locales, because there is no widely-supported `Intl` locale tag for Nepali
  digit-grouping in most JS runtimes' bundled ICU data (`ne-NP` locale support for grouping is
  inconsistent across Node/browser ICU builds — do not depend on it rendering correctly).

### 2.2 Decision: use lakh-style grouping, implemented manually

**Recommendation: lakh/crore grouping (`Rs. 1,50,000`), not western grouping.** Reasoning:
- Product price points for supplements naturally land in the thousands-to-tens-of-thousands range
  (a whey tub is commonly NPR 4,000–12,000; a stack/bundle order can cross NPR 15,000–30,000+).
  This is exactly the range where lakh grouping first diverges visibly from western grouping
  (anything ≥ 1,00,000, i.e. ≥ NPR 100,000) — high but realistic for bulk/gym-owner orders — and
  where a Nepali customer's brain parses `Rs. 1,50,000` instantly but has to re-parse `Rs. 150,000`.
- It signals "this store is built for Nepal," not a generic Shopify template — a small but real trust
  and craft signal for a market that is used to being an afterthought in software.
- It matches how NPR is printed on receipts, bank statements, and government/NRB communications in
  Nepal.

**Implementation rule (do not rely on `Intl.NumberFormat` locale grouping for this):**
- Write a small shared utility, e.g. `formatNPR(amountInPaisa: number): string`, used everywhere the
  storefront displays a price (PDP, cart, checkout, order history, admin-facing emails).
- Logic: take the integer rupee amount (Medusa stores amounts in the currency's minor unit — for NPR
  treat it as whole-rupee, no decimal paisa display in UI), convert to a string, then apply South
  Asian grouping: last 3 digits as one group, remaining digits grouped in 2s from the right.
  Reference algorithm:
  ```
  function formatNPR(amount: number): string {
    const s = Math.round(amount).toString();
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    const withCommas = rest ? `${grouped},${last3}` : last3;
    return `Rs. ${withCommas}`;
  }
  ```
- Always prefix `Rs. ` (not `NPR` or `₨` or the Devanagari `रु`) — `Rs.` is the dominant convention in
  Nepali retail/e-commerce UI and reads clearly to both Nepali and expat/tourist buyers. Keep it
  consistent everywhere; never mix `Rs.` and `NPR` in the same UI.
- No decimals in displayed prices (`Rs. 4,500`, not `Rs. 4,500.00`) — Nepali retail pricing is
  essentially always whole rupees; paisa is not used in consumer-facing pricing. Set product prices
  in Medusa as whole-rupee integers.
- Apply this formatting consistently to: product price, compare-at/strike-through price, cart line
  totals, cart subtotal, shipping cost, tax line, order total, order-history amounts, and any
  admin-facing customer-communication templates (order confirmation, SMS).

---

## 3. Shipping & logistics reality

### 3.1 Two-zone model (already decided) — operational detail

| Zone | Typical delivery time | Typical carriers / model |
|---|---|---|
| **Inside Kathmandu Valley** (Kathmandu, Lalitpur, Bhaktapur) | Same-day to next-day | In-house rider / local parcel apps (**Pathao Parcel**, **InDrive**-style courier, or a dedicated local delivery partner); COD cash collection at doorstep is standard. |
| **Outside Valley** (rest of Nepal) | 3-5 business days, sometimes longer for remote hill/mountain districts | Bus-courier network (parcel sent via long-route public bus counters), **NCM (Nepal Can Move)** — the most widely used nationwide parcel/COD logistics aggregator for Nepali e-commerce — or courier partners with local last-mile agents in district headquarters. Aramex operates in Nepal mainly for international/express and B2B, not typical low-cost D2C parcel — treat it as a premium/backup option, not the default outside-valley carrier. |

**Operational notes for the storefront/admin to reflect:**
- Shipping rate and delivery-estimate copy must be **zone-based, not weight-based**, for v1 (matches
  the flat-rate decision already made). Show the estimated delivery window on the PDP and cart, not
  just at checkout — reduces cart abandonment from surprise delivery times.
- Storefront copy pattern:
  - Inside Valley: **"Delivered in 1-2 days • Pay on delivery"**
  - Outside Valley: **"Delivered in 3-5 days • Pay on delivery"**
- Address form must be optimized for Nepali addressing norms, which are landmark-based, not
  structured street-address-based like US/EU forms: fields should be **Province → District →
  Municipality/City → Ward No. → Street/Tole/Landmark (free text)**, plus a **required phone number**
  (see §5). Do not force a rigid "City / State / ZIP" Western form — ZIP/postal codes are rarely known
  by heart in Nepal and should be optional, auto-filled from district selection if possible, never a
  hard-required field that blocks checkout.
- For NCM and similar aggregators, the long-term integration pattern (post-launch, not v1) is: order
  placed in Medusa → fulfillment created → NCM's API (or manual CSV bulk upload, which is what many
  Nepali SMEs actually use day-to-day) creates a pickup/COD parcel with district-branch routing → NCM
  webhook or manual status update flows back into Medusa's fulfillment status. Flag this as a
  **Phase 2 fulfillment-provider module**, structurally analogous to the payment-provider pattern in
  §1.3 but on Medusa's Fulfillment Module instead.
- RTO (return-to-origin / delivery refusal) is the single biggest logistics cost driver for COD
  e-commerce in Nepal. Mitigate via: phone confirmation call/SMS before outside-valley dispatch on
  orders above a threshold, and the high-value COD cap already noted in §1.2.

---

## 4. VAT (13%) and tax display

### 4.1 Decision: tax-inclusive pricing, always

**All customer-facing prices are VAT-inclusive.** Nepal's standard VAT rate is **13%**, and Nepali
retail — online and offline — overwhelmingly displays the final, all-in price the customer actually
pays. A Nepali shopper expects the sticker price to be the price; showing a lower base price and
adding 13% at checkout (US-style tax-exclusive display) reads as a bait-and-switch and will hurt
conversion and trust, especially for a new brand still earning credibility.

**Display rules:**
- PDP price, cart line price, and cart/checkout total are the same VAT-inclusive number throughout —
  no price should change or "jump up" between PDP and checkout.
- Below the price (PDP and cart summary), show a small, uppercase, letterspaced micro-label:
  **"PRICE INCL. VAT"** or **"INCLUDES 13% VAT"** — small type, secondary color, not shouting, but
  present for transparency and for buyers who do care (business buyers, gym owners re-selling, who
  may want the VAT breakdown for their own accounting).
- On the order summary / invoice (and the order-confirmation email), show a itemized breakdown for
  bookkeeping transparency even though the customer-facing total doesn't change:
  ```
  Subtotal (excl. VAT):   Rs. X
  VAT (13%):              Rs. Y
  Shipping:                Rs. Z
  Total (incl. VAT):      Rs. X+Y+Z
  ```
  This matters because Nepali business buyers and the company's own accounting will want a VAT bill
  reference, and Medusa needs this breakdown internally regardless of what the storefront emphasizes.

### 4.2 Medusa tax configuration for NP

- Create a **Tax Region** for Nepal (`np`) in Medusa's Tax module.
- Set a single **default Tax Rate of 13%**, name it `"VAT"`, applied to all product categories at
  launch (supplements are not on Nepal's VAT-exempt list, which is mostly unprocessed
  food/agriculture/books/medicines-in-certain-categories — do not assume an exemption; treat all
  catalog items as standard-rated unless the business's accountant confirms a specific SKU is
  exempt).
- Set the region's tax configuration so **prices entered in the admin are treated as tax-inclusive**
  (Medusa v2 supports tax-inclusive pricing at the region/price level — enable
  `is_tax_inclusive`-style behavior on the NP region/price list rather than entering tax-exclusive
  base prices and letting Medusa add 13% on top at cart calculation). This keeps admin-entered prices
  identical to what customers see, avoiding any drift between merchandising price and displayed
  price.
- Shipping option prices: decide once and document — recommend shipping is also displayed
  VAT-inclusive and treated the same way as product prices, so the "Total" line never has a surprise
  jump.
- This is a config/data decision, not a legal filing — VAT registration, filing, and remittance to
  Nepal's Inland Revenue Department is a business/accounting process outside this doc's scope (see
  §6).

---

## 5. Authenticity, trust, and import concerns

### 5.1 The core fear to design against

Nepali supplement buyers are acutely worried about **fake or expired products and parallel-import
"grey market" stock** — this is the #1 category-specific trust barrier, arguably bigger than payment
trust for repeat buyers. Counterfeit whey/pre-workout circulating through informal import channels is
a widely known problem, and buyers actively look for authenticity signals before trusting a new
supplement seller. **Authenticity is not a footer badge — it must be a first-class brand pillar,
repeated at every stage of the funnel.**

### 5.2 Concrete product requirements (not optional polish)

- **Batch number and expiry date must be a visible, structured field on every PDP**, not buried in
  description text. Treat it as product metadata (Medusa product/variant metadata field), rendered in
  its own labeled row near the price: `Batch: XXXXXX` / `Best Before: MMM YYYY`. If batch varies by
  incoming stock and can't be guaranteed accurate at catalog-entry time, use copy instead:
  **"Batch & expiry shown on physical product label; minimum 6 months shelf life guaranteed at time
  of delivery."** Never let this field be silently absent — an empty/missing expiry area reads as
  evasive to a buyer already primed to distrust.
- **"100% Authentic — Sourced from Authorized Distributors" as a persistent PDP trust badge**,
  displayed near the Add to Cart button (this is exactly the kind of trust-badge placement the
  brutalist/editorial design direction should treat as a first-class visual element, not an
  afterthought icon row).
- **Authenticity/Guarantee page** (footer-linked, referenced from PDP badge) explaining: direct
  sourcing relationships, no parallel-import/grey-market stock, unboxing/seal-check guidance, and a
  clear "what to do if you suspect a counterfeit" contact path (ties into WhatsApp/Viber, §5.3) with a
  replacement/refund commitment.
  Suggested page headline (editorial/brutalist tone, matches design direction):
  **"NO FAKES. NO GREY MARKET. JUST YOUR SUPPLEMENTS, DONE RIGHT."**
- Where possible, show **"Imported by [Company Name] — Official/Authorized Retailer"** per brand
  collection page (e.g. on the Optimum Nutrition collection banner), reinforcing that each brand
  carried is a deliberate, legitimate sourcing relationship rather than a dropship aggregation of
  unknown origin.
- Product photography note (for the content/asset pipeline, not this doc's decision to make in code):
  prefer real photos of physical stock in-hand/in-warehouse over manufacturer stock renders where
  feasible — real-photo evidence of physical inventory is itself a trust signal in this category.

### 5.3 Customer-trust conventions to bake into UX

- **WhatsApp and/or Viber contact button**, persistent (sticky corner button or prominent header/footer
  placement) — this is the default "talk to a human" channel in Nepal, more trusted than email for a
  pre-purchase question like "is this batch fresh" or "is this genuine." Style it to match the
  black/off-white/red palette (a small red circular WhatsApp-icon button is acceptable as the one
  deliberate exception to icon color rules, since brand recognition of the WhatsApp glyph matters more
  than palette purity here — confirm with design lead before finalizing).
- **Phone-number-first checkout**: phone number is a required, prominent field — arguably *more*
  important than email for Nepali buyers, since delivery riders coordinate by phone call, and SMS
  order confirmation (see below) is the default trust confirmation, not email. Email should still be
  collected (order history/account, receipts) but phone is the primary contact field, placed first in
  the checkout contact section, and validated for Nepali mobile format (`98XXXXXXXX` /
  `97XXXXXXXX`, 10 digits).
- **SMS order confirmation** is a common and expected trust step for Nepali e-commerce ("your order
  has been placed / is out for delivery"). Flag as a **Phase 2 backend integration** (an SMS gateway —
  e.g. a local aggregator like Sparrow SMS, or Twilio if international reach is acceptable — triggered
  off Medusa order/fulfillment events via a subscriber). Not required for launch, but design the order
  model/notification hooks so it's a clean add (mirrors the payment/fulfillment provider-module
  pattern already used elsewhere in this doc).
- Do not force account creation before checkout — guest checkout with phone + email must work, since
  forcing signup is a known conversion killer and out of step with how most Nepali e-commerce sites
  (and buyers' expectations) operate. Account creation should be offered as a lightweight
  post-order option ("save these details for next time"), not a gate.

---

## 6. Legal basics (informational — not legal advice)

This section is a practical checklist for what implementation agents should surface *in the UI*
(mainly the footer and an "About/Legal" area). It is **not** legal advice; the business owner must
confirm actual registration details, exact wording, and compliance status with a Nepali lawyer/
chartered accountant before launch. Treat every value below as a placeholder to be filled by the
business, not as something to invent.

- **Company registration**: Nepal-based e-commerce operating under a registered entity (typically a
  Private Limited company registered with the **Office of the Company Registrar (OCR)**, or a
  Proprietorship/Partnership registered with the local Ward Office + PAN, depending on the owner's
  chosen structure). Footer should display the registered legal/trade name once available.
- **PAN/VAT number in the footer**: Nepali retail and increasingly e-commerce customers look for a
  visible **PAN/VAT number** as a basic legitimacy signal (it's what makes a business "real" versus an
  informal reseller/Instagram shop in the buyer's mental model). Reserve a clearly labeled footer slot:
  **"PAN/VAT No.: [XXXXXXXXX]"** — leave as an explicit placeholder in the storefront footer component
  until the business supplies the real, registered number. Do not fabricate a number or leave the slot
  silently missing — an empty legitimate-looking footer row without a value is confusing; better to
  omit the row entirely until a real number exists than to ship a fake or empty one.
- **Import/customs and food-supplement regulation (brief, non-exhaustive)**: dietary/sports
  supplements imported into Nepal generally fall under oversight involving the **Department of Food
  Technology and Quality Control (DFTQC)** (food-category registration/labeling requirements) and
  standard customs/import-license processes for commercial import; some products may also intersect
  with Department of Drug Administration rules if formulated/marketed with drug-like claims. This is
  a compliance area the business owner must resolve per-SKU with a customs agent/lawyer — the
  storefront's job is only to (a) never make unverified medical/therapeutic claims in product copy
  (stick to manufacturer-stated nutritional facts, not "cures," "treats," or disease-related claims,
  which is both a legal risk and a copy-quality issue), and (b) keep the batch/expiry and authenticity
  UI from §5 ready to display real import/registration documentation if the business wants to publish
  it (e.g., a "View Import Documents" link per brand, populated later).
- **Return/refund and privacy policy pages**: standard footer links (Terms, Privacy Policy, Return &
  Refund Policy, Shipping Policy) should exist as real pages, not placeholders, before launch — Nepali
  buyers checking "is this a real store" will click these, and a 404 or empty page is a significant
  trust breaker for a category already fighting the fake-product perception described in §5.

---

## 7. Summary of concrete config/copy values for implementation agents

Quick-reference table — pull directly, do not re-derive:

| Item | Value |
|---|---|
| Launch payment provider | Medusa `manual` (COD) only |
| Region | Single region "Nepal" — currency `npr`, country `np` |
| High-value COD confirmation threshold | NPR 15,000 (ops SOP, revisit with data) |
| Currency prefix | `Rs. ` (not `NPR`, not `₨`) |
| Number grouping | Lakh/crore style, custom `formatNPR()` util — see §2.2 |
| Decimal places shown | 0 (whole rupees only) |
| VAT rate | 13%, tax-inclusive display everywhere |
| VAT micro-copy | "Price incl. VAT" / "Includes 13% VAT" |
| Shipping zones | "Inside Kathmandu Valley" (1-2 days), "Outside Valley" (3-5 days) |
| Address form order | Province → District → Municipality/City → Ward No. → Street/Tole/Landmark |
| Required contact field | Phone (primary), Email (secondary) — guest checkout allowed |
| Authenticity PDP badge copy | "100% Authentic — Sourced from Authorized Distributors" |
| Authenticity page headline | "No fakes. No grey market. Just your supplements, done right." |
| PDP batch/expiry fallback copy | "Batch & expiry shown on physical product label; minimum 6 months shelf life guaranteed at time of delivery." |
| Support channel | WhatsApp/Viber persistent button |
| Footer legal | PAN/VAT No. placeholder slot (leave blank until business supplies real number) |
| Future payment providers | eSewa, Khalti — as Medusa `AbstractPaymentProvider` modules, verify-then-capture pattern (§1.3) |
| Future fulfillment providers | NCM (nationwide), Pathao Parcel (Valley) — as Medusa Fulfillment Module providers |
| Future notification | SMS order confirmation via local SMS gateway (e.g. Sparrow SMS) triggered on order events |
