# 03 — UX & Page-by-Page Spec (Protein Pasal)

> **Scope of this document.** Structure, section order, copy, and the keep/reskin/rebuild decision for every page and shared component. This maps the reference-image anatomy (brutalist/editorial creator landing page) onto a real Medusa v2 e-commerce storefront. It does **not** redefine design tokens (colours, type scale, spacing) — those live in the design-system doc (`02-*`). Where a token is named here (e.g. `--pp-red`, `font-display`), treat it as a reference to that doc.
>
> **Golden rule for implementers:** *Keep the starter's data flow. Change structure, copy, and CSS classes — not the Medusa queries, server actions, or routing.* Every page below already exists in `medusajs/nextjs-starter-medusa`; we are reskinning and inserting sections, not re-architecting.

---

## 0. Conventions used in this doc

**Decision tags** (applied per component):

- **KEEP** — use starter file as-is; do not touch (logic + markup fine, inherits global restyle).
- **RESKIN** — same file, same data/logic/props; rewrite Tailwind classes + copy only. No structural JSX changes beyond wrappers.
- **REBUILD** — replace the markup substantially or author a brand-new component. Data source noted.
- **NEW** — component/section does not exist in the starter; author from scratch.

**Repo root for all paths below:** `E:\CLI\protein-pasal\storefront\src`

