# 04 — Catalog & Seed Data Plan

Scope: everything a coding agent needs to write `backend/src/scripts/seed.ts` (replacing/extending the medusa-starter-default seed) so that a fresh Medusa v2 + PostgreSQL instance comes up with the full Protein Pasal catalog: Nepal region, sales channel, stock location, shipping options, 8 brand Collections, 7 Categories, and 24 products with realistic options/variants/prices/inventory. This document is the single source of truth for that data — transcribe directly, do not invent additional products or brands.

Status of every record created by this plan: **published / enabled**. Nothing here is a draft.

---

## 0. Conventions used throughout this document

- **Handles** are kebab-case, lowercase, stable identifiers — treat them as the primary key you look up by by in the seed script (`upsert`-style: find by handle, create if missing).
- **Currency**: all prices are in **NPR major units** (rupees), e.g. `6200` means Rs 6,200.00. Medusa v2's pricing module stores the amount as the decimal major-unit value for the currency (not multiplied by 100 the way Stripe cents work) — confirm this against the exact `@medusajs/medusa` version pinned in `backend/package.json` with one throwaway test price before bulk-inserting all 24 products, then proceed.
- **Weights** are in grams (Medusa variant `weight` field), representing the shipped package weight (product + primary packaging), not just the powder/tablet content.
- **SKU pattern**: `{BRAND_CODE}-{PRODUCT_CODE}-{FLAVOR_CODE}-{SIZE_CODE}` (vitamins drop the flavor segment since they have no Flavor option). All codes are given per product below.
- Every product gets **one** option set: most products get `Flavor` + `Size`; the two Vitamins & Health products get `Size` only (tablets aren't flavored).
- Every product ships with a single primary image (Unsplash placeholder, see §5) attached at the product level; all variants of a product share that image for now. A `// TODO(real-photography)` comment should be left in the seed script wherever these placeholders are used.
- Inventory is seeded at a **single stock location** ("Kathmandu Warehouse" — see §1.4) using the Medusa v2 inventory module (`inventory_items` + `inventory_levels`), not the old `variant.inventory_quantity` field.

---

## 1. Nepal storefront foundation (region, sales channel, stock location, shipping)

Seed this section **before** collections/categories/products — products need the sales channel and stock location to exist so variants can be linked and inventory levels set.

### 1.1 Store settings

| Field | Value |
|---|---|
| Store name | `Protein Pasal` |
| Default currency | `npr` |
| Supported currencies | `[npr]` (single-currency store at launch) |
| Default region | `Nepal` (see 1.2) |
| Default sales channel | `Protein Pasal Online` (see 1.3) |

### 1.2 Region — "Nepal"

| Field | Value |
|---|---|
| `name` | `Nepal` |
| `currency_code` | `npr` |
| `countries` | `["np"]` |
| `payment_providers` | `["pp_system_default"]` (Medusa's built-in manual payment provider — this is what backs Cash on Delivery; do not install a separate COD plugin) |
| `automatic_taxes` | `false` |
| Tax rate | None seeded. Nepal VAT (13%) is a **future task** — for launch, treat all listed prices as tax-inclusive/final and leave a `// TODO(nepal-vat)` comment in the seed script. Do not silently add a tax rate that wasn't asked for. |

### 1.3 Sales channel

| Field | Value |
|---|---|
| `name` | `Protein Pasal Online` |
| `description` | `Default storefront sales channel for protein-pasal.com` |
| Notes | Either rename the starter's "Default Sales Channel" to this, or create a new one and delete/ignore the default — pick whichever is less code in the starter's existing seed script structure. Generate a **publishable API key** scoped to this sales channel; the storefront's `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` env var depends on it, so print/log the key at the end of the seed run. |

### 1.4 Stock location — "Kathmandu Warehouse"

| Field | Value |
|---|---|
| `name` | `Kathmandu Warehouse` |
| `address.city` | `Kathmandu` |
| `address.address_1` | `Balaju Industrial Area` |
| `address.province` | `Bagmati` |
| `address.country_code` | `np` |
| `address.postal_code` | `44600` |
| Linked sales channel | `Protein Pasal Online` |

### 1.5 Fulfillment set, service zone, shipping options

Medusa v2 shipping options must exist under a Fulfillment Set → Service Zone attached to the stock location. For launch, use **one service zone covering all of Nepal** with two shipping options; the customer picks the correct one at checkout based on their delivery address (the storefront's address form should default to the "Inside Valley" option when the city is Kathmandu/Lalitpur/Bhaktapur/Kirtipur, but that's a storefront nicety, not a data-model requirement). A more granular city-level `geo_zones` split (Medusa v2 supports `country` / `province` / `city` / `zip` geo zone targeting) can be added later if the team wants automatic zone detection — flag it as a fast-follow, don't build it now.

| Field | Value |
|---|---|
| Fulfillment set name | `Kathmandu Warehouse delivery` |
| Fulfillment set type | `shipping` |
| Service zone name | `All of Nepal` |
| Service zone geo_zones | `[{ country_code: "np" }]` (whole-country zone; both shipping options live inside it) |
| Fulfillment provider | `manual` (`pp_system_default`'s sibling fulfillment provider that ships with the starter — no external carrier integration at launch) |
| Shipping profile | Use the starter's default `Default Shipping Profile`, linked to all 24 products |

**Shipping options** (both `price_type: flat`, both available in the `All of Nepal` service zone):

| Name | Price (NPR) | Fulfilled in | Notes |
|---|---|---|---|
| `Inside Kathmandu Valley` | `Rs 100` | 1–2 days | For Kathmandu, Lalitpur, Bhaktapur, Kirtipur addresses |
| `Outside Valley` | `Rs 250` | 3–5 days | Everywhere else in Nepal |

**Free shipping above Rs 10,000** (nice-to-have — implement if the Promotions module makes it a quick add for the pinned Medusa version, otherwise skip and leave a `// TODO(free-shipping-threshold)` comment rather than burning a day on it):

- Create an **automatic Promotion** (no code required at checkout), `application_method.target_type: "shipping_methods"`, `application_method.type: "percentage"`, `application_method.value: 100`.
- Rule: cart `item_total >= 10000` (confirm the exact rule attribute name/comparator supported by the pinned Medusa version's Promotions module before wiring this up).
- Applies to both shipping options equally.

---

## 2. Brand Collections (8)

Each brand is a Medusa **Collection**. `title` is the display name; `handle` is the URL slug (`/collections/{handle}` on the storefront). Description is 2–3 sentences of brand-positioning copy for the collection landing page hero.

| # | Title | Handle | Description |
|---|---|---|---|
| 1 | Optimum Nutrition | `optimum-nutrition` | The world's most trusted whey protein brand, known globally for Gold Standard 100% Whey. Rigorously tested, informed-choice friendly, and manufactured in the USA — the default pick for lifters who don't want to think twice about quality. |
| 2 | MuscleBlaze | `muscleblaze` | South Asia's fastest-growing sports nutrition brand, built for serious lifters who want lab-tested results without the premium markup. A gym-floor staple across the subcontinent. |
| 3 | Dymatize | `dymatize` | American performance nutrition brand famous for ISO100 hydrolyzed whey isolate — fast-absorbing, gut-friendly protein for athletes who demand purity and precise macros. |
| 4 | MyProtein | `myprotein` | Europe's #1 online sports nutrition brand. Direct-to-consumer pricing, an enormous flavor range, and a cult following among gym-goers who track every macro. |
| 5 | GNC | `gnc` | The century-old American health and nutrition retailer, trusted by pharmacists and trainers alike for protein, wellness, and everyday vitamins under one roof. |
| 6 | Ultimate Nutrition | `ultimate-nutrition` | One of the original American sports nutrition brands, running strong since 1979. Prostar Whey remains a gym-bag staple for lifters who grew up on it. |
| 7 | Rule 1 | `rule-1` | Formulated by veteran sports-nutrition scientists, Rule 1 strips out the fillers and proprietary blends, favoring clinically dosed, clearly labeled ingredients. |
| 8 | Applied Nutrition | `applied-nutrition` | UK-born, internet-famous sports nutrition brand known for bold flavors, striking packaging, and its cult-favorite ABE pre-workout. |

---

## 3. Categories (7)

Categories are Medusa **Product Categories**, used for the storefront's category-filtered PLPs (`/categories/{handle}`). All are top-level (no nesting needed at launch).

| # | Title | Handle | Description |
|---|---|---|---|
| 1 | Whey Protein | `whey-protein` | Fast-digesting milk protein for muscle repair and growth — the foundation of every supplement stack. |
| 2 | Mass Gainer | `mass-gainer` | High-calorie protein + carb blends for hardgainers who struggle to eat their way to size. |
| 3 | Creatine | `creatine` | The most researched supplement in sports science — proven to boost strength, power output, and lean muscle mass. |
| 4 | Pre-Workout | `pre-workout` | Caffeine, pump, and focus formulas to take a training session from ordinary to explosive. |
| 5 | BCAA & EAA | `bcaa-eaa` | Branched-chain and essential amino acids to reduce muscle breakdown and speed recovery between sessions. |
| 6 | Protein Bars & Snacks | `protein-bars-snacks` | Grab-and-go protein for busy days — dessert-level taste with a macro profile that fits the plan. |
| 7 | Vitamins & Health | `vitamins-health` | Daily multivitamins and health essentials to cover the nutritional gaps training alone can't fix. |

---

## 4. Category → Product/Variant shape reference

These 7 tables define the **Options, Size-level weight, and Size-level inventory** shared by every product in that category. Per-product tables in §6 only need to specify Price by size (which varies by brand) plus the brand-specific Flavor value list — everything else (weight, inventory-per-flavor) is looked up here. This keeps the per-product tables short while still fully specifying every SKU.

**How to read it**: a product in a category with 3 Flavor values and 2 Size values produces `3 × 2 = 6` variants. Each variant's `weight` and inventory quantity come from its Size row below, regardless of flavor.

#### Whey Protein
Options: `Flavor` (3 values, brand-specific) × `Size` (`1lb`, `5lb`)

| Size | Weight (g) | Inventory / flavor |
|---|---|---|
| 1lb | 500 | 60 |
| 5lb | 2500 | 30 |

#### Mass Gainer
Options: `Flavor` (2 values) × `Size` (`3lb`, `6lb`)

| Size | Weight (g) | Inventory / flavor |
|---|---|---|
| 3lb | 1500 | 45 |
| 6lb | 3000 | 25 |

#### Creatine
Options: `Flavor` (2 values) × `Size` (`60 Servings`, `120 Servings`)

| Size | Weight (g) | Inventory / flavor |
|---|---|---|
| 60 Servings | 350 | 70 |
| 120 Servings | 650 | 35 |

#### Pre-Workout
Options: `Flavor` (3 values) × `Size` (`30 Servings`, `60 Servings`)

| Size | Weight (g) | Inventory / flavor |
|---|---|---|
| 30 Servings | 300 | 50 |
| 60 Servings | 600 | 25 |

#### BCAA & EAA
Options: `Flavor` (2 values) × `Size` (`30 Servings`, `60 Servings`)

| Size | Weight (g) | Inventory / flavor |
|---|---|---|
| 30 Servings | 300 | 55 |
| 60 Servings | 600 | 28 |

#### Protein Bars & Snacks
Options: `Flavor` (3 values) × `Size` (`Single Bar`, `Box of 12`)

| Size | Weight (g) | Inventory / flavor |
|---|---|---|
| Single Bar | 65 | 150 |
| Box of 12 | 780 | 20 |

#### Vitamins & Health
Options: `Size` only (`30 Tablets`, `60 Tablets`) — **no Flavor option on this category's products**

| Size | Weight (g) | Inventory |
|---|---|---|
| 30 Tablets | 60 | 65 |
| 60 Tablets | 120 | 35 |

---

## 5. Image strategy

Use Unsplash as a placeholder image source until real product photography is licensed/shot. All URLs below were pulled live from Unsplash search results and point at real, currently-served photo IDs on `images.unsplash.com` — use the exact URL given (query params included; they're just Unsplash's standard resize/format params: `q=80&w=1200&auto=format&fit=crop`).

**Every seeded image URL must carry a `// TODO(real-photography): replace with licensed product shot`** comment in the seed script. Do not let these ship to a production storefront as-is — they're generic stock photography, not the actual product packaging, so they're a placeholder-quality signal, not a launch blocker for local dev.

### 5.1 Collection banner images (8 — one per brand)

| Collection | Image URL |
|---|---|
| Optimum Nutrition | `https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1600&auto=format&fit=crop` |
| MuscleBlaze | `https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1600&auto=format&fit=crop` |
| Dymatize | `https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=1600&auto=format&fit=crop` |
| MyProtein | `https://images.unsplash.com/photo-1704650311540-e3b58fa6dc74?q=80&w=1600&auto=format&fit=crop` |
| GNC | `https://images.unsplash.com/photo-1624362772755-4d5843e67047?q=80&w=1600&auto=format&fit=crop` |
| Ultimate Nutrition | `https://images.unsplash.com/photo-1559087316-6b27308e53f6?q=80&w=1600&auto=format&fit=crop` |
| Rule 1 | `https://images.unsplash.com/photo-1633360821154-1935fb5671e6?q=80&w=1600&auto=format&fit=crop` |
| Applied Nutrition | `https://images.unsplash.com/photo-1627467959547-8e44da7aa00a?q=80&w=1600&auto=format&fit=crop` |

### 5.2 Product images (24 — one per product; exact mapping given per product in §6, listed together here for convenience)

| Product | Image URL |
|---|---|
| ON Gold Standard 100% Whey | `https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?q=80&w=1200&auto=format&fit=crop` |
| ON Serious Mass | `https://images.unsplash.com/photo-1693996045369-781799bbaea0?q=80&w=1200&auto=format&fit=crop` |
| ON Micronized Creatine Powder | `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop` |
| MuscleBlaze Biozyme Performance Whey | `https://images.unsplash.com/photo-1693996045300-521e9d08cabc?q=80&w=1200&auto=format&fit=crop` |
| MuscleBlaze Mass Gainer XXL | `https://images.unsplash.com/photo-1558017487-06bf9f82613a?q=80&w=1200&auto=format&fit=crop` |
| MuscleBlaze Creatine Monohydrate | `https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1200&auto=format&fit=crop` |
| Dymatize ISO100 Hydrolyzed Whey | `https://images.unsplash.com/photo-1693996046865-19217d179161?q=80&w=1200&auto=format&fit=crop` |
| Dymatize Creatine Micronized | `https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop` |
| Dymatize BCAA Complex 5050 | `https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200&auto=format&fit=crop` |
| MyProtein Impact Whey Protein | `https://images.unsplash.com/photo-1693996045463-6ea86d10a2e7?q=80&w=1200&auto=format&fit=crop` |
| MyProtein THE Pre-Workout | `https://images.unsplash.com/photo-1581269631444-9c6cc00df0b6?q=80&w=1200&auto=format&fit=crop` |
| MyProtein BCAA | `https://images.unsplash.com/photo-1689877020200-403d8542d95d?q=80&w=1200&auto=format&fit=crop` |
| GNC Pro Performance 100% Whey Protein | `https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=1200&auto=format&fit=crop` |
| GNC Total Lean Protein Bar | `https://images.unsplash.com/photo-1622484212850-eb596d769edc?q=80&w=1200&auto=format&fit=crop` |
| GNC Mega Men Sport Multivitamin | `https://images.unsplash.com/photo-1732900293895-233f769299b3?q=80&w=1200&auto=format&fit=crop` |
| Ultimate Nutrition Prostar Whey Protein | `https://images.unsplash.com/photo-1704650312191-005ab02786f5?q=80&w=1200&auto=format&fit=crop` |
| Ultimate Nutrition BCAA 12000 | `https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop` |
| Ultimate Nutrition Daily Formula Multivitamin | `https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1200&auto=format&fit=crop` |
| Rule 1 R1 Mass Gainer | `https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=1200&auto=format&fit=crop` |
| Rule 1 R1 Pre-Workout | `https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=1200&auto=format&fit=crop` |
| Rule 1 R1 Protein Bar | `https://images.unsplash.com/photo-1742860866012-fc167d8366bf?q=80&w=1200&auto=format&fit=crop` |
| Applied Nutrition Critical Mass Professional | `https://images.unsplash.com/photo-1579722822280-a3d601518cc9?q=80&w=1200&auto=format&fit=crop` |
| Applied Nutrition ABE Pre-Workout | `https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=1200&auto=format&fit=crop` |
| Applied Nutrition Critical Whey | `https://images.unsplash.com/photo-1633509817627-5a29634475af?q=80&w=1200&auto=format&fit=crop` |

---

## 6. Products (24)

Organized by brand, 3 products per brand (per §2). For each product: title, handle, category, description, options, SKU pattern, price-by-size table (weight/inventory come from §4's category table), and metadata.

Every product: **status = published**, **collection = the brand's collection from §2**, **sales channel = Protein Pasal Online**, **shipping profile = Default Shipping Profile**.

---

### 6.1 Optimum Nutrition

#### 1. ON Gold Standard 100% Whey
- Handle: `on-gold-standard-100-whey` · Category: Whey Protein (`whey-protein`)
- Description: The best-selling whey protein in the world, delivering 24g of high-quality whey protein isolate, concentrate, and peptides in every scoop. Mixes instantly with a spoon — no shaker needed — with a smooth, never-chalky taste that's kept lifters coming back for over two decades. Trusted in gyms from Kathmandu to California.
- Options: `Flavor`: Double Rich Chocolate, Vanilla Ice Cream, Unflavored · `Size`: 1lb, 5lb
- SKU pattern: `ON-GSW-{CHOC|VAN|UNFL}-{1LB|5LB}`

| Size | Price (NPR) |
|---|---|
| 1lb | 6,200 |
| 5lb | 21,500 |

- Metadata: `protein_per_serving: "24g"` · `servings: "15 (1lb) / 75 (5lb)"` · `origin_country: "USA"` · `flavor_notes: "Double Rich Chocolate — deep cocoa, smooth mixability, no chalky aftertaste"`

#### 2. ON Serious Mass
- Handle: `on-serious-mass` · Category: Mass Gainer (`mass-gainer`)
- Description: A calorie-dense weight gainer packing roughly 1,250 calories and 50g of protein per serving for lifters who need serious size. Fortified with 25 vitamins and minerals plus creatine monohydrate and glutamine to support recovery between heavy sessions. Built for hardgainers who eat clean but still can't out-train a fast metabolism.
- Options: `Flavor`: Chocolate, Vanilla · `Size`: 3lb, 6lb
- SKU pattern: `ON-SM-{CHOC|VAN}-{3LB|6LB}`

| Size | Price (NPR) |
|---|---|
| 3lb | 7,500 |
| 6lb | 12,000 |

- Metadata: `protein_per_serving: "50g"` · `servings: "9 (3lb) / 18 (6lb)"` · `origin_country: "USA"` · `flavor_notes: "Chocolate — thick, milkshake-like consistency"`

#### 3. ON Micronized Creatine Powder
- Handle: `on-micronized-creatine-powder` · Category: Creatine (`creatine`)
- Description: Pure, micronized creatine monohydrate with no additives, fillers, or flavoring — just the single most proven strength and power supplement in sports science. Finer micronized particles mix cleanly into any shake or juice without the grit of ordinary creatine. One daily 5g scoop is all it takes to see the difference in the gym.
- Options: `Flavor`: Unflavored, Fruit Punch · `Size`: 60 Servings, 120 Servings
- SKU pattern: `ON-CREA-{UNFL|FPCH}-{60SV|120SV}`

| Size | Price (NPR) |
|---|---|
| 60 Servings | 3,200 |
| 120 Servings | 4,500 |

- Metadata: `protein_per_serving: "0g protein (5g Creatine Monohydrate per serving)"` · `servings: "60 or 120 depending on pack size"` · `origin_country: "USA"` · `flavor_notes: "Unflavored — mixes into any shake or juice without altering taste"`

---

### 6.2 MuscleBlaze

#### 4. MuscleBlaze Biozyme Performance Whey
- Handle: `muscleblaze-biozyme-performance-whey` · Category: Whey Protein (`whey-protein`)
- Description: India's top-selling whey protein, enhanced with a digestive enzyme blend (Biozyme) for faster absorption and less bloating. Delivers 25g of protein and 5.5g of BCAAs per serving at a price built for daily use, not just special occasions. A gym-floor favorite across South Asia for a reason.
- Options: `Flavor`: Rich Milk Chocolate, Cafe Mocha, Unflavoured · `Size`: 1lb, 5lb
- SKU pattern: `MB-BPW-{MILK|MOCHA|UNFL}-{1LB|5LB}`

| Size | Price (NPR) |
|---|---|
| 1lb | 4,800 |
| 5lb | 15,500 |

- Metadata: `protein_per_serving: "25g"` · `servings: "15 (1lb) / 75 (5lb)"` · `origin_country: "India"` · `flavor_notes: "Rich Milk Chocolate — classic malty cocoa profile, dissolves clean with a shaker"`

#### 5. MuscleBlaze Mass Gainer XXL
- Handle: `muscleblaze-mass-gainer-xxl` · Category: Mass Gainer (`mass-gainer`)
- Description: A high-calorie mass gainer with a carb-heavy ratio designed specifically for ectomorphs and hardgainers chasing visible size. Each serving delivers 800+ calories with added digestive enzymes so the extra food actually gets absorbed, not wasted. Thick and filling when mixed — built for people who genuinely struggle to gain weight.
- Options: `Flavor`: Rich Chocolate, Vanilla · `Size`: 3lb, 6lb
- SKU pattern: `MB-MGXXL-{CHOC|VAN}-{3LB|6LB}`

| Size | Price (NPR) |
|---|---|
| 3lb | 6,200 |
| 6lb | 10,500 |

- Metadata: `protein_per_serving: "30g"` · `servings: "9 (3lb) / 18 (6lb)"` · `origin_country: "India"` · `flavor_notes: "Rich Chocolate — sweet, filling, mixes into a thick shake"`

#### 6. MuscleBlaze Creatine Monohydrate
- Handle: `muscleblaze-creatine-monohydrate` · Category: Creatine (`creatine`)
- Description: Micronized creatine monohydrate manufactured in an Informed-Choice certified facility, so competitive athletes can supplement with confidence. 3g of pure creatine per serving supports strength, power, and muscle volume with consistent daily use. No loading phase required — just mix and go.
- Options: `Flavor`: Unflavoured, Watermelon · `Size`: 60 Servings, 120 Servings
- SKU pattern: `MB-CM-{UNFL|WMEL}-{60SV|120SV}`

| Size | Price (NPR) |
|---|---|
| 60 Servings | 2,500 |
| 120 Servings | 3,800 |

- Metadata: `protein_per_serving: "0g protein (3g Creatine Monohydrate per serving)"` · `servings: "60 or 120 depending on pack size"` · `origin_country: "India"` · `flavor_notes: "Unflavoured — neutral taste, dissolves cleanly in water"`

---

### 6.3 Dymatize

#### 7. Dymatize ISO100 Hydrolyzed Whey
- Handle: `dymatize-iso100-hydrolyzed-whey` · Category: Whey Protein (`whey-protein`)
- Description: A gold-standard whey protein isolate that's hydrolyzed for faster digestion and virtually free of lactose, gluten, and fat. Delivers 25g of protein per scoop with under 1g of sugar, making it a favorite among athletes who are strict about their macros. Dissolves cleanly in water with almost no foam — a genuinely different mixing experience.
- Options: `Flavor`: Gourmet Chocolate, Gourmet Vanilla, Birthday Cake · `Size`: 1lb, 5lb
- SKU pattern: `DYM-ISO100-{CHOC|VAN|BDAY}-{1LB|5LB}`

| Size | Price (NPR) |
|---|---|
| 1lb | 6,500 |
| 5lb | 22,000 |

- Metadata: `protein_per_serving: "25g"` · `servings: "15 (1lb) / 75 (5lb)"` · `origin_country: "USA"` · `flavor_notes: "Gourmet Chocolate — dessert-like sweetness, mixes almost foam-free"`

#### 8. Dymatize Creatine Micronized
- Handle: `dymatize-creatine-micronized` · Category: Creatine (`creatine`)
- Description: 100% pure micronized creatine monohydrate, refined for smoother mixing and better solubility than standard creatine powders. Backed by decades of peer-reviewed research for improving strength, power, and training volume. A no-frills staple for lifters who already know what works.
- Options: `Flavor`: Unflavored, Fruit Blast · `Size`: 60 Servings, 120 Servings
- SKU pattern: `DYM-CREAM-{UNFL|FBLST}-{60SV|120SV}`

| Size | Price (NPR) |
|---|---|
| 60 Servings | 2,900 |
| 120 Servings | 4,200 |

- Metadata: `protein_per_serving: "0g protein (5g Creatine Monohydrate per serving)"` · `servings: "60 or 120 depending on pack size"` · `origin_country: "USA"` · `flavor_notes: "Unflavored — micronized for smoother mixing than standard creatine"`

#### 9. Dymatize BCAA Complex 5050
- Handle: `dymatize-bcaa-complex-5050` · Category: BCAA & EAA (`bcaa-eaa`)
- Description: A 2:1:1 branched-chain amino acid formula built to help preserve lean muscle during intense training and support faster recovery between sessions. Instantized for easy mixing, with zero sugar and a light, refreshing taste that's easy to sip throughout a workout. A smart addition to any fasted-training or cutting routine.
- Options: `Flavor`: Fruit Punch, Grape · `Size`: 30 Servings, 60 Servings
- SKU pattern: `DYM-BCAA-{FPCH|GRPE}-{30SV|60SV}`

| Size | Price (NPR) |
|---|---|
| 30 Servings | 3,000 |
| 60 Servings | 4,800 |

- Metadata: `protein_per_serving: "0g protein (7g BCAA per serving)"` · `servings: "30 or 60 depending on pack size"` · `origin_country: "USA"` · `flavor_notes: "Fruit Punch — light, refreshing, easy to sip during training"`

---

### 6.4 MyProtein

#### 10. MyProtein Impact Whey Protein
- Handle: `myprotein-impact-whey-protein` · Category: Whey Protein (`whey-protein`)
- Description: The product that built MyProtein's reputation — a lean, effective whey blend with 21g of protein per serving and one of the largest flavor ranges in sports nutrition. Direct-to-consumer pricing means premium protein without the premium markup. A go-to for anyone tracking cost-per-gram of protein.
- Options: `Flavor`: Chocolate Smooth, Vanilla, Unflavored · `Size`: 1lb, 5lb
- SKU pattern: `MP-IMPACT-{CHOC|VAN|UNFL}-{1LB|5LB}`

| Size | Price (NPR) |
|---|---|
| 1lb | 4,500 |
| 5lb | 14,200 |

- Metadata: `protein_per_serving: "21g"` · `servings: "15 (1lb) / 75 (5lb)"` · `origin_country: "United Kingdom"` · `flavor_notes: "Chocolate Smooth — light, milky cocoa, not overly sweet"`

#### 11. MyProtein THE Pre-Workout
- Handle: `myprotein-the-pre-workout` · Category: Pre-Workout (`pre-workout`)
- Description: A comprehensive pre-training formula combining caffeine, beta-alanine, citrulline malate, and taurine for energy, pump, and focus in one scoop. Formulated to avoid the harsh crash of cheaper stimulant blends, so training intensity holds from warm-up to the last set. A favorite among MyProtein's famously flavor-obsessed community.
- Options: `Flavor`: Blue Raspberry, Fruit Burst, Cola · `Size`: 30 Servings, 60 Servings
- SKU pattern: `MP-THEPRE-{BRAS|FBST|COLA}-{30SV|60SV}`

| Size | Price (NPR) |
|---|---|
| 30 Servings | 4,200 |
| 60 Servings | 6,800 |

- Metadata: `protein_per_serving: "0g protein"` · `servings: "30 or 60 depending on pack size"` · `origin_country: "United Kingdom"` · `flavor_notes: "Blue Raspberry — sharp, sweet-tart candy flavor"`

#### 12. MyProtein BCAA
- Handle: `myprotein-bcaa` · Category: BCAA & EAA (`bcaa-eaa`)
- Description: A 2:1:1 ratio BCAA formula in a light, thirst-quenching flavor designed to be sipped during long training sessions or fasted cardio. Helps reduce muscle protein breakdown so hard-earned gains aren't lost to a tough training block. Zero sugar, easy on the stomach, easy to drink all day.
- Options: `Flavor`: Orange Mango, Berry · `Size`: 30 Servings, 60 Servings
- SKU pattern: `MP-BCAA-{ORNG|BERY}-{30SV|60SV}`

| Size | Price (NPR) |
|---|---|
| 30 Servings | 2,800 |
| 60 Servings | 4,500 |

- Metadata: `protein_per_serving: "0g protein (6g BCAA per serving)"` · `servings: "30 or 60 depending on pack size"` · `origin_country: "United Kingdom"` · `flavor_notes: "Orange Mango — tropical, light sweetness"`

---

### 6.5 GNC

#### 13. GNC Pro Performance 100% Whey Protein
- Handle: `gnc-pro-performance-100-whey-protein` · Category: Whey Protein (`whey-protein`)
- Description: A trusted everyday whey protein from the retailer that pharmacists recommend, delivering 24g of protein with a smooth, easy-mixing texture. Formulated for both post-workout recovery and as a convenient way to hit daily protein targets. Backed by GNC's decades-long reputation for quality control.
- Options: `Flavor`: Chocolate Fudge, Vanilla Bean, Unflavored · `Size`: 1lb, 5lb
- SKU pattern: `GNC-PPWHEY-{FUDG|VBN|UNFL}-{1LB|5LB}`

| Size | Price (NPR) |
|---|---|
| 1lb | 5,200 |
| 5lb | 17,800 |

- Metadata: `protein_per_serving: "24g"` · `servings: "15 (1lb) / 75 (5lb)"` · `origin_country: "USA"` · `flavor_notes: "Chocolate Fudge — rich, dessert-forward, mixes smooth in water or milk"`

#### 14. GNC Total Lean Protein Bar
- Handle: `gnc-total-lean-protein-bar` · Category: Protein Bars & Snacks (`protein-bars-snacks`)
- Description: A protein-forward snack bar with 20g of protein and controlled sugar, built for people who want dessert-level taste without derailing their nutrition plan. Soft-baked texture instead of the usual chalky, chewy protein bar experience. Fits neatly into a gym bag, desk drawer, or glovebox for whenever hunger strikes.
- Options: `Flavor`: Chocolate Fudge Brownie, Peanut Butter, Cookies & Cream · `Size`: Single Bar, Box of 12
- SKU pattern: `GNC-TLBAR-{CFB|PB|CNC}-{SGL|BOX12}`

| Size | Price (NPR) |
|---|---|
| Single Bar | 450 |
| Box of 12 | 5,000 |

- Metadata: `protein_per_serving: "20g"` · `servings: "1 bar per serving; box contains 12 bars"` · `origin_country: "USA"` · `flavor_notes: "Chocolate Fudge Brownie — soft-baked texture, rich cocoa flavor"`

#### 15. GNC Mega Men Sport Multivitamin
- Handle: `gnc-mega-men-sport-multivitamin` · Category: Vitamins & Health (`vitamins-health`)
- Description: A multivitamin formulated specifically for active men, combining core vitamins and minerals with joint- and muscle-recovery support nutrients. Designed to fill the nutritional gaps that training alone can't cover, especially for anyone training in a calorie deficit. One daily dose, no guesswork.
- Options: `Size` only: 30 Tablets, 60 Tablets (no Flavor option)
- SKU pattern: `GNC-MEGAMEN-{30TB|60TB}`

| Size | Price (NPR) |
|---|---|
| 30 Tablets | 1,500 |
| 60 Tablets | 2,600 |

- Metadata: `protein_per_serving: "0g protein (multivitamin — see Supplement Facts)"` · `servings: "1 tablet per day; pack provides 30 or 60 day supply"` · `origin_country: "USA"` · `flavor_notes: "N/A — unflavored tablet"`

---

### 6.6 Ultimate Nutrition

#### 16. Ultimate Nutrition Prostar Whey Protein
- Handle: `ultimate-nutrition-prostar-whey-protein` · Category: Whey Protein (`whey-protein`)
- Description: A gym-bag classic since the 1990s, Prostar Whey blends whey concentrate, isolate, and hydrolysate for a fast-and-sustained amino acid release. 25g of protein per scoop with a smooth, rich taste that's kept generations of lifters loyal to the brand. Proof that some formulas never needed a redesign.
- Options: `Flavor`: Chocolate Créme, Vanilla Créme, Unflavored · `Size`: 1lb, 5lb
- SKU pattern: `UN-PROSTAR-{CHOC|VAN|UNFL}-{1LB|5LB}`

| Size | Price (NPR) |
|---|---|
| 1lb | 5,500 |
| 5lb | 18,500 |

- Metadata: `protein_per_serving: "25g"` · `servings: "15 (1lb) / 75 (5lb)"` · `origin_country: "USA"` · `flavor_notes: "Chocolate Créme — classic creamy cocoa, a gym-bag staple flavor since the 90s"`

#### 17. Ultimate Nutrition BCAA 12000
- Handle: `ultimate-nutrition-bcaa-12000` · Category: BCAA & EAA (`bcaa-eaa`)
- Description: A high-dose 12,000mg BCAA formula in the classic 2:1:1 ratio, built to support muscle recovery for lifters training at real volume. Straightforward, no-nonsense formulation from one of the original American sports nutrition brands. A reliable addition to any serious training split.
- Options: `Flavor`: Fruit Punch, Grape · `Size`: 30 Servings, 60 Servings
- SKU pattern: `UN-BCAA12K-{FPCH|GRPE}-{30SV|60SV}`

| Size | Price (NPR) |
|---|---|
| 30 Servings | 3,200 |
| 60 Servings | 5,000 |

- Metadata: `protein_per_serving: "0g protein (7g BCAA per serving)"` · `servings: "30 or 60 depending on pack size"` · `origin_country: "USA"` · `flavor_notes: "Fruit Punch — classic sports-drink flavor profile"`

#### 18. Ultimate Nutrition Daily Formula Multivitamin
- Handle: `ultimate-nutrition-daily-formula-multivitamin` · Category: Vitamins & Health (`vitamins-health`)
- Description: A comprehensive daily multivitamin covering the essential vitamins, minerals, and antioxidants that support recovery and general health for active adults. Formulated as an affordable insurance policy against the nutritional gaps of a busy training schedule. Simple, complete, and easy to stick with.
- Options: `Size` only: 30 Tablets, 60 Tablets (no Flavor option)
- SKU pattern: `UN-DAILYF-{30TB|60TB}`

| Size | Price (NPR) |
|---|---|
| 30 Tablets | 1,300 |
| 60 Tablets | 2,300 |

- Metadata: `protein_per_serving: "0g protein (multivitamin — see Supplement Facts)"` · `servings: "1 tablet per day; pack provides 30 or 60 day supply"` · `origin_country: "USA"` · `flavor_notes: "N/A — unflavored tablet"`

---

### 6.7 Rule 1

#### 19. Rule 1 R1 Mass Gainer
- Handle: `rule-1-r1-mass-gainer` · Category: Mass Gainer (`mass-gainer`)
- Description: A clean-formulated mass gainer that avoids the excessive sugar of older-generation gainers, using complex carbs for sustained-release calories. Delivers real, weighable size gains for hardgainers without the bloated, sugary aftertaste. Built by a formulation team behind some of the industry's most trusted brands.
- Options: `Flavor`: Chocolate Fudge, Vanilla Custard · `Size`: 3lb, 6lb
- SKU pattern: `R1-MG-{FUDG|VCST}-{3LB|6LB}`

| Size | Price (NPR) |
|---|---|
| 3lb | 6,800 |
| 6lb | 11,200 |

- Metadata: `protein_per_serving: "45g"` · `servings: "9 (3lb) / 18 (6lb)"` · `origin_country: "USA"` · `flavor_notes: "Chocolate Fudge — clean sweetness, less sugary than typical gainers"`

#### 20. Rule 1 R1 Pre-Workout
- Handle: `rule-1-r1-pre-workout` · Category: Pre-Workout (`pre-workout`)
- Description: A clinically dosed pre-workout with clearly labeled amounts of caffeine, citrulline, and beta-alanine — no proprietary blends hiding underdosed ingredients. Delivers a smooth, sustained energy curve for training sessions that need to go the distance. Built for lifters who read labels before they buy.
- Options: `Flavor`: Blue Raspberry, Fruit Punch, Green Apple · `Size`: 30 Servings, 60 Servings
- SKU pattern: `R1-PRE-{BRAS|FPCH|GAPL}-{30SV|60SV}`

| Size | Price (NPR) |
|---|---|
| 30 Servings | 4,000 |
| 60 Servings | 6,500 |

- Metadata: `protein_per_serving: "0g protein"` · `servings: "30 or 60 depending on pack size"` · `origin_country: "USA"` · `flavor_notes: "Blue Raspberry — clean, sweet-tart profile, no aftertaste"`

#### 21. Rule 1 R1 Protein Bar
- Handle: `rule-1-r1-protein-bar` · Category: Protein Bars & Snacks (`protein-bars-snacks`)
- Description: A protein bar that actually tastes like a dessert, with 20g of protein and a soft, chewy texture that doesn't need to be warmed up to be edible. A convenient way to hit protein targets between meals without resorting to another shake. Fits easily into a bag, a locker, or a desk drawer.
- Options: `Flavor`: Chocolate Peanut Butter, Cookies & Cream, Birthday Cake · `Size`: Single Bar, Box of 12
- SKU pattern: `R1-BAR-{CPB|CNC|BDAY}-{SGL|BOX12}`

| Size | Price (NPR) |
|---|---|
| Single Bar | 500 |
| Box of 12 | 5,600 |

- Metadata: `protein_per_serving: "20g"` · `servings: "1 bar per serving; box contains 12 bars"` · `origin_country: "USA"` · `flavor_notes: "Chocolate Peanut Butter — dessert-style taste, chewy texture"`

---

### 6.8 Applied Nutrition

#### 22. Applied Nutrition Critical Mass Professional
- Handle: `applied-nutrition-critical-mass-professional` · Category: Mass Gainer (`mass-gainer`)
- Description: A professional-grade mass gainer combining whey protein, complex carbohydrates, and creatine for lifters serious about packing on size. Formulated with digestive enzymes to help the body actually absorb the extra calories, not just carry them. Bold flavors and bold results, in true Applied Nutrition style.
- Options: `Flavor`: Chocolate Peanut, Strawberry Cream · `Size`: 3lb, 6lb
- SKU pattern: `AN-CRITMASS-{CPNT|STRW}-{3LB|6LB}`

| Size | Price (NPR) |
|---|---|
| 3lb | 6,500 |
| 6lb | 10,800 |

- Metadata: `protein_per_serving: "40g"` · `servings: "9 (3lb) / 18 (6lb)"` · `origin_country: "United Kingdom"` · `flavor_notes: "Chocolate Peanut — indulgent flavor profile with a nutty finish"`

#### 23. Applied Nutrition ABE Pre-Workout
- Handle: `applied-nutrition-abe-pre-workout` · Category: Pre-Workout (`pre-workout`)
- Description: ABE — "All Black Everything" — is one of the UK's best-selling pre-workouts, combining citrulline, beta-alanine, and a smart caffeine blend for smooth, jitter-free energy. Formulated for both gym pumps and mental focus, without the crash of older-style stimulant blends. A cult favorite for a reason.
- Options: `Flavor`: Blue Raspberry Candy, Fruit Blast, Wild Berry · `Size`: 30 Servings, 60 Servings
- SKU pattern: `AN-ABE-{BRAS|FBLST|WBRY}-{30SV|60SV}`

| Size | Price (NPR) |
|---|---|
| 30 Servings | 4,500 |
| 60 Servings | 7,000 |

- Metadata: `protein_per_serving: "0g protein"` · `servings: "30 or 60 depending on pack size"` · `origin_country: "United Kingdom"` · `flavor_notes: "Blue Raspberry Candy — bold, sweet, signature ABE flavor"`

#### 24. Applied Nutrition Critical Whey
- Handle: `applied-nutrition-critical-whey` · Category: Whey Protein (`whey-protein`)
- Description: A premium whey protein blend with bold, indulgent flavors and 21g of protein per serving, built for people who refuse to choose between taste and macros. Instant-mixing formula that works just as well in a bottle as it does in a blender. Applied Nutrition's flagship whey, now on Nepali shelves.
- Options: `Flavor`: Chocolate Peanut Caramel, Vanilla, Unflavored · `Size`: 1lb, 5lb
- SKU pattern: `AN-CRITWHEY-{CPC|VAN|UNFL}-{1LB|5LB}`

| Size | Price (NPR) |
|---|---|
| 1lb | 4,900 |
| 5lb | 15,800 |

- Metadata: `protein_per_serving: "21g"` · `servings: "15 (1lb) / 75 (5lb)"` · `origin_country: "United Kingdom"` · `flavor_notes: "Chocolate Peanut Caramel — indulgent, dessert-style flavor with a salty-sweet finish"`

---

## 7. Category → product cross-check

Sanity table confirming all 7 categories are populated and all 24 products are accounted for exactly once.

| Category | Products (count) |
|---|---|
| Whey Protein | ON Gold Standard Whey, MuscleBlaze Biozyme Whey, Dymatize ISO100, MyProtein Impact Whey, GNC Pro Performance Whey, Ultimate Nutrition Prostar Whey, Applied Nutrition Critical Whey (**7**) |
| Mass Gainer | ON Serious Mass, MuscleBlaze Mass Gainer XXL, Rule 1 R1 Mass Gainer, Applied Nutrition Critical Mass Professional (**4**) |
| Creatine | ON Micronized Creatine, MuscleBlaze Creatine Monohydrate, Dymatize Creatine Micronized (**3**) |
| Pre-Workout | MyProtein THE Pre-Workout, Rule 1 R1 Pre-Workout, Applied Nutrition ABE Pre-Workout (**3**) |
| BCAA & EAA | Dymatize BCAA Complex 5050, MyProtein BCAA, Ultimate Nutrition BCAA 12000 (**3**) |
| Protein Bars & Snacks | GNC Total Lean Protein Bar, Rule 1 R1 Protein Bar (**2**) |
| Vitamins & Health | GNC Mega Men Sport Multivitamin, Ultimate Nutrition Daily Formula Multivitamin (**2**) |
| **Total** | **24** |

Every brand contributes exactly 3 products (per §6.1–6.8); every category has at least 2.

---

## 8. Seed script execution order

Write this as one idempotent `seed.ts` (or split into helper functions) that can be re-run safely — look up every entity by its handle/name first and skip creation if it already exists, matching the pattern the medusa-starter-default seed already uses for its Europe demo data (which this replaces).

1. **Store settings** — set default currency `npr`, supported currencies `[npr]`.
2. **Region** — create `Nepal` (§1.2).
3. **Sales channel** — create/rename `Protein Pasal Online` (§1.3); create a scoped **publishable API key**; log it at the end of the run for the storefront `.env`.
4. **Stock location** — create `Kathmandu Warehouse` (§1.4), link to the sales channel.
5. **Shipping** — create the fulfillment set, `All of Nepal` service zone, and the two shipping options (§1.5); link the shipping profile.
6. **(Optional) Promotion** — free-shipping-over-Rs-10,000 automatic promotion, only if quick to wire up for the pinned Medusa version.
7. **Collections** — create all 8 brand collections (§2).
8. **Categories** — create all 7 categories (§3), all top-level/published.
9. **Products** — for each of the 24 products in §6: create the product with its options, generate every Flavor × Size variant combination (weight/inventory looked up from §4), attach the product image (§5.2), set `collection_id`, `category_ids`, `status: published`, link to the sales channel and shipping profile, and set `metadata`.
10. **Inventory** — for every variant created in step 9, create an `inventory_item` and an `inventory_level` at the `Kathmandu Warehouse` stock location using the quantity from the relevant §4 table.
11. **Prices** — attach an NPR price to every variant per the per-product tables in §6 (Medusa v2 prices live on the variant's price set, scoped to the `npr` currency — no region-specific price list needed since there's only one region at launch).

Remove or gate off the starter's original demo seed data (Europe region, generic t-shirt products, "Default Sales Channel" if renamed rather than reused) so the storefront doesn't show mixed placeholder catalogs.
