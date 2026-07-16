# 00 — Master Plan (Protein Pasal)

**Project:** Protein Pasal — multi-brand protein & sports-supplement e-commerce for Nepal
**Status:** FINAL & AUTHORITATIVE. This document consolidates docs 01–05, resolves every conflict between them, and defines the build order. Where this doc disagrees with any of 01–05, **this doc wins**. Implementation agents execute without asking questions.
**Repos:** `E:\CLI\protein-pasal\backend` (Medusa v2, medusa-starter-default) · `E:\CLI\protein-pasal\storefront` (medusajs/nextjs-starter-medusa, Next.js 15 App Router, Tailwind v3). Both cloned, `node_modules` installed.

---

## 1. Executive summary

**What we are building.** Protein Pasal is Nepal's multi-brand supplement store: one storefront selling authentic protein and sports nutrition from 8 global brands (Optimum Nutrition, MuscleBlaze, Dymatize, MyProtein, GNC, Ultimate Nutrition, Rule 1, Applied Nutrition) across 7 product types (Whey, Mass Gainer, Creatine, Pre-Workout, BCAA/EAA, Protein Bars & Snacks, Vitamins & Health). The catalog launches with 24 products / 116 purchasable variants (Flavor × Size), priced in NPR, stocked at a single Kathmandu warehouse.

**How it works.** Two processes, one database: a Medusa v2 backend (`:9000` — Store API, Admin API, Admin UI at `/app`) on local PostgreSQL 18 (`:5432/protein_pasal`), and a Next.js 15 storefront (`:8000`, region-routed under `/np`). No Docker. Brands are Medusa **Collections** (1:1), product types are **Categories** (M:N), Flavor/Size are **variant options**, supplement facts live in **metadata**. Commerce is Nepal-native: single NPR region, Cash on Delivery via the built-in manual payment provider, two flat-rate shipping options ("Inside Kathmandu Valley" Rs. 100, 1–2 days / "Outside Valley" Rs. 250, 3–5 days), 13% VAT displayed tax-inclusive, lakh-style price formatting (`Rs. 1,50,000`), phone-first Nepali address forms, and guest checkout. eSewa/Khalti wallets and Meilisearch are designed-for but explicitly post-launch.

**How it looks.** A brutalist/editorial reskin of the starter in warm near-black (`ink #0B0B0B`) + warm off-white (`paper #F4F1EA`) with one red accent (`#E10600`): giant Anton condensed ALL-CAPS headlines, mono uppercase eyebrow labels, pill buttons with sliding arrows, stat rows with vertical rules, red/black marquee tickers, oversized stacked brand-link rows, dark split sections with 20px-radius photos, a footer with a giant repeating brand marquee, grayscale editorial photography, and always-full-color product shots. Authenticity ("100% Authentic — Sourced from Authorized Distributors") is a first-class, repeated trust pillar, not a footer badge.

**How it gets built.** The starter's data flow, server actions, routing, and checkout machinery are kept intact; we reskin, extend facets/search, and reseed. Work is split into 7 parallel workstreams with disjoint file ownership: **A** global tokens/fonts/chrome + shared primitives, **B** home page + static trust/legal pages, **C** PLP/search/collections/categories + product card, **D** PDP, **E** cart + checkout, **F** account + orders, **G** backend seed + Nepal commerce config. G runs fully independent (different repo). A's token/primitive layer is the only cross-cutting dependency; its contracts are frozen in §5 so B–F can build in parallel against them.

**Definition of done (launch).** A customer on a phone in Kathmandu can: land on the reskinned home page, search or filter by brand/category/price, open a PDP with nutrition facts and COD/authenticity trust signals, pick Flavor+Size, add to cart, check out as a guest with a Nepali address and phone number, choose a shipping zone, place a COD order, see a confirmation, and review it in their account. Staff manage everything in the Medusa Admin at `:9000/app`.

---

## 2. Conflict resolutions (binding)

Each resolution below overrides the losing doc(s). Numbered R1–R18; cite these in code comments where relevant.