**Design language shorthand** (full definitions in design-system doc):
- `font-display` = ultra-bold condensed sans (Anton / Archivo Black class), ALL-CAPS, tight tracking, used for hero + section headers + giant marquees.
- `font-body` = clean sans (Inter, already the starter default) for paragraphs, prices, form fields.
- `label` = tiny UPPERCASE letterspaced eyebrow (11–12px, `tracking-[0.2em]`).
- Palette: **black `#0A0A0A`**, **off-white `#F4F1EA`**, single accent **red `--pp-red` (#E01F26-ish)**. Red is used sparingly: marquee bg, CTA arrows/hovers, price-drop/sale, active states, focus rings.
- `content-container` = starter's existing max-width + horizontal padding utility (keep using it for aligned sections). Full-bleed sections deliberately break out of it.

**Global reskin prerequisites** (done once in the design-system/layout task, assumed complete before page work):
1. `tailwind.config.js` → add `fontFamily.display`, brand colour tokens, condensed display sizes.
2. `src/styles/globals.css` → set body to off-white/black; import fonts; add `.marquee`, `.pp-pill-btn`, `.pp-ticker` utilities; retune `@medusajs/ui-preset` CSS vars (`--fg-base`, `--bg-base`, `--fg-interactive`) to the black/off-white/red system so all inherited `@medusajs/ui` `Button`/`Text`/`Heading` pick it up for free.
3. Money helper (see §14) added to `src/lib/util/money.ts`.

---

## 1. Reusable building blocks (author these FIRST)

These are the "creator landing page" primitives reused across pages. Build them once under `src/modules/common/components/` (or `src/modules/home/components/` where home-only) so every page composes them. Each is **NEW** unless noted.

| Component | Path (proposed) | Purpose | Notes |
|---|---|---|---|
| `Marquee` | `common/components/marquee/index.tsx` | Infinite horizontal scroll ticker | CSS `@keyframes` translateX; duplicate children 2× for seamless loop; `prefers-reduced-motion` → static. Props: `items: string[]`, `variant: "red" \| "black" \| "outline"`, `speed`, `separator` (default a small ● or ✱ glyph). |
| `PillButton` | `common/components/pill-button/index.tsx` | Rounded-full CTA with trailing arrow glyph `→` | Variants: `solid-black`, `solid-red`, `outline`. Wraps `LocalizedClientLink`. Arrow translates-x on hover. |
| `SectionLabel` | `common/components/section-label/index.tsx` | Tiny uppercase eyebrow | `<span class="label">`. |
| `StatItem` / `StatsRow` | `home/components/stats-row/index.tsx` | Huge numbers separated by vertical rules | Flex row, `divide-x`; each item: giant `font-display` number + small uppercase caption. Responsive: stack 2-col on mobile with horizontal rules. |
| `GoalCard` | `home/components/shop-by-goal/goal-card.tsx` | Square photo card w/ uppercase label + arrow | Used in horizontal scroll rail. |
| `HScrollRail` | `common/components/hscroll-rail/index.tsx` | Horizontal snap-scroll container | `overflow-x-auto snap-x`, hidden scrollbar, edge fade. Wraps goal cards / product cards / brand tiles. Must scroll inside itself; page never scrolls horizontally. |
| `BrandLinkRow` | `home/components/brand-list/brand-row.tsx` | Oversized stacked text-row link (giant brand name → collection) | Full-width row, `font-display` brand name left, `→` right, red fill/underline sweep on hover, thin divider between rows. |
| `SplitFeature` | `common/components/split-feature/index.tsx` | Dark section: giant headline one side, rounded-corner photo other | Reused for "100% GENUINE" + PDP trust. |
| `TrustBadgeRow` | `common/components/trust-badges/index.tsx` | Row of icon + label trust signals | COD / Authentic / Fast Delivery / Easy Returns. Reused on home, PDP, cart, footer-top. |

> These primitives are the backbone. Home is ~80% composition of these; other pages borrow `Marquee`, `PillButton`, `TrustBadgeRow`, `SplitFeature`.

---

## 2. HOME — `/[countryCode]/(main)/page.tsx`

**Starter today:** `<Hero />` + a `py-12` list rendering `<FeaturedProducts />` (one product rail per collection). That's it. We replace the page body with a composed sequence of sections. **REBUILD the page** (`app/[countryCode]/(main)/page.tsx`) to fetch what sections need and render them in order.

**Data to fetch in the page server component** (extend existing calls, keep the pattern):
- `getRegion(countryCode)` — KEEP (needed for prices).
- `listCollections({ fields: "id, handle, title, metadata" })` — brands, for brand link-list + featured rails.
- `listCategories()` — for "shop by goal" mapping and nav parity.
- `listProducts(...)` twice (or with sort) for **Fresh Stock** (sort `created_at`) and **Best Sellers** (sort by a `metadata.bestseller` flag or fallback to a curated collection handle `best-sellers`). If no best-seller signal exists at seed time, reuse newest with a different heading — never render an empty section.

### Section order (top → bottom)

1. **HERO** — `modules/home/components/hero/index.tsx` → **REBUILD**.
   - Full-bleed dark gym/athlete photo, `h-[88vh]` desktop / `h-[80vh]` mobile, black overlay gradient (`bg-black/55`) for text legibility.
   - Tiny red `SectionLabel`: `PROTEIN & SPORTS NUTRITION · NEPAL`.
   - Giant centered `font-display` headline, 2 lines: **"FUEL YOUR GRIND."** with second line **"EVERY BRAND. ONE SHOP."** (clamp `text-[13vw] leading-[0.9]`).
   - Sub-line (body): "Genuine whey, mass gainers, creatine & more — delivered across Nepal. Cash on Delivery everywhere."
   - Two `PillButton`s: primary solid-red **"SHOP ALL →"** (`/store`), outline **"BROWSE BRANDS →"** (anchors to brand list `#brands`).
   - Optional tiny COD reassurance under buttons: "✓ COD all over Nepal   ✓ 100% Authentic".
   - Remove the GitHub button entirely.

2. **INTRO STATEMENT BLOCK** — **NEW** (`home/components/intro-statement`).
   - Off-white section, `content-container`, generous vertical padding.
   - Left small `label`: `WHY PROTEIN PASAL`. Large `font-display`-ish (or bold body 28–40px) statement, max ~2 lines: **"Nepal's supplements are full of fakes. We're not. Every tub is sealed, sourced, and verified — from the brands lifters actually trust."**
   - Keep it a single bold paragraph; no image.

3. **STATS ROW** — `StatsRow` **NEW**.
   - Three stats, vertical rules between: **15+ / BRANDS**, **200+ / PRODUCTS**, **100% / AUTHENTIC**. (A 4th optional: **COD / ALL NEPAL**.)
   - Black or off-white band (alternate from section above). Numbers in `font-display`, captions in `label`.

4. **RED MARQUEE TICKER** — `Marquee` variant `red` **NEW**.
   - Full-bleed red band, off-white `font-display` uppercase items, small ✱ separators:
     `WHEY ✱ CREATINE ✱ MASS GAINER ✱ PRE-WORKOUT ✱ BCAA ✱ PROTEIN BARS ✱ MULTIVITAMINS ✱` (loop).
   - Slight negative-rotate optional; keep straight for e-comm clarity.

5. **SHOP BY GOAL** — `HScrollRail` of `GoalCard`s **NEW** (`home/components/shop-by-goal`).
   - `label`: `SHOP BY GOAL`. Heading: **"WHAT ARE YOU TRAINING FOR?"**
   - 4 cards (photo + uppercase label + `→`), each links to a curated `/store?goal=` filter or a category/collection:
     - **BUILD MUSCLE** → whey + mass-gainer categories (link `/categories/whey` or a `?category=` multi-filter).
     - **LOSE FAT** → whey-isolate / fat-burner.
     - **PERFORMANCE** → pre-workout + creatine + BCAA.
     - **WELLNESS** → multivitamins + protein bars.
   - Cards scroll horizontally on mobile, 4-up grid on desktop.
   - *Implementation note:* "goal" is a merchandising concept, not a Medusa entity. Map each goal to a concrete destination (a real category handle or a `/store` link with pre-applied category filter query). Document the mapping in the seed doc so links resolve.

6. **FRESH STOCK (featured grid)** — reuse `ProductPreview`, **REBUILD** the rail wrapper.
   - Replace `featured-products` collection-loop with a single titled grid.
   - `label`: `JUST LANDED`. Heading: **"FRESH STOCK"** + `InteractiveLink`-style "VIEW ALL →" to `/store?sortBy=created_at`.
   - Grid of 8 newest products via `ProductPreview` (RESKIN, see §4 card spec). 2-col mobile / 4-col desktop.

7. **BRAND LINK-LIST** — `BrandLinkRow` stack **NEW** (`home/components/brand-list`), `id="brands"`.
   - `label`: `THE ROSTER`. Heading: **"BRANDS WE CARRY"**.
   - One giant row per brand collection (data: `listCollections`), e.g. **OPTIMUM NUTRITION**, **MUSCLEBLAZE**, **DYMATIZE**, **MYPROTEIN**, **GNC**, **ULTIMATE NUTRITION**, **RULE 1**, **KAGED**, **APPLIED NUTRITION** → each links to `/collections/{handle}`.
   - Render dynamically from collections (don't hardcode); fall back gracefully if a brand is missing. Cap the giant list at ~10 and add a final row **"ALL BRANDS →"** to `/store`.

8. **DARK SPLIT — AUTHENTICITY PROMISE** — `SplitFeature` **NEW**.
   - Black full-width section. Left: `label` `OUR PROMISE`, giant `font-display` **"100% GENUINE. NO FAKES."**, body copy about sealed imports / batch codes / QR verification, `PillButton` outline **"HOW WE VERIFY →"** (links to `/authenticity` static page or scrolls to FAQ; if page not built, link to a `#` anchor and note as backlog).
   - Right: rounded-corner (`rounded-large`) photo of sealed tubs / warehouse.

9. **BEST SELLERS ROW** — `HScrollRail` of `ProductPreview` **REBUILD wrapper**.
   - `label`: `MOVING FAST`. Heading: **"BEST SELLERS"** + "VIEW ALL →".
   - Horizontal scroll of product cards (desktop can be a rail or a 4-up grid; mobile snap-scroll).

10. **TRUST BADGE ROW** — `TrustBadgeRow` **NEW**.
    - 4 icon+label badges: **CASH ON DELIVERY**, **100% AUTHENTIC**, **FAST NATIONWIDE DELIVERY**, **EASY RETURNS**. Off-white band.

11. **FOOTER** (shared, see §12) — includes the giant repeating brand-name marquee at the very bottom.

**Home performance note:** all data fetching stays server-side (RSC) as in starter; wrap the two product grids in `<Suspense>` with the existing `SkeletonProductGrid` so the hero/marquee paint instantly.

---

## 3. STORE / PLP — `/[countryCode]/(main)/store` → `modules/store/templates/index.tsx`

**Biggest functional gap in the starter.** Today `RefinementList` renders **sort only**. To hit the "Amazon-quality" bar we must add **brand, category, and price filters**. Data flow stays URL-driven (searchParams) exactly like the starter's sort.

**Decisions:**
- `store/templates/index.tsx` — **RESKIN + REBUILD layout.** Two-column: left filter sidebar (sticky on desktop, collapsible drawer on mobile), right results.
- `store/templates/paginated-products.tsx` — **RESKIN + EXTEND.** It already accepts `collection_id`, `category_id`, `id` in `queryParams`; extend to also pass **multiple** `collection_id`/`category_id` (arrays already supported) and add price bounds. Pass new params down from the page.
- `store/components/refinement-list/index.tsx` — **REBUILD** into a full facet panel; keep the `useRouter`/`searchParams` mechanism.
- `store/components/refinement-list/sort-products` — **KEEP logic, RESKIN** the radio group.
- `store/components/pagination` — **RESKIN.**
- `store/page.tsx` — **EXTEND** `searchParams` type to include `brand`, `category`, `minPrice`, `maxPrice`, `q`, and forward them.

### Section order

1. **PLP HEADER BAND** — **NEW** small band: `label` `SHOP` + heading **"ALL PRODUCTS"** (or reused for category/brand/search headers). Result count: "48 products". Sort dropdown top-right on mobile.
2. **FILTER SIDEBAR** (`RefinementList` REBUILT):
   - **Brand** (collections): checkbox list from `listCollections`, multi-select → `?brand=on,muscleblaze`. Show count per brand if cheap; else omit.
   - **Category** (product type): checkbox list from `listCategories` (Whey, Mass Gainer, Creatine, Pre-Workout, BCAA/EAA, Protein Bars, Multivitamins) → `?category=whey,creatine`.
   - **Price** (NPR): min/max numeric inputs + a few preset ranges ("Under Rs. 3,000", "Rs. 3,000–6,000", "Rs. 6,000–10,000", "Over Rs. 10,000") → `?minPrice=&maxPrice=`. Client-side maps to Medusa price filtering (see impl note).
   - **Active-filter chips** row above grid: each selected facet as a removable pill; "Clear all" link.
   - Mobile: filters live behind a **"FILTERS"** button opening a full-height drawer (reuse `@medusajs/ui` or headless `Popover`/`Dialog`); apply/clear footer.
3. **SORT** — RESKINNED radio/dropdown: Latest Arrivals / Price ↑ / Price ↓ (starter options, relabeled uppercase). On mobile, sort is a compact `native-select`.
4. **PRODUCT GRID** — `ProductPreview` cards (see §4). 2-col mobile / 3 `small` / 4 `medium`. Preserve `<Suspense>` + `SkeletonProductGrid`.
5. **PAGINATION** — RESKINNED. Keep starter's `PRODUCT_LIMIT = 12` + numbered pages. Add "Showing X–Y of N".
6. **EMPTY STATE** — **NEW.** When zero results: off-white centered block, `font-display` **"NOTHING HERE — YET."**, body "No products match these filters.", `PillButton` **"CLEAR FILTERS →"**. Never render a bare empty grid.

**Impl note (price filtering):** Medusa v2 `listProductsWithSort` doesn't take arbitrary price-range params directly. Two acceptable approaches, pick per backend agent's capabilities:
(a) fetch the page then filter/clamp by `calculated_price` client-side within the returned set (simplest, acceptable for launch catalog size), **or**
(b) add a price-range query to the products data function. Default to **(a)** for launch; leave a `// TODO price-facet server-side` marker. The **brand/category** facets must be server-side (they already are via `collection_id`/`category_id`).

**Impl note (brand+category simultaneously):** `paginated-products` already accepts both `collectionId` and `categoryId`; widen the props to arrays (`collectionIds`, `categoryIds`) and spread into `queryParams`. This lets brand-page + category-filter combine.

---

## 4. PDP — `/[countryCode]/(main)/products/[handle]` → `modules/products/templates/index.tsx`

**Starter is a 3-column layout** (info+tabs sticky left, gallery center, actions sticky right). Keep the responsive skeleton and all data/logic (`ProductActions`, variant selection, `addToCart`). **RESKIN heavily** and **restructure the info** for supplements.

**Decisions per component:**
- `products/templates/index.tsx` — **RESKIN** (grid stays; restyle spacing, add breadcrumb + trust strip + nutrition block).
- `image-gallery` — **RESKIN** (off-white frame, `rounded-large`, thumbnail strip; supplements usually 1–3 images — center single image, don't force a tall stack on mobile).
- `product-info` (`templates/product-info`) — **RESKIN + EXTEND.** Add prominent **brand label** (already links `product.collection` → collection; make it the red uppercase `label` line above the title), giant `font-display` product title, short description.
- `product-actions` — **RESKIN, KEEP logic.** Variant selectors = **flavor** + **size** (maps to `product.options`). Relabel `OptionSelect` chips as pill/tile selectors (uppercase, selected = black fill / red ring). Keep add-to-cart, in-stock logic, `MobileActions` sticky bar (RESKIN to black bar w/ red button).
- `product-price` — **RESKIN**, format NPR (`Rs. 8,500`), show strike-through compare-at if present, red "SAVE Rs. X" pill.
- `product-tabs` — **REBUILD content.** Starter's "Material / Country of origin / Dimensions / Shipping & Returns / Easy exchanges" is apparel-oriented and mostly wrong for supplements. Replace with supplement-appropriate accordion (see nutrition block below).
- `related-products` — **KEEP logic, RESKIN** to the product card + rail styling; retitle **"PAIRS WELL WITH"** / **"MORE FROM {BRAND}"**.
- `product-onboarding-cta` — **REMOVE** from render (starter dev artifact).

### Section order

1. **BREADCRUMB** — **NEW** small: `Home / {Brand} / {Category} / {Title}` (uppercase `label`, red on hover). Links to collection + category.
2. **MAIN GRID (2-col desktop):**
   - **Left/center — GALLERY** (`image-gallery` RESKIN).
   - **Right — BUY BOX** (sticky): brand `label` (red, → collection) · `font-display` **TITLE** · rating stub (optional, skip if no reviews) · **NPR price** (`Rs. 8,500`, compare-at strike + SAVE pill) · **variant selectors** (Flavor tiles, Size tiles) · quantity (starter adds qty 1; keep simple) · big **ADD TO CART** (red, full-width) · under it a compact `TrustBadgeRow` (COD · Authentic · Delivery). · short bullet highlights (3–4 `✓` lines) pulled from description or `metadata`.
3. **NUTRITION / SERVING METADATA TABLE** — **NEW** (`products/components/nutrition-facts`).
   - A clean spec table styled like a supplement label: **Serving Size, Servings Per Container, Protein per serving, Calories, Carbs, Sugar, Fat, BCAAs, Added creatine**, etc.
   - Source: `product.metadata` keys populated by the seed (e.g. `metadata.protein_g`, `metadata.serving_size`, `metadata.servings`, `metadata.flavor_list`). Render only keys present; hide empties. Also surface **Brand, Category/Type, Country of Origin, Weight/Net Qty** here (reusing what `product-tabs` info tab had, but as a proper table).
   - Visual: black header row, off-white zebra rows, monospace-ish numbers.
4. **PRODUCT DETAILS ACCORDION** (`product-tabs` REBUILD): tabs → **"Description"**, **"How to Use / Directions"**, **"Ingredients"**, **"Delivery & COD"** (see §14 copy), **"Authenticity"**. Content from description/metadata; the Delivery + Authenticity tabs use shared static copy.
5. **DELIVERY INFO STRIP** — **NEW** inline block near buy box or as its own band: "🚚 **Inside Kathmandu Valley:** delivered in 1–2 days.  **Outside Valley:** 2–5 days.  **Cash on Delivery** available nationwide.  Flat shipping shown at checkout." (Values echo the shipping zones; keep in sync with checkout.)
6. **AUTHENTICITY SPLIT** — reuse `SplitFeature` compact variant: "100% GENUINE — SEALED & SOURCED" reassurance.
7. **RELATED PRODUCTS** — `related-products` RESKIN, retitled.

---

## 5. SEARCH RESULTS — **NEW ROUTE** `/[countryCode]/(main)/search`

**Starter has no search.** Build a minimal, dependency-free search that reuses the store PLP shell so it looks native.

**Approach (no external search engine for launch):** server-side keyword search over products via the products list endpoint using the `q` query param supported by Medusa's product listing (title/description match). Add a `search` route + a search box in the nav.

- **Route:** `app/[countryCode]/(main)/search/page.tsx` **NEW**. Reads `searchParams.q` (+ optional sort/filters). Calls the products data function with `q`. Renders the **same `StoreTemplate` layout** (facets + grid) so search inherits filters/sort/pagination for free — pass `q` through to `paginated-products`.
- **Search box:** in nav (see §11) — an input that on submit routes to `/search?q=...`. Optionally an instant-search dropdown later; for launch, submit-to-page is enough.
- **Header band:** `label` `SEARCH` + heading **"RESULTS FOR "{q}""** + result count.
- **Empty state:** **NEW** — `font-display` **"NO MATCHES FOR "{q}"."** + suggestions: popular categories chips (Whey / Creatine / Pre-Workout) + `PillButton` "BROWSE ALL →".
- **Impl note:** if the products data function needs a `q` passthrough, add it in `src/lib/data/products.ts` (thin extension, keep signature compatible). Leave a `// TODO: swap to MeiliSearch/Algolia` marker for post-launch. Do **not** block launch on a search engine.

---

## 6. COLLECTION (BRAND) PAGES — `/[countryCode]/(main)/collections/[handle]` → `modules/collections/templates/index.tsx`

**Brands = Medusa Collections.** Starter template is a sidebar-sort + grid. **RESKIN + add a brand hero band.**

- `collections/templates/index.tsx` — **RESKIN + EXTEND.**

### Section order
1. **BRAND HERO BAND** — **NEW.** Full-width band (black or brand-tinted). Big `font-display` **BRAND NAME**, one-line brand blurb (from `collection.metadata.description`), optional brand logo/lockup (from `collection.metadata.logo`), `label` "OFFICIAL RANGE · {N} PRODUCTS". Background: brand photo or solid black with red accent line.
2. **FILTER + SORT + GRID** — reuse the **REBUILT `RefinementList`** from §3 but with **brand facet locked/hidden** (we're already inside a brand); expose **category** + **price** + **sort** only. Grid = `paginated-products` scoped to `collection.id` (already wired).
3. **EMPTY STATE** — same NEW empty component as PLP.
4. Keep `generateStaticParams` + `generateMetadata` (**KEEP**), but update metadata copy to "{Brand} — Genuine {Brand} supplements in Nepal | Protein Pasal".

---

## 7. CATEGORY PAGES — `/[countryCode]/(main)/categories/[...category]` → `modules/categories/templates/index.tsx`

**Categories = product types** (Whey, Mass Gainer, Creatine, …). Starter renders parent breadcrumb + children list + sort + grid. **RESKIN + add category header band.**

- `categories/templates/index.tsx` — **RESKIN + EXTEND.**

### Section order
1. **CATEGORY HEADER BAND** — **NEW.** `label` breadcrumb (parents, from starter's `getParents`) + giant `font-display` **CATEGORY NAME** + `category.description` (KEEP the data, restyle). Optional supporting line: "Everything you need for {goal}."
2. **CHILD CATEGORY CHIPS** — RESKIN starter's `category_children` list into a horizontal chip/pill row (`HScrollRail`) instead of a vertical `InteractiveLink` list.
3. **FILTER + SORT + GRID** — reuse REBUILT `RefinementList` with **brand** + **price** + **sort** facets (category is locked here). Grid = `paginated-products` scoped to `category.id` (already wired).
4. **EMPTY STATE** — shared NEW component.
5. Keep `generateStaticParams`/`generateMetadata` pattern; restyle copy.

---

## 8. CART — `/[countryCode]/(main)/cart` + mini-cart dropdown

### 8a. Cart page — `modules/cart/templates/index.tsx`
- **RESKIN, KEEP logic.** Two-column: line items left, summary right (starter already does this).
- `cart/components/item` — **RESKIN**: thumbnail (`rounded-base`), title (uppercase-ish), variant options (flavor/size), quantity `native-select`, `LineItemPrice` in NPR, red "REMOVE".
- `cart/components/empty-cart-message` — **REBUILD copy/visual**: `font-display` **"YOUR BAG IS EMPTY."** + body "Time to restock." + `PillButton` red **"SHOP ALL →"** (`/store`) + a `TrustBadgeRow`.
- `cart/components/sign-in-prompt` — **RESKIN**: "Already have an account? Log in for faster checkout & order history." → `/account`.
- Summary (`common/components/cart-totals` + `checkout/.../discount-code`) — **RESKIN**: NPR formatting, "PROCEED TO CHECKOUT →" red pill button, note "Shipping calculated at checkout · COD available".
- **NEW trust line** under summary: COD + Authentic badges (reuse `TrustBadgeRow` compact).

### 8b. Mini-cart dropdown — `modules/layout/components/cart-dropdown/index.tsx`
- **RESKIN, KEEP logic** (hover-open, 5s auto-open on add, item list, subtotal, "Go to cart"). Restyle: off-white panel, black header **"YOUR BAG"**, red "Go to cart" → relabel **"VIEW BAG →"** + add a secondary "CHECKOUT →" link. NPR subtotal. Empty state: relabel "Your shopping bag is empty." → keep concise + red "EXPLORE PRODUCTS →".
- `cart-button` — **KEEP logic, RESKIN** (see nav §11).

---

## 9. CHECKOUT — `/[countryCode]/(checkout)/checkout`

**Keep all starter logic and step machinery** (`Addresses` → `Shipping` → `Payment` → `Review`, URL `?step=`). This is the highest-risk area to rewrite, so **RESKIN only**; do not restructure the flow.

- `(checkout)/layout.tsx` + `templates/checkout-form` + `checkout-summary` — **RESKIN.** Minimal focused checkout chrome (logo, "SECURE CHECKOUT", back-to-cart). Keep the 2-col (form left, summary right).
- `checkout/components/addresses` + `shipping-address` + `billing_address` — **RESKIN + NP-first.**
  - **Country defaults to Nepal**; `country-select` (`checkout/components/country-select`) pre-selects NP and the NP region is the only/primary option. **REORDER address fields** to Nepali norms: Full Name, Phone (required, prominent — COD couriers call), Province (dropdown of Nepal's 7 provinces), District, City/Municipality, Ward No., Area/Tole + landmark line, (postal code optional). Map these onto Medusa's address fields (`address_1` = tole/street + landmark, `address_2` = ward/area, `province` = province, `city` = municipality, `postal_code` optional). Document the mapping in a comment.
  - Phone: make it clearly required and validate a Nepali mobile pattern (98/97…, 10 digits) softly.
- `checkout/components/shipping` — **RESKIN, KEEP logic.** Renders `availableShippingMethods` from backend. Present the two zones as clear radio cards: **"INSIDE KATHMANDU VALLEY — Rs. {rate}, 1–2 days"** and **"OUTSIDE VALLEY — Rs. {rate}, 2–5 days"** (labels/prices come from backend fulfillment options; don't hardcode amounts — render from data, just style the card + append delivery-time helper text keyed off the option name).
- `checkout/components/payment` + `payment-container` + `payment-button` — **RESKIN, KEEP logic.** For launch the only method is **Manual / Cash on Delivery**. Present as a single selected card: **"CASH ON DELIVERY"** with copy "Pay in cash when your order arrives. Please keep exact change ready." Keep the starter's `isManual`/`paymentReady` handling. **Design-note (do not build now):** leave a commented placeholder + a short block in this doc's sibling (payments doc) for adding **eSewa / Khalti** as additional `payment-container` options later — same component, new provider id.
- `checkout/components/review` + `submit-button` — **RESKIN.** Final "PLACE ORDER (COD) →" red button. Show order total in NPR, delivery zone, ETA, and a COD reassurance line.
- `checkout-summary` — **RESKIN**: NPR line items, editable qty link back to cart, promo code (KEEP `discount-code`).

**COD trust throughout checkout:** persistent small line "🔒 No online payment needed — pay cash on delivery." Reduces abandonment for the Nepali market.

---

## 10. ACCOUNT — `/[countryCode]/(main)/account/*`

Starter uses parallel routes `@login` / `@dashboard`. **KEEP the routing + all data/actions; RESKIN.**

- `account/templates/login-template.tsx` toggling `login` ↔ `register` — **RESKIN.** Off-white card, `font-display` **"WELCOME BACK"** / **"JOIN PROTEIN PASAL"**. Fields via starter `Input`. Register collects name, email, phone (RESKIN `profile-phone` relevance), password. Keep server actions.
- `account/templates/account-layout.tsx` + `account-nav` — **RESKIN.** Left nav (Overview, Orders, Addresses, Profile, Log out) as uppercase list; active = red. Mobile = top tab row.
- **Overview** (`components/overview`) — **RESKIN.** Greeting "NAMASTE, {name}", quick stats (orders count, saved addresses), recent order card.
- **Orders** (`@dashboard/orders` + `order-card` + `order-overview`) — **RESKIN, KEEP logic.** Order history list → each `order-card`: order #, date, NPR total, status badge, thumbnails, "VIEW ORDER →". Empty state: "NO ORDERS YET." + "SHOP ALL →".
- **Order details** (`@dashboard/orders/details/[id]`, reuses `modules/order/*`) — **RESKIN.** Items, totals (NPR), shipping address, **payment = Cash on Delivery**, status timeline. `help` block → localize contact (WhatsApp/Viber/phone).
- **Addresses** (`address-book` + `address-card`) — **RESKIN + NP fields** (province/district/ward as in checkout). Keep add/edit/delete actions. *(Note: creating/editing addresses is user-initiated in their own account — fine. Do not auto-modify.)*
- **Profile** (`profile-name/email/phone/password/billing-address`) — **RESKIN, KEEP logic.** Phone prominent (COD). Password change stays.

---

## 11. NAV HEADER + MOBILE MENU

### 11a. Announcement bar — **NEW** (`layout/components/announcement-bar`)
- Thin **red** full-bleed bar above the header, off-white uppercase `label` text, optionally a tiny `Marquee`:
  **"🚚 CASH ON DELIVERY ALL OVER NEPAL   ✱   100% AUTHENTIC   ✱   FREE DELIVERY OVER Rs. 10,000"** (adjust threshold to real policy; if none, drop the free-delivery clause).
- Dismissible optional (localStorage). Render in `(main)/layout.tsx` above `<Nav />`.

### 11b. Header — `modules/layout/templates/nav/index.tsx` — **REBUILD**
- **Sticky, black** header (starter is white — invert). Off-white text/logo; red hover/underline.
- Layout (desktop): **left** = hamburger (`SideMenu`) + primary links (SHOP, BRANDS, CATEGORIES) ; **center** = wordmark **"PROTEIN PASAL"** (`font-display`, links `/`) ; **right** = **search icon/box**, **ACCOUNT**, **CART (n)**.
  - Alternatively left-align the logo and put nav links inline — pick the centered wordmark to match the reference. Keep `data-testid`s (`nav-store-link`, `nav-account-link`, `nav-cart-link`) so starter tests/QA still pass.
- **Search** — **NEW** in header: an input (desktop, expands) / icon that opens a search field (mobile) → routes to `/search?q=`. Wire to §5.
- `cart-button` / `cart-dropdown` — **KEEP logic, RESKIN** (see §8b). Cart count badge in red.
- Keep `regions`/`locales` fetch (KEEP) though for launch NP-only; hide the country selector in header if single-region (leave in side menu).
- On scroll: header stays solid black (starter already sticky). Add subtle bottom border.

### 11c. Mobile menu — `modules/layout/components/side-menu/index.tsx` — **RESKIN, KEEP logic**
- Starter is a full-screen blurred dark panel with big links — **already on-brand**; restyle to solid black + off-white, `font-display` giant links.
- Menu items: **SHOP ALL, BRANDS, SHOP BY GOAL, CATEGORIES (expandable), ACCOUNT, CART**. Add brand + category sub-lists (pull from `listCollections`/`listCategories`; pass as props like starter passes `regions`).
- Add a search field at top of the menu. Keep country/language toggles at bottom (hide country if single region). Footer line → brand copyright.

---

## 12. FOOTER — `modules/layout/templates/footer/index.tsx` — **REBUILD**

Keep the data (`listCollections`, `listCategories`) and `LocalizedClientLink` pattern; restructure to the reference footer.

### Structure (top → bottom)
1. **Top strip** (optional): newsletter-ish or `TrustBadgeRow` (COD · Authentic · Delivery · Returns).
2. **Link columns** (dark bg, off-white): 
   - **SHOP** (All Products, Shop by Goal, Best Sellers, Fresh Stock)
   - **BRANDS** (top brands from `listCollections`, + "All Brands")
   - **CATEGORIES** (from `listCategories`)
   - **HELP** (Contact / WhatsApp, Delivery & COD, Authenticity, Returns, FAQ)
   - **ACCOUNT** (Login, Orders, Cart)
3. **Contact/social row**: phone, WhatsApp/Viber, Instagram, TikTok, Facebook, email; payment note "We accept: Cash on Delivery" (+ later eSewa/Khalti logos).
4. **Legal row**: "© {year} Protein Pasal. All rights reserved." + Privacy / Terms links. Replace `MedusaCTA` (KEEP or remove per taste — recommend remove for a real brand).
5. **GIANT BRAND MARQUEE** at the very bottom — `Marquee` **NEW**, variant `outline`/`black`, massive `font-display` **"PROTEIN PASAL ✱ PROTEIN PASAL ✱"** repeating edge-to-edge, clipped. This is the reference-page signature footer.

---

## 13. 404 / NOT-FOUND — `app/[countryCode]/(main)/not-found.tsx` (+ `app/not-found.tsx`)

- **REBUILD** both to match brand. Off-white/black, giant `font-display` **"404"** + **"PAGE NOT FOUND."**, body "This page skipped leg day and disappeared.", two `PillButton`s: red **"SHOP ALL →"** (`/store`) + outline **"GO HOME →"** (`/`). Keep it lightweight (no data fetch). Optionally a small `Marquee` of categories for wayfinding.
- Also restyle `(checkout)/not-found.tsx` and `cart/not-found.tsx` (KEEP their intent, inherit the 404 styling).

---

## 14. Nepali-market touches (apply globally)

**A. NPR price formatting — `src/lib/util/money.ts` (RESKIN/EXTEND).**
The starter's `convertToLocale` with `en-US` + `currency: "npr"` renders "NPR 8,500.00" — wrong feel. Add/override so NPR renders **"Rs. 8,500"** (symbol `Rs.`, thousands separators, **no decimals** by default since supplement prices are whole rupees). Approach: keep `convertToLocale` for non-NPR, add a small wrapper (or special-case NPR): format the number with `en-IN`/`en-US` grouping, `minimumFractionDigits: 0`, and prefix `Rs. ` manually (don't rely on Intl currency display which yields "NPR"/"₨" inconsistently across engines). Apply everywhere prices render: `product-price`, `product-preview/price`, cart, mini-cart, checkout summary, order pages. **Show whole rupees**; only show paisa if a price has a non-zero fraction.

**B. Delivery expectations copy (single source, reused on PDP, cart, checkout, footer, delivery tab):**
- Inside Kathmandu Valley: **1–2 days**.
- Outside Valley: **2–5 days**.
- COD available nationwide; shipping is flat-rate by zone (exact amounts come from backend fulfillment options — render from data).

**C. COD trust signals (reused via `TrustBadgeRow` + inline lines):**
- Announcement bar, PDP buy box, cart summary, checkout payment step, order confirmation all reinforce **"Cash on Delivery — pay when it arrives."**
- Register/checkout make **phone number prominent + required** (couriers call to confirm).
- Authenticity messaging ("100% Genuine / Sealed & Sourced") is a recurring section (home split, PDP tab, footer) — it's the #1 trust concern for supplements in Nepal.

**D. Contact/support localization:** surface **WhatsApp/Viber + phone** prominently (order help, footer, checkout). Nepali shoppers expect chat-based support.

**E. Language:** English UI for launch (Nepali English is standard for this category). Keep copy simple; a few Nepali touches allowed ("NAMASTE, {name}" on account). Do not build full i18n now — starter's locale plumbing stays but single active locale.

---

## 15. Order confirmation — `/[countryCode]/(main)/order/[id]/confirmed` → `modules/order/templates/order-completed-template`

- **RESKIN, KEEP logic.** (Listed here explicitly though touched in §10.)
- Big `font-display` success headline **"ORDER CONFIRMED!"** + red check, order #, "We'll call you shortly to confirm your Cash-on-Delivery order."
- Blocks: items (`order/components/items` + `item`), totals in NPR (`order-summary`), **payment = Cash on Delivery** (`payment-details`), shipping address + zone/ETA (`shipping-details`), `help` (localized WhatsApp/phone).
- CTAs: `PillButton` **"CONTINUE SHOPPING →"** (`/store`) + "VIEW ORDER →" (account). Reassurance `TrustBadgeRow`.
- Keep `retrieveOrder` + skeletons. Order confirmation is a great place for a subtle `Marquee` "THANK YOU ✱ PROTEIN PASAL".

---

## 16. Component decision summary (quick index)

| Area | File(s) | Decision |
|---|---|---|
| Home page shell | `app/[countryCode]/(main)/page.tsx` | REBUILD (compose sections) |
| Hero | `modules/home/components/hero` | REBUILD |
| Featured/Fresh/Best rails | `modules/home/components/featured-products/*` | REBUILD wrappers, reuse `ProductPreview` |
| Stats / Intro / Marquee / Goal cards / Brand list / Split / Trust badges | new under `modules/home` & `modules/common` | NEW |
| Product card | `modules/products/components/product-preview` | RESKIN |
| PLP template + facets | `modules/store/templates/*`, `refinement-list/*` | RESKIN + REBUILD (add brand/category/price filters) |
| Sort / Pagination | `refinement-list/sort-products`, `store/components/pagination` | KEEP logic, RESKIN |
| PDP template | `modules/products/templates/index.tsx` | RESKIN |
| Gallery / Info / Price | `image-gallery`, `product-info`, `product-price` | RESKIN (+ brand label, NPR) |
| Variant actions | `product-actions/*` | KEEP logic, RESKIN |
| Nutrition table | `products/components/nutrition-facts` | NEW |
| Product tabs | `product-tabs` | REBUILD content |
| Related | `related-products` | KEEP logic, RESKIN |
| Search route + box | `app/.../search/page.tsx`, nav search | NEW |
| Collection (brand) | `modules/collections/templates` | RESKIN + brand hero band |
| Category | `modules/categories/templates` | RESKIN + header band + chip children |
| Cart page + items | `modules/cart/*` | RESKIN |
| Mini-cart | `layout/components/cart-dropdown` | KEEP logic, RESKIN |
| Checkout flow | `modules/checkout/*` (all steps) | KEEP logic, RESKIN + NP-first address/zones/COD |
| Account (all) | `modules/account/*`, `modules/order/*` | KEEP logic, RESKIN + NP fields |
| Order confirmation | `order/templates/order-completed-template` | RESKIN |
| Nav header | `layout/templates/nav` | REBUILD (black, sticky, search, centered wordmark) |
| Announcement bar | new `layout/components/announcement-bar` | NEW |
| Side menu | `layout/components/side-menu` | KEEP logic, RESKIN |
| Footer | `layout/templates/footer` | REBUILD (+ giant brand marquee) |
| 404 | `app/**/not-found.tsx` | REBUILD |
| Money helper | `lib/util/money.ts` | EXTEND (NPR `Rs.`) |

---

## 17. Guardrails for implementers

1. **Do not change Medusa queries, server actions, routing, or `searchParams`-driven state** unless a section explicitly says EXTEND (facets, search `q`, NP address mapping). When extending, keep signatures backward-compatible.
2. **Preserve every `data-testid`** on reskinned components — QA/browser verification depends on them.
3. **Keep `<Suspense>` + skeleton fallbacks** everywhere the starter has them.
4. **Never render an empty grid or dead section** — every list has a designed empty state; every "featured"/"best-seller" section falls back to newest products if its signal is missing at seed time.
5. **Horizontal scroll stays inside rails** (`overflow-x-auto`); the page body must never scroll horizontally at any breakpoint.
6. **Respect `prefers-reduced-motion`** for marquees/animations (static fallback).
7. **Prices always through the NPR helper** — no raw `Intl` currency output reaching the UI.
8. **Brand = Collection, Category = product type** — never invert. "Goals" are merchandising links to real categories/filters, not new entities.
9. **Single red accent** — resist adding more colours; red signals action/sale/active only.