| # | Conflict | Resolution | Rationale |
|---|---|---|---|
| **R1** | **VAT seeding.** 01 §5.1 + 05 §4 say seed tax region `np` @ 13% tax-inclusive; 04 §1.2 says `automatic_taxes: false`, no tax rate, `// TODO(nepal-vat)`. | **Seed the tax region.** Create tax region `np`, default rate **13% named "VAT"**, provider `tp_system`, and set NPR pricing **tax-inclusive** so admin-entered prices = displayed = charged. Seed prices in 04 §6 are the final inclusive amounts — do not change them. **Tripwire:** after seeding, create one test cart (any variant + Inside Valley shipping) and assert total = variant price + 100 exactly; if the pinned Medusa version's tax-inclusive math inflates the total, fall back to 04's no-tax-rate config and change the storefront micro-label to "Prices include VAT" with no breakdown line. | Two docs vs one, and the ops doc's invoice breakdown (05 §4.1) requires a configured rate. The tripwire caps the risk 04 was hedging against. |
| **R2** | **Red hex.** 02: `#E10600`/`#B00500`; 03 §0: "`--pp-red` (#E01F26-ish)". | **`red #E10600`, `red-deep #B00500`.** | 03 explicitly defers tokens to 02. 02 is the design token authority. |
| **R3** | **Black hex.** 02: `ink #0B0B0B`; 03: `#0A0A0A`. | **`ink #0B0B0B`** (and the full 8-token palette from 02 §1). Never pure `#000`/`#fff`. | Same authority rule as R2. |
| **R4** | **NPR formatting.** 02 card example "Rs 7,499" (western grouping, no period); 03 §14A "Rs. 8,500" via `en-IN`/`en-US` grouping; 05 §2.2 lakh/crore grouping with `Rs. ` prefix. | **05 wins: `Rs. ` prefix (with period + space), lakh/crore grouping (`Rs. 1,50,000`), zero decimals, implemented as a custom `formatNPR()` in `src/lib/util/money.ts`** (exact contract in §5.3). Never rely on `Intl` locale grouping for NPR; never mix `Rs.` and `NPR` in UI. | 05 is the market-operations authority and gives the strongest reasoning (how Nepalis read prices; receipts/NRB convention). |
| **R5** | **Money units.** 05 §2.2 says "Medusa stores amounts in the currency's minor unit"; 01 §5.1 + 04 §0 say major units. | **Major units.** `amount: 4200` = Rs. 4,200. `formatNPR` takes whole rupees. Do not multiply by 100 anywhere (except later inside the Khalti provider, which wants paisa — its internal concern). | 01/04 are correct for Medusa v2 pricing; 05's aside is a factual slip. |
| **R6** | **Sales channel name.** 01: "Protein Pasal Web"; 04: "Protein Pasal Online". | **"Protein Pasal Online"** (rename the starter's Default Sales Channel). Publishable key title: **"Protein Pasal Storefront"**. | 04 is the seed-data literal authority; the seed script is what actually writes the name. |
| **R7** | **Shipping option prices.** 01: valley Rs 100, outside "Rs 150–250"; 04: Rs 100 / Rs 250. | **Rs. 100 (Inside Kathmandu Valley) / Rs. 250 (Outside Valley).** Storefront always renders amounts from backend data, never hardcodes. | 04 gives exact figures; 01 gave a range. |
| **R8** | **Outside-valley delivery time.** 03 §14B says 2–5 days; 04 §1.5 and 05 §3.1 say 3–5 days. | **Inside Valley: 1–2 days. Outside Valley: 3–5 days.** Single source strings, reused verbatim on PDP, cart, checkout, footer, order pages. | Majority + ops-doc authority. |
| **R9** | **Free-delivery threshold.** 02 marquee example "over Rs 5000"; 03/04 "over Rs. 10,000" (04 marks the promotion optional). | **Rs. 10,000**, implemented as 04 §1.5's automatic 100%-off-shipping promotion. **Copy gating:** free-delivery messaging (announcement bar, marquees) may only ship if workstream G confirms the promotion seeded successfully; otherwise drop the clause everywhere (announcement bar then reads COD + authenticity only). | Never display a policy the backend doesn't enforce. 02's Rs 5000 was illustrative. |
| **R10** | **Stats-row / hero numeric claims.** 02 examples say "30+ brands"; 03 says "15+ BRANDS, 200+ PRODUCTS". Seed has 8 brands, 24 products, 116 variants. | **Stats row: `8 / GLOBAL BRANDS` · `100+ / SKUS IN STOCK` · `100% / AUTHENTIC`** (optional 4th: `COD / ALL NEPAL`). Hero subline names three brands then "& more world-class brands" — no counts. No invented numbers anywhere. | A trust-first supplement store cannot ship falsifiable claims on day one. |
| **R11** | **Product metadata keys.** 01 §3.2 defines a rich typed schema (`protein_per_serving_g: 24`, `mrp_npr`, …); 04 §6 seeds exactly four string keys: `protein_per_serving`, `servings`, `origin_country`, `flavor_notes`. | **04's four keys are the launch schema.** The PDP nutrition-facts component reads exactly `protein_per_serving`, `servings`, `origin_country`, `flavor_notes` (all strings, render-if-present, hide-if-absent). 01 §3.2 is the **future enrichment schema** — components must tolerate its keys appearing later but must not require them. No `mrp_npr` is seeded ⇒ **no strike-through/compare-at prices at launch**; price components render strike-through only when data exists. | The seed is what's real; the UI must match what will be in the database. |
| **R12** | **Collection description/banner.** 04 provides brand descriptions + banner image URLs, but Medusa v2 collections have no native description/image column. | Seed writes them into collection **`metadata.description`** and **`metadata.banner_image`**. Storefront brand hero reads those keys (03 §6 already expects `metadata.description`; treat `metadata.logo` as optional-absent). 01's extended brand metadata (origin, tagline, is_featured…) is not seeded at launch. | Makes 04's data physically storable and gives C a concrete read contract. |
| **R13** | **Fulfillment naming.** 01: set "Nepal Delivery"; 04: set "Kathmandu Warehouse delivery", zone "All of Nepal". | **04's literals:** fulfillment set `Kathmandu Warehouse delivery` (type `shipping`), service zone `All of Nepal` (`[{ country_code: "np" }]`), provider `manual_manual`, default shipping profile. | Seed-literal authority. |
| **R14** | **PDP product title typography.** 03 §4 wants a "giant `font-display` product title"; 02 §3.2 assigns PLP/PDP titles to `font-body text-h1 font-bold` (Inter, sentence case). | **02 wins: PDP title = Inter `text-h1` bold, sentence case**, with the red mono uppercase brand eyebrow above it. Anton `font-display` stays reserved for marketing surfaces + category/brand header bands (which 02 explicitly allows). | Design-token authority; long SKU names ("Ultimate Nutrition Prostar Whey Protein") in condensed caps are unreadable and hurt purchase accuracy. |
| **R15** | **Brand link-row hover.** 02 §5.7: ink fill sweep with red arrow tip; 03 §1: "red fill/underline sweep". | **Ink fill sweep, text inverts to paper, arrow tip turns red** (02 §5.7 verbatim). Red never becomes a surface tint (02 §1.2). | Design authority + one-accent law. |
| **R16** | **COD payment step UI.** 03 §9: "single selected card"; 05 §1.2: skip selection UI entirely, show a static confirmation block. | **05 wins:** when only one provider is configured, render **no radio/selector** — a static block: "**Pay with Cash on Delivery** — pay the rider when your order arrives. No advance payment needed." Keep the starter's `isManual`/`paymentReady` logic untouched. Build the step provider-agnostic (render whatever the region exposes) so eSewa/Khalti appear as options later with zero rework (01 §9.3). | A one-option radio reads as broken; ops doc owns checkout psychology. |
| **R17** | **Photo radius.** 03 says `rounded-large` (16px, starter scale) for feature photos; 02 defines `rounded-photo` (20px) as the ONLY radius for framed photos. | **`rounded-photo` (20px)** for editorial/lifestyle photos in split sections and feature cards. Product-card image frames stay `rounded-base` (4px). Everything else sharp. | Design-token authority. |
| **R18** | **"Shop by goal" mapping.** 03 §2.5 proposes a "LOSE FAT" goal (whey-isolate/fat-burner) — no such category exists in the 04 catalog. | Four goals, each mapping to a real seeded category: **BUILD MUSCLE →** `/categories/whey-protein` · **GAIN SIZE →** `/categories/mass-gainer` · **TRAIN HARDER →** `/categories/pre-workout` · **RECOVER WELL →** `/categories/bcaa-eaa`. Goals are links, never entities (01 §3.1). | Every home-page link must resolve to a non-empty destination. |

**Additional bindings (no conflict, but previously ambiguous):**

- **Batch/expiry (05 §5.2):** no batch metadata is seeded ⇒ every PDP renders the fallback line as a static labeled row in the nutrition/authenticity area: *"Batch & expiry shown on physical product label; minimum 6 months shelf life guaranteed at time of delivery."* Never silently absent.
- **Category handles** are 04 §3's (`whey-protein`, `mass-gainer`, `creatine`, `pre-workout`, `bcaa-eaa`, `protein-bars-snacks`, `vitamins-health`). All UI links use these — 03's shorthand (`/categories/whey`) is wrong.
- **PAN/VAT footer row:** omit entirely (leave a commented placeholder) until the business supplies a real number (05 §6). Never render an empty slot.
- **Price facet:** approach (a) from 03 §3 — client-side clamp on `calculated_price` within the fetched page, `// TODO price-facet server-side`. Brand/category facets are server-side via `collection_id[]`/`category_id[]`.
- **Search:** launch = Medusa built-in `q=` passthrough (01 §8.4 + 03 §5). Meilisearch is post-launch, triggered by 01 §8.4's criteria.
- **Hero copy:** 03's headline — line 1 **"FUEL YOUR GRIND."**, line 2 **"EVERY BRAND. ONE SHOP."** Exactly one red word: **"GRIND."** Primary CTA red pill "SHOP ALL →" (`/store`), secondary outline-on-dark "BROWSE BRANDS" (`#brands`). Grayscale hero photo + `bg-ink/45` scrim (02 §5.9).
- **WhatsApp/Viber button:** persistent sticky button, rendered in `(main)/layout.tsx`, href from `NEXT_PUBLIC_WHATSAPP_NUMBER` env (placeholder `977XXXXXXXXXX`, `// TODO(business-contact)`). The WhatsApp glyph is the one sanctioned exception to the one-accent icon rule (05 §5.3).
- **Guest checkout stays enabled** (05 §5.3). Phone is the primary, required contact field, softly validated as `9[78]XXXXXXXX` (10 digits).
- **Nepal address mapping (03 §9):** `address_1` = Street/Tole + landmark · `address_2` = Ward No. + Area · `city` = Municipality/City · `province` = Province (dropdown of Nepal's 7) · `postal_code` = optional. District captured within `address_2` or `city` per the checkout agent's field layout — document the chosen mapping in a comment in `shipping-address`.

---

## 3. Canonical values quick-reference

Pull directly; never re-derive. (Merged from 02 §12, 04, 05 §7 with R-numbers applied.)

```
IDENTITY   Store name "Protein Pasal" · wordmark PROTEIN PASAL (Anton caps)
COLORS     ink #0B0B0B · coal #171717 · paper #F4F1EA · fog #E7E3D8
           line #D8D3C6 · ash #6E6A62 · red #E10600 · red-deep #B00500        [R2,R3]
FONTS      display=Anton(400) · body=Inter(var) · mono=Space Mono(400/700), next/font/google
RADIUS     default sharp · pills rounded-full · editorial photos rounded-photo(20px)
           product image frame rounded-base(4px)                               [R17]
MONEY      NPR major units · formatNPR() lakh grouping · "Rs. 1,50,000" · 0 decimals [R4,R5]
TAX        13% VAT, tax-inclusive display everywhere · micro-label "Includes 13% VAT" [R1]
REGION     "Nepal" · npr · ["np"] · payment ["pp_system_default"] (COD)
CHANNEL    "Protein Pasal Online" · publishable key "Protein Pasal Storefront" [R6]
WAREHOUSE  "Kathmandu Warehouse", Balaju Industrial Area, Kathmandu, Bagmati, np, 44600
SHIPPING   set "Kathmandu Warehouse delivery" · zone "All of Nepal" [{country_code:"np"}]
           "Inside Kathmandu Valley" Rs. 100 (1–2 days) · "Outside Valley" Rs. 250 (3–5 days) [R7,R8,R13]
PROMO      auto free-shipping ≥ Rs. 10,000 (optional; gates all free-delivery copy) [R9]
CATALOG    8 collections · 7 categories · 24 products · 116 variants · single Unsplash
           image per product (// TODO(real-photography))
METADATA   product: protein_per_serving · servings · origin_country · flavor_notes  [R11]
           collection: description · banner_image                              [R12]
STATS      8 GLOBAL BRANDS · 100+ SKUS IN STOCK · 100% AUTHENTIC               [R10]
TRUST      "100% Authentic — Sourced from Authorized Distributors" (PDP badge)
           Authenticity page H1: "No fakes. No grey market. Just your supplements, done right."
           Batch/expiry fallback line (see §2) · COD threshold NPR 15,000 = ops SOP, not code
DELIVERY   "Delivered in 1-2 days • Pay on delivery" / "Delivered in 3-5 days • Pay on delivery"
CONTACT    Phone primary+required (9[78]········) · WhatsApp/Viber sticky button · guest checkout ON
GOALS      BUILD MUSCLE→whey-protein · GAIN SIZE→mass-gainer · TRAIN HARDER→pre-workout
           RECOVER WELL→bcaa-eaa                                               [R18]
DEV        backend :9000 (npm run dev) · storefront :8000 (npm run dev) · pg :5432/protein_pasal
ENV GOTCHA seed → copy generated pk_… into storefront/.env.local → restart storefront
```

---

## 4. Build order & workstreams

### 4.0 Sequencing

```
Phase 0  (once):   Postgres up · backend: npx medusa db:migrate
Phase 1  (parallel): G (backend seed)  ∥  A1 (tokens/fonts/globals/primitives)
Phase 2  (parallel): A2 (nav/footer/announcement/side-menu/mini-cart)
                     ∥ B ∥ C ∥ D ∥ E ∥ F   — all five build against §5 contracts
Phase 3  (integration): copy publishable key → storefront env → restart →
                     smoke-test checklist (§6) → fix-forward
```

B–F may start immediately (they import from A's paths per the frozen contracts in §5), but nothing merges before A1 compiles. G never touches the storefront repo; the only handoff is the publishable key value (§6 step 3) and confirmation of the free-shipping promo (R9 copy gate).

**Universal guardrails for every storefront workstream** (from 03 §17, binding):
1. Do not change Medusa queries, server actions, routing, or `searchParams` state except where a task says EXTEND — and keep signatures backward-compatible.
2. Preserve every `data-testid`.
3. Keep `<Suspense>` + skeleton fallbacks wherever the starter has them.
4. No empty grids or dead sections — every list has a designed empty state; featured sections fall back to newest products.
5. Page body never scrolls horizontally; only rails/marquees overflow inside their own containers.
6. Respect `prefers-reduced-motion`.
7. All prices through `formatNPR` — no raw `Intl` output.
8. Brand = Collection, Category = product type, Goals = links. One red accent.
9. Uppercase via CSS only; real casing in DOM/alt/aria.

---

### Workstream A — Global styles, tokens, fonts, layout chrome

**Owns (exclusive):**
```
storefront/tailwind.config.js
storefront/src/styles/globals.css
storefront/src/app/layout.tsx
storefront/src/app/[countryCode]/(main)/layout.tsx        (insert announcement bar, WhatsApp button)
storefront/src/app/not-found.tsx
storefront/src/app/[countryCode]/(main)/not-found.tsx
storefront/src/lib/util/money.ts
storefront/src/modules/layout/**                          (nav, footer, announcement-bar NEW,
                                                           side-menu, cart-dropdown, cart-button)
storefront/src/modules/common/components/marquee/         (NEW)
storefront/src/modules/common/components/pill-button/     (NEW)
storefront/src/modules/common/components/section-label/   (NEW)
storefront/src/modules/common/components/hscroll-rail/    (NEW)
storefront/src/modules/common/components/split-feature/   (NEW)
storefront/src/modules/common/components/trust-badges/    (NEW)
storefront/src/modules/common/components/whatsapp-button/ (NEW)
```

**Checklist (ordered):**
1. **A1 — Tokens & fonts.** Merge 02 §2's `theme.extend` block into `tailwind.config.js` (additive; keep the Medusa preset, existing radii/screens/keyframes). Append 02 §4's global CSS (CSS vars, `.shell`, `.section-y`, marquee mask, image treatments, text-stroke, focus ring, reduced-motion) to `globals.css`. Wire Anton/Inter/Space Mono in `src/app/layout.tsx` exactly per 02 §3.1 (`bg-paper text-ink font-body antialiased` on body). Also retune the `@medusajs/ui-preset` CSS vars (`--fg-base`, `--bg-base`, `--fg-interactive`) toward ink/paper/red so inherited `@medusajs/ui` components pick up the palette (03 §0.2).
2. **A1 — `formatNPR`.** Implement in `money.ts` per §5.3; keep `convertToLocale` exported for non-NPR compatibility.
3. **A1 — Shared primitives.** Build the six common components to the §5.2 contracts, using 02 §5's exact class strings (5.1 pill button, 5.4 marquee, 5.8 split feature, 5.11 chips/badges/icon buttons).
4. **A2 — Header.** REBUILD `modules/layout/templates/nav/index.tsx`: sticky solid-`ink` bar, centered Anton wordmark → `/`, left hamburger + SHOP / BRANDS links, right search input (routes to `/search?q=` — the route itself is C's), ACCOUNT, CART with red count bubble. Preserve `nav-store-link`, `nav-account-link`, `nav-cart-link` testids. Hide the country selector (single region) but keep the regions fetch.
5. **A2 — Announcement bar** (NEW, above nav in `(main)/layout.tsx`): thin red band, mono label text: "CASH ON DELIVERY ALL OVER NEPAL ✱ 100% AUTHENTIC" (+ "✱ FREE DELIVERY OVER Rs. 10,000" only after G confirms the promo — R9).
6. **A2 — Side menu.** RESKIN to solid ink + paper, Anton giant links: SHOP ALL, BRANDS, CATEGORIES (sub-list), ACCOUNT, CART; search field on top. Keep starter logic.
7. **A2 — Mini-cart** (`cart-dropdown`): KEEP logic (hover-open, 5s auto-open); restyle paper panel, "YOUR BAG" header, `formatNPR` subtotal, "VIEW BAG →" + "CHECKOUT →".
8. **A2 — Footer.** REBUILD per 02 §5.10 + 03 §12: trust-badge top strip; link columns SHOP / BRANDS (from `listCollections`) / CATEGORIES (from `listCategories`) / HELP / ACCOUNT; contact row (phone, WhatsApp/Viber, socials, "We accept: Cash on Delivery"); legal row (© year, Privacy/Terms/Returns/Shipping links → B's pages; PAN/VAT row omitted-but-commented); giant alternating solid/`.text-stroke` **PROTEIN PASAL ✦** marquee at the very bottom (first copy real, rest `aria-hidden`). Remove `MedusaCTA`.
9. **A2 — 404s.** REBUILD both `not-found.tsx` files: giant Anton "404 / PAGE NOT FOUND.", "This page skipped leg day.", red "SHOP ALL →" + outline "GO HOME →". No data fetch.
10. **A2 — WhatsApp button** (NEW): fixed bottom-right circular button, `wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}`, `// TODO(business-contact)`.

---

### Workstream B — Home page + static marketing/trust pages

**Owns (exclusive):**
```
storefront/src/app/[countryCode]/(main)/page.tsx
storefront/src/modules/home/**                             (hero REBUILD; intro-statement,
                                                            stats-row, shop-by-goal, brand-list NEW;
                                                            featured-products wrappers REBUILD)
storefront/src/app/[countryCode]/(main)/authenticity/page.tsx   (NEW)
storefront/src/app/[countryCode]/(main)/terms/page.tsx          (NEW)
storefront/src/app/[countryCode]/(main)/privacy/page.tsx        (NEW)
storefront/src/app/[countryCode]/(main)/returns/page.tsx        (NEW)
storefront/src/app/[countryCode]/(main)/shipping/page.tsx       (NEW)
```

**Checklist (ordered):** Build the home page as 03 §2's eleven-section sequence, using A's primitives:
1. Page shell: REBUILD `page.tsx` — fetch `getRegion`, `listCollections({ fields: "id,handle,title,metadata" })`, `listCategories()`, `listProducts` ×2 (newest for Fresh Stock; Best Sellers falls back to newest with a different heading if no signal — never empty). Wrap product grids in `<Suspense>` + `SkeletonProductGrid`.
2. **Hero** (REBUILD): full-bleed grayscale photo, `min-h-[88vh]`, ink scrim, eyebrow "PROTEIN & SPORTS NUTRITION · NEPAL", headline "FUEL YOUR GRIND. / EVERY BRAND. ONE SHOP." (red word "GRIND."), subline, red pill "SHOP ALL →" + outline "BROWSE BRANDS" → `#brands`, COD reassurance microline. Remove the GitHub button.
3. **Intro statement** (NEW): 03 §2.2's fakes/authenticity paragraph on paper.
4. **Stats row** (NEW): `8 / GLOBAL BRANDS · 100+ / SKUS IN STOCK · 100% / AUTHENTIC` per 02 §5.3 (R10).
5. **Red marquee**: category ticker "WHEY ✱ CREATINE ✱ MASS GAINER ✱ PRE-WORKOUT ✱ BCAA ✱ PROTEIN BARS ✱ MULTIVITAMINS" (no price/policy claims here).
6. **Shop by goal** (NEW): 4 `GoalCard`s in an `HScrollRail` (4-up grid desktop), R18 mapping.
7. **Fresh Stock**: titled 8-product grid of newest via `ProductPreview`, "VIEW ALL →" → `/store?sortBy=created_at`.
8. **Brand link-list** (NEW, `id="brands"`): one giant `BrandLinkRow` per collection (dynamic from data, ≤10, ink fill sweep per R15), final row "ALL BRANDS →" → `/store`.
9. **Dark split — authenticity** via `SplitFeature`: "100% GENUINE. NO FAKES." + "HOW WE VERIFY →" → `/authenticity`.
10. **Best sellers rail** (`HScrollRail` of `ProductPreview`) + **trust badge row**.
11. **Static pages**: one shared lightweight template (paper bg, Anton H1, prose). `/authenticity` uses 05 §5.2's real copy (headline "No fakes. No grey market. Just your supplements, done right.", sourcing, seal-check guidance, counterfeit contact path). Terms/Privacy/Returns/Shipping get short real copy reflecting §3 values (COD, zones/ETAs, 7-day sealed-return placeholder policy) — no lorem ipsum, no 404s (05 §6).

---

### Workstream C — PLP, search, collections, categories, product card

**Owns (exclusive):**
```
storefront/src/app/[countryCode]/(main)/store/**
storefront/src/app/[countryCode]/(main)/search/**           (NEW route)
storefront/src/app/[countryCode]/(main)/collections/**
storefront/src/app/[countryCode]/(main)/categories/**
storefront/src/modules/store/**                             (templates, refinement-list REBUILD,
                                                             pagination, empty-state NEW)
storefront/src/modules/collections/**
storefront/src/modules/categories/**
storefront/src/modules/products/components/product-preview/** (card RESKIN — C owns it; B and D import)
storefront/src/modules/products/components/thumbnail/**
storefront/src/lib/data/products.ts                          (EXTEND only, backward-compatible)
storefront/src/lib/data/collections.ts · categories.ts      (EXTEND only if field additions needed)
```

**Checklist (ordered):**
1. **Product card** RESKIN first (B and D consume it): 02 §5.5 verbatim — mono ash brand line (collection title), uppercase 2-line-clamp name, `formatNPR` price, quick-add reveal, full-color image on `bg-fog` `rounded-base`, sale badge only when sale data exists (none at launch, R11). Keep testids.
2. **Data layer** EXTEND `products.ts`: pass `q` through to `/store/products`; widen collection/category params to arrays (`collection_id[]`, `category_id[]`). Signatures stay compatible; `// TODO: swap to Meilisearch`.
3. **RefinementList** REBUILD into a facet panel (URL/searchParams-driven like the starter's sort): Brand checkboxes (from `listCollections`) → `?brand=`, Category checkboxes (from `listCategories`, 04 handles) → `?category=`, Price presets + min/max (Under Rs. 3,000 / 3,000–6,000 / 6,000–10,000 / Over 10,000) → `?minPrice&maxPrice` clamped client-side (approach (a)); active-filter chips + "Clear all"; mobile full-height FILTERS drawer. Sort KEEP-logic/RESKIN.
4. **Store template**: PLP header band ("SHOP / ALL PRODUCTS" + result count), sidebar + grid (2/3/4 cols), RESKIN pagination ("Showing X–Y of N", `PRODUCT_LIMIT = 12`), shared **empty-state** component ("NOTHING HERE — YET." + "CLEAR FILTERS →").
5. **Search** (NEW): `search/page.tsx` reads `searchParams.q`, renders the same store template with `q` passed through; header "RESULTS FOR "{q}""; empty state with popular-category chips. (Nav search box is A's; agree on `/search?q=` only.)
6. **Collection (brand) pages**: brand hero band from `collection.metadata.banner_image` + `metadata.description` (R12), "OFFICIAL RANGE · {N} PRODUCTS" label; facets with brand locked; keep `generateStaticParams`/`generateMetadata`, retitle "{Brand} — Genuine {Brand} supplements in Nepal | Protein Pasal".
7. **Category pages**: Anton header band + `category.description`, child chips in `HScrollRail`, facets with category locked (brand + price + sort).

---

### Workstream D — PDP

**Owns (exclusive):**
```
storefront/src/app/[countryCode]/(main)/products/[handle]/**
storefront/src/modules/products/templates/**                (index, product-info)
storefront/src/modules/products/components/**  EXCEPT product-preview & thumbnail (C's):
    image-gallery · product-actions · product-price · product-tabs ·
    related-products · breadcrumb (NEW) · nutrition-facts (NEW)
    product-onboarding-cta → REMOVE from render
```

**Checklist (ordered):**
1. **Template** RESKIN (keep grid/skeleton/data): add breadcrumb `Home / {Brand} / {Category} / {Title}` (mono label, links to collection + category with 04 handles).
2. **Buy box**: red mono brand eyebrow → collection page; title = Inter `text-h1` bold (R14); `formatNPR` price + "Includes 13% VAT" micro-label (R1); Flavor + Size tile selectors (RESKIN `OptionSelect`: uppercase chips, selected = ink fill; keep all variant/in-stock logic and `MobileActions` — restyled ink bar + red button); full-width red "ADD TO CART"; compact `TrustBadgeRow` + the "100% Authentic — Sourced from Authorized Distributors" badge beneath.
3. **Nutrition facts** (NEW): spec-sheet table (ink header, fog zebra, mono values) reading exactly `metadata.protein_per_serving`, `metadata.servings`, `metadata.origin_country`, `metadata.flavor_notes` (R11), plus Brand/Category/Weight from product data, plus the static batch/expiry fallback row (§2).
4. **Tabs** REBUILD content: Description · How to Use · Ingredients · Delivery & COD (zone strings from §3) · Authenticity (links `/authenticity`). Drop apparel tabs.
5. **Delivery strip**: "Inside Kathmandu Valley: 1–2 days · Outside Valley: 3–5 days · Cash on Delivery nationwide · flat shipping at checkout" (R8).
6. **Authenticity split** (compact `SplitFeature` from A) + **related products** (KEEP logic, retitle "MORE FROM {BRAND}", cards come from C's `ProductPreview`).

---

### Workstream E — Cart + checkout

**Owns (exclusive):**
```
storefront/src/app/[countryCode]/(main)/cart/**
storefront/src/app/[countryCode]/(checkout)/**
storefront/src/modules/cart/**                              (NOT cart-dropdown — that's A's)
storefront/src/modules/checkout/**
storefront/src/modules/common/components/cart-totals/**
```

**Checklist (ordered):**
1. **Cart page** RESKIN (keep 2-col logic): line items (thumb `rounded-base`, flavor/size, qty select, `formatNPR`, red REMOVE); summary with `formatNPR` totals + "Includes 13% VAT" + "Shipping calculated at checkout · COD available"; red "PROCEED TO CHECKOUT →"; compact trust badges; keep `discount-code`. Empty cart: "YOUR BAG IS EMPTY." + red "SHOP ALL →" + trust row. RESKIN sign-in prompt.
2. **Checkout chrome** RESKIN: minimal header (wordmark, "SECURE CHECKOUT", back-to-cart); keep step machinery (`?step=`) untouched.
3. **Addresses — Nepal-first**: country pre-selected NP; field order Full Name → **Phone (required, first, validated 9[78]········)** → Province (7-province dropdown) → District → Municipality/City → Ward No. → Street/Tole + Landmark → postal optional. Map to Medusa fields per §2's binding and document the mapping in a comment. Guest checkout stays.
4. **Shipping step** RESKIN (KEEP logic): render `availableShippingMethods` as two radio cards, amounts from data via `formatNPR`, helper text keyed off option name ("1–2 days" / "3–5 days" — R8). Never hardcode Rs amounts.
5. **Payment step** (R16): no selector — static COD confirmation block; keep `isManual`/`paymentReady`; leave a commented provider-agnostic placeholder for eSewa/Khalti. Stripe path stays unexercised (`NEXT_PUBLIC_STRIPE_KEY` empty).
6. **Review**: red "PLACE ORDER (COD) →", total in NPR, zone + ETA, "🔒 No online payment needed — pay cash on delivery." persistent through all steps.
7. **Cart-totals**: `formatNPR` everywhere + itemized breakdown when tax data exists (Subtotal excl. VAT / VAT 13% / Shipping / Total incl. VAT — 05 §4.1; degrade gracefully under R1's fallback).

---

### Workstream F — Account + orders

**Owns (exclusive):**
```
storefront/src/app/[countryCode]/(main)/account/**
storefront/src/app/[countryCode]/(main)/order/**            (incl. confirmation route)
storefront/src/modules/account/**
storefront/src/modules/order/**                             (incl. order-completed-template)
```

**Checklist (ordered):**
1. Login/register RESKIN: "WELCOME BACK" / "JOIN PROTEIN PASAL", phone collected at register; keep server actions and parallel routes (`@login`/`@dashboard`).
2. Account layout/nav: uppercase left nav (Overview, Orders, Addresses, Profile, Log out), active = red; mobile top tabs.
3. Overview: "NAMASTE, {name}", order count, recent order card.
4. Orders list + details: `formatNPR`, status badge, "VIEW ORDER →"; details show payment = Cash on Delivery, address, itemized totals; `help` block → WhatsApp/phone. Empty: "NO ORDERS YET." + "SHOP ALL →".
5. Addresses: Nepal field set matching E's checkout mapping (province/district/ward); keep add/edit/delete actions.
6. Profile: phone prominent; keep all logic.
7. **Order confirmation** (`order-completed-template`) RESKIN: "ORDER CONFIRMED!", order #, "We'll call you shortly to confirm your Cash-on-Delivery order.", COD amount due restated (05 §1.2), items/totals in NPR, zone + ETA, "CONTINUE SHOPPING →" + "VIEW ORDER →", trust row. Keep `retrieveOrder` + skeletons.

---

### Workstream G — Backend: seed + Nepal commerce config

**Owns (exclusive):**
```
backend/src/scripts/seed.ts                                  (full rewrite)
backend/medusa-config.ts                                     (only if needed — default: untouched)
backend/.env                                                  (already correct for dev)
```
Deliverables also include: the logged publishable key value, an admin user, and a written confirmation of whether the free-shipping promo seeded (feeds R9's copy gate).

**Checklist (ordered — mirrors 04 §8 with R1/R6/R12/R13 applied):**
1. Idempotent seed skeleton: look up every entity by handle/name, create-if-missing; strip/gate the Europe demo data (region, t-shirts) so no mixed catalog survives.
2. Store settings: default + supported currency `npr`.
3. Region "Nepal" (`npr`, `["np"]`, `payment_providers: ["pp_system_default"]`).
4. **Tax (R1):** tax region `np`, 13% default rate "VAT", NPR pricing tax-inclusive; leave 04's prices as final amounts. Run the R1 tripwire cart-math check; on failure, revert to no-tax-rate + report to the orchestrator.
5. Sales channel: rename default → **"Protein Pasal Online"**; create publishable key **"Protein Pasal Storefront"** scoped to it; **log the `pk_…` value at the end of the run**.
6. Stock location "Kathmandu Warehouse" (04 §1.4 address), link to channel.
7. Fulfillment set "Kathmandu Warehouse delivery" → zone "All of Nepal" (`np`) → two flat options: Inside Kathmandu Valley **Rs. 100**, Outside Valley **Rs. 250** (`manual_manual`, default shipping profile).
8. Optional promo: automatic 100%-off shipping at `item_total ≥ 10000`; if the pinned Promotions API resists, skip with `// TODO(free-shipping-threshold)` and report "not seeded".
9. 8 brand collections (04 §2) with `metadata.description` + `metadata.banner_image` (04 §5.1 URLs, `// TODO(real-photography)`) (R12).
10. 7 categories (04 §3), top-level, published.
11. 24 products (04 §6, transcribe exactly): options → all Flavor×Size variants (vitamins Size-only), SKUs per pattern, weights + inventory from 04 §4, NPR prices from per-product tables, image (04 §5.2), `collection_id`, `category_ids`, `status: published`, channel + shipping profile links, metadata (R11 keys).
12. Inventory: `inventory_item` + `inventory_level` at Kathmandu Warehouse per 04 §4 quantities.
13. **Acceptance asserts in-script:** 8 collections · 7 categories · 24 products · **116 variants** · every variant has an NPR price and an inventory level · publishable key exists. Log a summary table.
14. Create admin user: `npx medusa user -e admin@proteinpasal.com -p <pw>` (document the command; do not commit the password).

---

## 5. Cross-workstream contracts (frozen — build against these)

### 5.1 Import paths
Primitives live at `@modules/common/components/{marquee|pill-button|section-label|hscroll-rail|split-feature|trust-badges}` (starter path-alias conventions). Product card: `@modules/products/components/product-preview`. Money: `@lib/util/money`.

### 5.2 Primitive props (A implements; B–F consume)

```ts
// Marquee
{ items: string[]; variant?: "red" | "black" | "outline"; speed?: "normal" | "fast";
  separator?: string /* default "✦" */; className?: string }
// PillButton  (wraps LocalizedClientLink when href given, else <button>)
{ href?: string; variant: "primary" | "inverse" | "red" | "outline" | "outline-dark";
  arrow?: boolean /* default true */; children: React.ReactNode; className?: string;
  "data-testid"?: string }
// SectionLabel
{ children: React.ReactNode; tone?: "red" | "ash" | "paper"; className?: string }
// HScrollRail
{ children: React.ReactNode; itemClassName?: string /* default "w-[78vw] xsmall:w-[340px]" */ }
// SplitFeature
{ eyebrow: string; title: string; body?: string; cta?: { label: string; href: string };
  imageSrc: string; imageAlt?: string; reverse?: boolean; compact?: boolean }
// TrustBadgeRow  (default 4 badges: COD · 100% Authentic · Fast Nationwide Delivery · Easy Returns)
{ compact?: boolean; items?: { icon: React.ReactNode; label: string }[] }
```

### 5.3 Money

```ts
// src/lib/util/money.ts  (A implements)
// amount = whole NPR rupees (Medusa major units — R5). Lakh/crore grouping (R4).
// formatNPR(4500)   -> "Rs. 4,500"
// formatNPR(150000) -> "Rs. 1,50,000"
export function formatNPR(amount: number): string
```
All price surfaces (card, PDP, cart, mini-cart, checkout, order, account) call `formatNPR`. Non-NPR fallback: keep the starter's `convertToLocale`.

### 5.4 Data contracts
- Product metadata (R11): `protein_per_serving`, `servings`, `origin_country`, `flavor_notes` — strings, all optional at render time.
- Collection metadata (R12): `description`, `banner_image` — strings, optional at render time.
- URL contracts: search = `/search?q=`; PLP facets = `?brand=&category=&minPrice=&maxPrice=&sortBy=&page=`; category/collection routes use 04's handles.
- Delivery strings (R8) and trust copy come verbatim from §3 — no paraphrasing across pages.

---

## 6. Integration & acceptance (Phase 3)

**Bring-up sequence (Windows, PowerShell, no Docker):**
1. Postgres 18 running; DB `protein_pasal` exists (owner `postgres`).
2. `backend>` `npx medusa db:migrate`
3. `backend>` `npm run seed` → note the logged `pk_…` and the promo-seeded yes/no.
4. `backend>` `npx medusa user -e admin@proteinpasal.com -p <pw>`
5. `backend>` `npm run dev` → verify `http://localhost:9000/app` login.
6. Copy `pk_…` into `storefront/.env.local` `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (replaces `pk_test` — the storefront 401s on every Store call until this is done), then (re)start `storefront>` `npm run dev`.
7. If the promo did **not** seed: strip free-delivery copy from announcement bar/marquees (R9).

**Smoke tests (all must pass before calling launch-ready):**
1. `http://localhost:8000/np` renders the full 11-section home; no horizontal body scroll at 375px/768px/1440px; marquees pause on hover and stop under reduced motion.
2. PLP: brand + category + price filters compose and survive reload (URL-driven); sort works; pagination shows "Showing X–Y of N"; zero-result state renders designed empty state.
3. `/np/search?q=whey` returns whey products; `q=wey` gracefully returns the designed empty state (typo tolerance is a documented non-goal at launch).
4. Brand page (`/np/collections/optimum-nutrition`) shows hero band from metadata + brand-locked facets; category page (`/np/categories/whey-protein`) shows header band + child chips.
5. PDP: variant matrix works (e.g. ON Gold Standard: 3 flavors × 2 sizes); price shows `Rs. 6,200` / `Rs. 21,500`; nutrition table renders the four metadata keys + batch/expiry fallback; add-to-cart reserves stock.
6. Cart → checkout as **guest**: Nepali address form (phone required + validated), both shipping options render from backend data at Rs. 100/Rs. 250, payment step shows the static COD block (no radio), order completes, confirmation restates COD amount due.
7. Order total math: total = Σ(variant prices) + shipping exactly (R1 tripwire, verified in UI); order summary shows the VAT breakdown line.
8. Register an account, place an order, see it under Account → Orders with NPR totals and COD payment details.
9. Admin `:9000/app`: order appears; staff can mark payment captured (COD collected) and create fulfillment.
10. Every price on every surface is `Rs.`-lakh-formatted; no "NPR", no `₨`, no decimals; no green/amber UI anywhere; all `data-testid`s from the starter still present on reskinned components.

**Explicit non-goals at launch (do not build):** eSewa/Khalti (design per 01 §9 / 05 §1.3), Meilisearch, SMS notifications (Sparrow), NCM/Pathao fulfillment integrations, email notification provider, admin metadata widgets, Nepali i18n, valley geo-fencing, price-list sale campaigns, Redis/S3 (prod-only per 01 §7).

*End of 00-master-plan.md*
