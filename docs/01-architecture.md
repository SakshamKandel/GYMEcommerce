# 01 — Software Architecture

**Project:** Protein Pasal — multi-brand protein & sports-supplement e-commerce for Nepal
**Stack (fixed):** Medusa v2.16.0 backend + Next.js 15 App Router storefront + PostgreSQL 18
**Status of this doc:** Authoritative. Implementation agents execute this without further questions.

This document is the system-level contract for the whole build. It is grounded in the actual scaffolded repos at `E:\CLI\protein-pasal\backend` and `E:\CLI\protein-pasal\storefront` (both already cloned and `node_modules` installed). Where the current starter defaults differ from what Protein Pasal needs (e.g. the seed ships a Europe/EUR region), this doc states the target and the delta.

---

## 1. System overview & topology

### 1.1 Component diagram

```
                                   ┌──────────────────────────────────────────┐
                                   │              BROWSER (Nepal)               │
                                   │   Mostly mobile, mixed 4G/broadband        │
                                   └───────────────┬────────────────────────────┘
                                                   │ HTTPS
                                                   ▼
        ┌───────────────────────────────────────────────────────────────────────────┐
        │  STOREFRONT  —  Next.js 15.3.9 (App Router, React 19, Tailwind 3)           │
        │  Port 8000 (dev). SSR + React Server Components + Next.js Data Cache.       │
        │                                                                             │
        │   middleware.ts ── region routing  (/np/...)   caches region map 1h        │
        │   RSC data layer (src/lib/data/*.ts) ── @medusajs/js-sdk                    │
        │        every /store call sends  x-publishable-api-key                       │
        └───────────────┬─────────────────────────────────────────┬─────────────────┘
                        │ Store REST API (HTTP/JSON)               │ (build/runtime only)
                        │ GET /store/products, /store/carts, ...   │ Next image optimizer
                        ▼                                          ▼
        ┌───────────────────────────────────────────────┐   ┌──────────────────────┐
        │  MEDUSA BACKEND  —  @medusajs/medusa 2.16.0    │   │  IMAGE / FILE STORE    │
        │  Port 9000.  Node ≥20.                         │   │  dev: local /static    │
        │                                                │   │  prod: S3 / R2 / B2    │
        │   /store/*   Store API   (publishable-key gated)│  └──────────────────────┘
        │   /admin/*   Admin API   (session/bearer auth)  │
        │   /app       Admin Dashboard (Vite SPA served   │
        │              by the backend on :9000/app)       │
        │                                                 │
        │   Module runtime: Product, Pricing, Inventory,  │
        │   Stock Location, Fulfillment, Payment, Cart,    │
        │   Order, Customer, Auth, Region, Sales Channel,  │
        │   Tax, Promotion, Notification, File, API Key    │
        │                                                 │
        │   Event Bus + Workflow Engine + Cache:           │
        │     dev = in-memory   |   prod = Redis           │
        └───────────────┬─────────────────────────┬───────┘
                        │ SQL (pg)                 │ (prod) Redis
                        ▼                          ▼
        ┌───────────────────────────────┐   ┌──────────────────────┐
        │  PostgreSQL 18                 │   │  Redis (prod only)    │
        │  localhost:5432                │   │  event bus, workflow  │
        │  db: protein_pasal             │   │  engine, cache        │
        │  single DB, Medusa-owned schema│   └──────────────────────┘
        └───────────────────────────────┘
```

### 1.2 Request lifecycle (product listing page, the hot path)

1. Browser hits `https://proteinpasal.com/np/store` (or `/np/whey`, `/np/collections/optimum-nutrition`).
2. `middleware.ts` resolves the region from the URL country segment (`np`). It keeps a 1-hour in-memory cache of the country→region map fetched once from `GET /store/regions`.
3. The App Router server component calls `listProducts()` (`src/lib/data/products.ts`), which uses `@medusajs/js-sdk` → `GET /store/products?region_id=...&fields=*variants.calculated_price,+metadata,+tags,...`.
4. Every call carries `x-publishable-api-key`, scoping results to the **Protein Pasal Web** sales channel.
5. Medusa resolves price sets for NPR (via the region), inventory, categories, collection (brand), tags, and product metadata in one graph query.
6. Response is stored in the **Next.js Data Cache** (`cache: "force-cache"` + tag). Subsequent requests are served from cache until the tag is revalidated by a backend change.
7. The RSC streams HTML to the browser; product images are optimized by the Next image pipeline.

**Two independent processes, one database.** The storefront never touches Postgres directly (the `pg` dependency in the storefront is only used by the Next cache handler / edge helpers, not for product data). All commerce data flows through Medusa's Store API. This keeps the storefront stateless and horizontally scalable.

---

## 2. Medusa v2 module map

Medusa v2 is a **modular monolith**: one process, many commerce modules resolved from a DI container. The starter registers the default module set; we do **not** need custom data modules for launch — multi-brand is expressed with built-in Collections/Categories/metadata (see §3). Below is the concrete configuration each module needs for Nepal.

| Module | Purpose | Protein Pasal target config |
|---|---|---|
| **Region** (`Modules.REGION`) | Currency, tax behaviour, allowed payment providers, countries | One region **"Nepal"**, `currency_code: "npr"`, `countries: ["np"]`, `payment_providers: ["pp_system_default"]` (COD at launch). Replaces the seed's Europe/EUR region. |
| **Sales Channel** (`Modules.SALES_CHANNEL`) | Segments which products are sellable through which frontends | Rename **"Default Sales Channel" → "Protein Pasal Web"**. All published products linked to it. (Keep a second "Admin/Internal" channel available for future POS.) |
| **API Key** (`Modules.API_KEY`) | Publishable keys scope Store API to sales channels | One **publishable** key titled "Protein Pasal Storefront", linked to the web sales channel. Its value replaces `pk_test` in the storefront env after seeding. Admin/secret keys are not used by the storefront. |
| **Stock Location** (`Modules.STOCK_LOCATION`) | Physical inventory origin | One location **"Kathmandu Warehouse"** (`country_code: "NP"`). Linked to the web sales channel and to the `manual_manual` fulfillment provider. Replaces "European Warehouse". |
| **Inventory** (`Modules.INVENTORY`) | Per-location stock counts, reservations | Inventory items auto-created per variant; seed sets levels at the Kathmandu location. Enables real "out of stock" / backorder behaviour. |
| **Fulfillment** (`Modules.FULFILLMENT`) | Fulfillment sets, service zones, shipping options, providers | One fulfillment set "Nepal Delivery" using the built-in **`manual`** provider (`manual_manual`). Service zone(s) + two flat-rate shipping options — see §5. |
| **Payment** (`Modules.PAYMENT`) | Payment providers, sessions, captures, refunds | Launch: **`pp_system_default`** (the built-in *manual* provider) = Cash on Delivery. Roadmap: `pp_esewa_esewa`, `pp_khalti_khalti` custom providers (§9). |
| **Pricing** (`Modules.PRICING`) | Price sets, price lists, tax-inclusive pricing | Variant price sets in **NPR**. Prices stored **VAT-inclusive** (Nepal retail convention). Optional price lists for sale/discount campaigns. |
| **Tax** (`Modules.TAX`) | Tax regions & rates | One tax region `np` at **13% VAT**, configured as **tax-inclusive** so displayed prices equal charged prices. Provider `tp_system`. |
| **Product** (`Modules.PRODUCT`) | Products, variants, options, **categories**, **collections**, tags, images | The catalog core. Collections = brands, Categories = product types, options = Flavor × Size (§3). |
| **Cart** (`Modules.CART`) | Line items, totals, promotions, shipping selection | Used as-is by storefront checkout flow. |
| **Order** (`Modules.ORDER`) | Order capture, fulfillment, returns, edits | Used as-is; drives customer order history. |
| **Customer** (`Modules.CUSTOMER`) | Customer accounts & addresses | Used as-is; storefront account area. |
| **Auth** (`Modules.AUTH`) | Storefront + admin authentication (emailpass) | Default `emailpass` provider for both customers and admin users. |
| **Promotion** (`Modules.PROMOTION`) | Discounts, promo codes | Available for launch coupons (e.g. `WELCOME10`). Optional at launch, no schema work needed. |
| **Notification** (`Modules.NOTIFICATION`) | Transactional messages | Dev: `noop`/local logger. Prod: add an email provider (Resend or SMTP) for order-confirmation + COD-received emails. Design only for launch; see §7.4. |
| **File** (`Modules.FILE`) | Product image & asset storage | Dev: **local** provider (`/static`, served from `:9000`). Prod: **S3-compatible** (Cloudflare R2 / Backblaze B2 / AWS S3) — mandatory before any managed/ephemeral host. |
| **Event Bus / Workflow Engine / Cache** | Async events, durable workflows, cache | Dev: **in-memory** (default, zero-config). Prod: **Redis** for all three (durability + multi-instance). |

### 2.1 Admin dashboard

The Medusa Admin is a Vite SPA **built into and served by the backend** at `http://localhost:9000/app`. There is no separate admin deployment. Store staff use it to: create brands (collections) and product types (categories), add products with variants/prices/metadata, manage inventory at the Kathmandu warehouse, and process COD orders (mark as captured/fulfilled). Admin API lives under `/admin/*` and is session/JWT-authenticated — never exposed to the storefront.

### 2.2 What we register vs. what ships by default

`medusa-config.ts` currently declares only `projectConfig` (DB + CORS + secrets); it does **not** enumerate `modules`, so Medusa loads its full default module set automatically. For launch we keep it that way and only **add** module blocks when we introduce infrastructure that needs configuration:

- **Now (local dev):** no `modules` block needed. Defaults + the corrected seed are sufficient.
- **Adding Redis (prod):** add `eventBus`, `workflowEngine`, and `cacheService` Redis modules, plus `redisUrl` in `projectConfig`.
- **Adding S3 file storage (prod):** add a `@medusajs/file` module with the S3 provider.
- **Adding eSewa/Khalti (roadmap):** add a `@medusajs/payment` module block listing the custom provider modules (§9).

Keeping the config minimal until infra demands otherwise avoids the classic Medusa v2 pitfall of a half-declared `modules` array silently disabling defaults.

---

## 3. Multi-brand catalog model

The single most important domain decision: **one storefront, many manufacturers, in one place**. Medusa's built-in taxonomy expresses this cleanly without a custom module.

### 3.1 The mapping

| Concept | Medusa entity | Cardinality | Why |
|---|---|---|---|
| **Brand** (Optimum Nutrition, MuscleBlaze, Dymatize, MyProtein, GNC, Ultimate Nutrition, Rule 1, Kaged, Applied Nutrition, …) | **Collection** | A product belongs to **exactly one** collection (`collection_id` is a single FK) | A physical tub of protein is made by exactly one company → 1:1 fits perfectly. Collections give us `/collections/{handle}` brand pages for free. |
| **Product type** (Whey, Mass Gainer, Creatine, Pre-Workout, BCAA/EAA, Protein Bars, Multivitamins) | **Category** | Many-to-many (a product can sit in several categories) | Product types are how shoppers browse ("show me all whey"). M2M lets a combo product appear under both "Whey" and "Protein Bars" if needed, and supports category nesting later (e.g. Whey → Isolate / Concentrate). |
| **Flavor & Size** | **Variant options** | Options × values → variants | Flavor (Chocolate, Vanilla, Cookies & Cream…) and Size (1 lb / 2 lb / 5 lb / 1 kg / 2 kg) are the purchasable dimensions with their own SKU, price, and stock. |
| **Cross-cutting facets** (Goal, Diet, "On sale", "New") | **Tags** | Many-to-many | Lightweight filters that don't deserve a category: `goal:bulking`, `goal:lean`, `diet:veg`, `new`, `bestseller`. |

**Filtering & discovery** all fall out of this: brand pages = filter by `collection_id`; type pages = filter by `category_id`; the store PLP composes `collection_id` + `category_id` + `tags` + price range + sort. The Store API supports all of these as query params, so no custom endpoints are required for launch.

### 3.2 Metadata schema (the enrichment layer)

Collections and Categories are intentionally thin. We enrich them and products with **`metadata`** (a JSON bag on every Medusa entity). This is the agreed way to carry supplement-specific and brand-specific fields without custom tables. Define these keys as the **canonical schema** — seeders and the storefront both read exactly these:

**Collection (brand) metadata**
```jsonc
{
  "origin_country": "USA",              // brand's country of origin — badge on brand page
  "authenticity_note": "100% authentic, imported. Scan QR to verify on the ON site.",
  "brand_tagline": "The World's #1 Sports Nutrition Brand",
  "logo_url": "https://cdn.../on-logo.png",
  "is_featured": true,                   // surfaces in homepage brand strip
  "sort_weight": 10                      // manual ordering (Collections have no native order)
}
```

**Product metadata** (nutrition & merchandising facts; NOT the purchasable dimensions)
```jsonc
{
  "protein_per_serving_g": 24,
  "serving_size_g": 30.4,
  "servings_per_container": 74,          // note: can vary by size variant — see variant metadata
  "form": "powder",                      // powder | capsule | tablet | bar | liquid
  "primary_goal": "muscle_building",     // muscle_building | recovery | lean | endurance | wellness
  "diet": ["veg"],                       // veg | non_veg | vegan | gluten_free ...
  "key_ingredients": ["Whey Protein Isolate", "Whey Protein Concentrate"],
  "directions": "Mix 1 scoop with 180-240ml cold water or milk.",
  "warnings": "Not a substitute for a varied diet. Keep out of reach of children.",
  "mrp_npr": 8500,                       // list price for strike-through vs. selling price
  "authenticity": "official_import",     // official_import | authorized_dealer
  "highlight": "24g protein · 5.5g BCAAs · gluten free"  // short PDP hero line
}
```

**Variant metadata** (per Flavor×Size, when facts differ by size)
```jsonc
{
  "servings": 74,                        // overrides product-level for this size
  "net_weight_g": 2270,                  // e.g. 5 lb tub
  "barcode": "748927024081"
}
```

**Rules for implementers:**
- Nutrition facts that are constant across sizes live on the **product**; anything that changes with size (servings, net weight) lives on the **variant** and overrides the product value in the PDP.
- Flavor/Size are **options**, never metadata — they must be purchasable and stockable.
- `metadata` is already requested by the storefront: `products.ts` fetches `+metadata` and `+tags`. No storefront data-layer change is needed to read these; only PDP/PLP components must render them.
- A small **admin widget** (product form injection zone) should be added later to make these fields first-class in the dashboard, but for launch the seed + the admin's raw metadata editor are sufficient.

### 3.3 Seed rewrite (delta from the shipped seed)

`backend/src/scripts/seed.ts` currently seeds a Europe/EUR clothing catalog. It must be rewritten (tracked as task #3, not this doc's job) to:
1. Region **Nepal / NPR / [np]**, tax region `np` @ 13% inclusive.
2. Sales channel **Protein Pasal Web**; stock location **Kathmandu Warehouse**.
3. Fulfillment set with the two Nepal shipping options (§5).
4. **Collections** for each brand; **Categories** for each product type.
5. Products with Flavor×Size variants, NPR prices, and the metadata schema above.
6. Publishable key linked to the web channel — its value is copied into the storefront env.

This doc defines the *shape*; the seed task supplies the *data*.

---

## 4. Environment variables

### 4.1 Backend (`backend/.env`) — current real values

```dotenv
# --- Database ---
DATABASE_URL=postgres://postgres:1234@localhost:5432/protein_pasal
DB_NAME=protein_pasal

# --- CORS (dev) ---
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000

# --- Secrets (dev values; ROTATE for prod) ---
JWT_SECRET=pp_dev_jwt_9f4c2b7a1e8d6053c4a2f7b9d1e0c8a6
COOKIE_SECRET=pp_dev_cookie_3b8e1f6a9c0d4275e8b3a1f6c9d02e47
```

`medusa-config.ts` reads `DATABASE_URL`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`. `:5173` in CORS is the Vite dev port for admin-extension development and is harmless to keep.

**Additional backend vars for production** (not present in dev):
```dotenv
REDIS_URL=redis://:password@host:6379          # enables Redis event bus / workflow engine / cache
NODE_ENV=production
# S3-compatible file storage (Cloudflare R2 example)
S3_FILE_URL=https://<accountid>.r2.cloudflarestorage.com
S3_BUCKET=protein-pasal-media
S3_REGION=auto
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
# Payment provider secrets (roadmap)
ESEWA_MERCHANT_CODE=...
ESEWA_SECRET_KEY=...
KHALTI_SECRET_KEY=...
# Notification (roadmap)
RESEND_API_KEY=...
NOTIFICATION_FROM=orders@proteinpasal.com
```

### 4.2 Storefront (`storefront/.env.local`) — current real values

```dotenv
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test           # REPLACE with real key after seeding
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=np                        # already set to Nepal ✔
NEXT_PUBLIC_STRIPE_KEY=                              # unused (no Stripe at launch)
REVALIDATE_SECRET=pp_dev_revalidate_7d2a9c4e1f8b6035
```

Consumed as follows: `src/lib/config.ts` builds the js-sdk with `MEDUSA_BACKEND_URL` + `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; `middleware.ts` reads `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_DEFAULT_REGION` for region routing; on-demand revalidation uses `REVALIDATE_SECRET`.

**Critical launch gotcha:** `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is still the placeholder `pk_test`. The storefront will fail every Store API call (401 / missing key) until it is replaced with the real publishable key value that the seed creates. **Order of operations: run backend → run seed → copy the generated `pk_...` into `storefront/.env.local` → (re)start storefront.** `NEXT_PUBLIC_*` vars are inlined at build time, so the storefront must be restarted after changing the key.

**Additional storefront vars for production:**
```dotenv
MEDUSA_BACKEND_URL=https://api.proteinpasal.com
NEXT_PUBLIC_BASE_URL=https://proteinpasal.com
# add prod image host to next.config.js remotePatterns (see §7.3)
```

### 4.3 Secret hygiene

- `.env` is git-ignored; `.env.template` (checked in) documents keys with placeholder values. Keep the template in sync when adding keys.
- Rotate `JWT_SECRET`/`COOKIE_SECRET` for production (the dev values above are known/committed to history-adjacent docs and must not ship).
- Never expose admin or secret API keys to the storefront — only the **publishable** key belongs in `NEXT_PUBLIC_*`.

---

## 5. Nepal commerce configuration

### 5.1 Region, currency, tax

- **Region:** "Nepal", `currency_code: npr`, `countries: ["np"]`.
- **Currency handling:** Medusa v2 stores prices in **major units** (the seed uses `amount: 10` = €10.00). NPR is used without paisa in retail, so `amount: 4200` = **Rs 4,200**. Do not multiply by 100.
- **Tax:** Nepal VAT is **13%**. Configure the `np` tax region at 13% and price **tax-inclusive**, so the number on the card equals the number charged (matches Nepali retail expectation and avoids checkout surprises). Set the region's pricing to tax-inclusive and store variant prices as the final rupee amount.

### 5.2 Shipping — two zones, flat rates

The brief specifies **"Inside Kathmandu Valley"** and **"Outside Valley"**. Medusa geo-zones key off country/province/city/zip, and "Kathmandu Valley" (Kathmandu + Lalitpur + Bhaktapur districts) does not map to a single clean province. Decisive approach for launch:

- **One fulfillment set** ("Nepal Delivery") on the **Kathmandu Warehouse**, **one service zone** covering country `np`.
- **Two flat-rate shipping options** the customer selects at checkout:
  - **"Inside Kathmandu Valley"** — lower flat rate (e.g. Rs 100), `code: valley`.
  - **"Outside Valley"** — higher flat rate (e.g. Rs 150–250), `code: outside`.
- Both use the `manual_manual` provider and the default shipping profile. Optionally add a free-shipping threshold later via a Promotion.
- **Why not geo-fence the valley?** City-type geo zones would require enumerating every valley municipality and still can't stop a customer choosing the wrong option. Two explicit, clearly-labelled options are simpler, transparent, and verified by staff at fulfillment time. Province-level geo zones (splitting Bagmati) can be layered in later if abuse appears.

### 5.3 Payments at launch — Cash on Delivery

- COD is delivered by the built-in **manual** payment provider, id **`pp_system_default`**, listed in the Nepal region's `payment_providers`.
- Checkout flow: customer places order → payment session on the manual provider → order created in "not paid"/"awaiting" → staff mark **captured** in the admin when cash is collected on delivery. No gateway, no PCI surface.
- The storefront's payment step must present COD as the (only) option and must **not** require the Stripe key (`NEXT_PUBLIC_STRIPE_KEY` stays empty; the Stripe UI path is bypassed/removed in the checkout restyle task).

---

## 6. Local dev topology (Windows 11, no Docker)

| Service | Command (from its dir) | Host:Port | Notes |
|---|---|---|---|
| PostgreSQL 18 | (Windows service, already running) | `localhost:5432` | db `protein_pasal`, user `postgres`, password `1234`. Native install — **not** the `docker-compose.yml` Postgres. |
| Medusa backend + Admin | `npm run dev` (`medusa develop`) | `localhost:9000` | Store API `/store`, Admin API `/admin`, Admin UI `/app`. In-memory event bus/cache (no Redis needed). |
| Next.js storefront | `npm run dev` (`next dev --turbopack -p 8000`) | `localhost:8000` | Region-routed under `/np`. Turbopack dev. |

**One-time bring-up sequence (documented for the run task, task #10):**
```
1. Ensure Postgres 18 is running and DB protein_pasal exists (owner postgres).
2. backend:  npx medusa db:migrate          # create schema
3. backend:  npm run seed                    # Nepal region, brands, catalog, publishable key
4. backend:  npx medusa user -e admin@proteinpasal.com -p <pw>   # create an admin login
5. backend:  npm run dev                     # http://localhost:9000/app
6. Copy the seed's publishable key -> storefront/.env.local NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
7. storefront: npm run dev                    # http://localhost:8000/np
```

**Docker note:** `E:\CLI\protein-pasal\docker-compose.yml` exists and maps a containerized Postgres to host **5433** (to avoid clashing with the native 5432). It is an **optional, self-contained alternative** for reproducible full-stack runs, **not** the primary dev path. The fixed decision is native Windows + native Postgres on 5432. Do not run both Postgres instances against the same port.

**Windows specifics:**
- Shell is PowerShell; the Bash tool is available for POSIX scripts. Use `npx medusa ...` (the `.bin` shims resolve on Windows).
- No `NODE_OPTIONS` gymnastics needed for dev; the test scripts already set them.
- Turbopack + Next 15 + React 19 is the configured dev path; if Turbopack misbehaves on Windows, fall back to `next dev -p 8000` (drop `--turbopack`).

---

## 7. Production deployment (Nepal / regional)

### 7.1 Recommended topology

Split the two apps by their nature: the **storefront is stateless and CDN-friendly**; the **backend is stateful and latency-sensitive to its DB**.

```
   Users (Nepal, mobile-first)
        │
   Cloudflare (DNS, TLS, CDN, DDoS, brotli)      ← proteinpasal.com + api.proteinpasal.com
        ├──────────────► STOREFRONT  ── Vercel (or Cloudflare Pages)
        │                    Next.js 15, edge/SSR, global POPs
        │                    talks to api.proteinpasal.com over HTTPS
        │
        └──────────────► BACKEND  ── VPS in a low-latency region to Nepal
                             (AWS ap-south-1 Mumbai / DigitalOcean BLR1 Bangalore /
                              a reputable Nepali IaaS)
                             ├─ Medusa server process  (HTTP :9000, PM2/systemd)
                             ├─ Medusa worker process  (jobs/subscribers, worker mode)
                             ├─ PostgreSQL 18   (managed DB or same VPS)
                             ├─ Redis           (event bus, workflow engine, cache)
                             └─ Object storage  (Cloudflare R2 / Backblaze B2) for images
```

**Why this shape:**
- **Latency:** Nepal has excellent peering to India/Singapore. Mumbai (ap-south-1) or Bangalore VPS gives ~30–60 ms RTT to Kathmandu — far better than US/EU regions. Keep Postgres in the **same region and ideally the same VPC/host** as the backend; DB round-trips dominate API latency.
- **Storefront on Vercel** gives global edge SSR + image optimization + zero-ops deploys and pairs natively with this Next starter. Cloudflare Pages is a cheaper alternative if egress/cost matters.
- **Cloudflare in front of both** provides free TLS, caching, and DDoS protection, which matters for a consumer store in a market with variable connectivity.

### 7.2 A realistic, phased path

**Phase 0 — Launch (cheapest that's still real):**
- One VPS (2 vCPU / 4 GB, e.g. DigitalOcean Bangalore or Hetzner) running: Medusa (server + worker via PM2), PostgreSQL 18, Redis — all on the box.
- Cloudflare R2 for product images (free egress; S3-compatible) via the Medusa File S3 module.
- Storefront on **Vercel** free/pro, `MEDUSA_BACKEND_URL=https://api.proteinpasal.com`.
- Nightly `pg_dump` to R2/B2 for backups.
- Cost: ~US$12–25/mo VPS + Vercel + near-zero R2.

**Phase 1 — Harden:**
- Move Postgres to a **managed DB** (DO Managed Postgres / Neon / RDS) for automated backups + PITR.
- Managed **Redis** (Upstash / DO).
- Run Medusa in explicit **worker mode**: two processes sharing DB+Redis — one `MEDUSA_WORKER_MODE=server` (HTTP only), one `MEDUSA_WORKER_MODE=worker` (subscribers, scheduled jobs). Prevents long jobs from blocking API requests.
- Add a Notification email provider (Resend/SMTP) for order confirmations.

**Phase 2 — Scale:**
- Multiple backend server instances behind a load balancer (stateless once Redis-backed).
- **Meilisearch** instance for search (§8).
- CDN cache rules tuned per route; image resizing at the edge.

### 7.3 Deploy-time checklist

- Add the production image host to `storefront/next.config.js` `images.remotePatterns` (currently only `localhost`, Medusa demo S3, and Unsplash are whitelisted). Add your R2/B2/S3 hostname or the Next `<Image>` optimizer will 400 on prod images.
- Set production CORS on the backend: `STORE_CORS=https://proteinpasal.com`, `ADMIN_CORS=https://api.proteinpasal.com`, `AUTH_CORS=https://proteinpasal.com,https://api.proteinpasal.com`.
- `medusa build` then serve `.medusa/server`; run DB migrations on deploy (`medusa db:migrate`).
- Admin is served at `https://api.proteinpasal.com/app`; protect with strong admin passwords + Cloudflare.
- Rotate all secrets; set `NODE_ENV=production` (also makes auth cookies `secure`).
- Payment/webhook readiness: eSewa/Khalti callbacks require the backend to be publicly reachable over HTTPS (Cloudflare-proxied is fine).

### 7.4 Notifications (design note, not launch-blocking)

Order lifecycle emails (order placed, COD confirmed/dispatched) should be sent from a Medusa **subscriber** on `order.placed` / `order.fulfillment_created` via a Notification provider (Resend recommended for simple setup; SMTP if using a Nepali mail host). SMS (via a Nepali gateway like Sparrow SMS) is a strong Phase-1 addition given SMS reach in Nepal, implemented the same way (a subscriber calling the gateway API). Not required for the initial functional launch.

---

## 8. Performance, caching & search

### 8.1 Caching layers (already wired in the starter)

1. **Next.js Data Cache (App Router).** The storefront data layer fetches with `cache: "force-cache"` and attaches **cache tags** (`getCacheOptions("products")`, etc.). Product/collection/category responses are cached until their tag is revalidated.
2. **Tag-based on-demand revalidation.** The starter derives cache tags from a per-visitor `_medusa_cache_id` cookie. For launch, add a backend **subscriber** on `product.updated` / `product.created` / `product.deleted` (and collection/category events) that calls the storefront's revalidation endpoint with `REVALIDATE_SECRET`, invalidating the relevant tags so edits appear without a full redeploy. (The per-cache-id scoping means we should also support a global revalidate for catalog-wide changes — implement the revalidate route to accept a tag and clear it globally.)
3. **Middleware region-map cache.** `middleware.ts` caches the country→region map in memory for **1 hour** and revalidates the `/store/regions` fetch every 3600 s. Fine for a single stable Nepal region.
4. **Medusa/Redis cache (prod).** The Redis cache module memoizes pricing/inventory graph queries server-side.
5. **CDN/edge.** Cloudflare + Vercel cache static assets and optimized images.

### 8.2 Staleness policy (recommended revalidate windows)

| Data | Volatility | Policy |
|---|---|---|
| Product list / detail | Medium (price, stock, new SKUs) | Cache + **event-driven revalidation** on product change; fallback time-based 60–300 s. |
| Collections (brands) / Categories (types) | Low | Cache 1 h; revalidate on change. |
| Regions | Very low | 1 h (as shipped). |
| Cart / customer / orders | Per-request, user-specific | **Never cached** — these carry auth headers and use `cache: no-store` semantics. |

**Inventory caveat:** cached PLPs can show stock that's seconds stale. Acceptable for launch (COD, low contention). Re-validate authoritative stock at add-to-cart / checkout, where Medusa reserves inventory transactionally.

### 8.3 Frontend performance

- Nepal is **mobile-first on variable networks** — this is the primary performance constraint. Ship RSC-rendered HTML (minimal client JS), lazy-load below-the-fold imagery, and use `next/image` with explicit sizes for the card grids.
- Serve images from an S3/R2 host through the Next optimizer (AVIF/WebP, responsive sizes) — never hotlink full-res tubs.
- The heavy brutalist display fonts (Anton / Archivo Black class) must be **self-hosted and preloaded** with `font-display: swap` to avoid layout shift on the giant headlines (design concern owned by the storefront design task; flagged here as a perf dependency).
- Keep the marquee/ticker and horizontal-scroll rows CSS-driven, not JS animation loops, to protect low-end devices.

### 8.4 Search — launch with built-in, add Meilisearch on a trigger

**Launch: Medusa built-in product search.** `GET /store/products?q=<term>` does a Postgres `ILIKE` match across product title/description/variant fields. The storefront data layer already forwards `queryParams` to `/store/products`, so wiring search is: add a `q` param from the search box → pass it through `listProducts`. Zero new infrastructure. Adequate for the launch catalog (hundreds of SKUs across ~10 brands).

Limitations to accept at launch: no typo tolerance ("wey" ✗ "whey"), no relevance ranking, no faceted search counts, `ILIKE` degrades as the catalog grows.

**Add Meilisearch when any of these is true:**
- Catalog exceeds ~1–2k SKUs, **or**
- Users need typo tolerance / instant "search-as-you-type", **or**
- The PLP needs fast faceted counts (brand × type × flavor × price) that Postgres filtering makes sluggish.

**Meilisearch integration shape (Phase 2):**
- Run a Meilisearch instance (Docker/Meilisearch Cloud) alongside the backend.
- Backend **subscribers** on `product.created/updated/deleted` upsert/delete documents in a `products` index (via `@rokmohar/medusa-plugin-meilisearch` or a thin custom module).
- Index only searchable/filterable fields: `title`, `description`, `brand` (collection), `type` (categories), `flavors`, `tags`, `min_price`, `thumbnail`, `handle`. Configure `searchableAttributes`, `filterableAttributes`, `sortableAttributes`.
- Storefront **search page** queries Meilisearch directly (via `instant-meilisearch` + React InstantSearch) for autocomplete/instant results; the **PDP and cart still go through Medusa** (source of truth for price/stock). The starter already carries `@types/react-instantsearch-dom`, signalling this exact intended path.

---

## 9. Extension point — eSewa & Khalti payment providers (interface sketch)

Both are Nepal's dominant wallets and both use a **redirect / lookup-verify** flow (no card data touches us), which maps directly onto Medusa v2's payment-provider interface. This is a **sketch for a later task**, not launch scope.

### 9.1 How Medusa v2 payment providers plug in

A payment provider is a **module** whose service extends `AbstractPaymentProvider` and is registered under the Payment module in `medusa-config.ts`:

```ts
// medusa-config.ts (roadmap)
module.exports = defineConfig({
  projectConfig: { /* ... */ },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          { resolve: "./src/modules/payment-khalti", id: "khalti",
            options: { secretKey: process.env.KHALTI_SECRET_KEY } },
          { resolve: "./src/modules/payment-esewa", id: "esewa",
            options: { merchantCode: process.env.ESEWA_MERCHANT_CODE,
                       secretKey: process.env.ESEWA_SECRET_KEY } },
        ],
      },
    },
  ],
})
```
Once registered, the provider id (`pp_khalti_khalti`, `pp_esewa_esewa`) is added to the **Nepal region's `payment_providers`** so it appears at checkout beside COD.

### 9.2 Provider service interface (the methods to implement)

```ts
import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
  CreatePaymentProviderSession,
  ProviderWebhookPayload,
  PaymentProviderError,
  PaymentSessionStatus,
  PaymentProviderSessionResponse,
} from "@medusajs/framework/types"

type KhaltiOptions = { secretKey: string }

class KhaltiProviderService extends AbstractPaymentProvider<KhaltiOptions> {
  static identifier = "khalti"

  // Create a payment intent when checkout reaches the payment step.
  // Return the data the storefront needs to redirect the customer to Khalti
  // (payment_url + pidx). No money moves yet.
  async initiatePayment(
    input: CreatePaymentProviderSession
  ): Promise<PaymentProviderSessionResponse | PaymentProviderError> { /* POST /epayment/initiate/ */ }

  // Called on return from the wallet (and/or by webhook). Verify the pidx via
  // Khalti's lookup API; return AUTHORIZED only if status === "Completed".
  async authorizePayment(
    sessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<{ status: PaymentSessionStatus; data: Record<string, unknown> }
    | PaymentProviderError> { /* POST /epayment/lookup/ */ }

  async capturePayment(paymentData): Promise<...>   // wallet auto-captures → confirm/no-op
  async cancelPayment(paymentData): Promise<...>
  async refundPayment(paymentData, amount): Promise<...>   // Khalti refund API
  async retrievePayment(paymentData): Promise<...>          // lookup by pidx
  async getPaymentStatus(paymentData): Promise<PaymentSessionStatus>
  async deletePayment(paymentData): Promise<...>
  async updatePayment(input): Promise<...>

  // Verify the webhook signature and map it to a Medusa action
  // (authorized / captured / failed) + the amount, so Medusa reconciles the order.
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<{ action: string; data: { session_id: string; amount: number } }> { /* verify + map */ }
}

export default KhaltiProviderService
```

**eSewa** implements the identical interface; only the API calls differ:
- **Khalti (KPG-2 / ePayment):** `initiate` returns `{ pidx, payment_url }` → redirect → on return, `lookup` by `pidx` → `Completed` ⇒ authorize. Amounts in **paisa** (×100) — convert from the NPR major-unit prices.
- **eSewa (ePay v2):** `initiate` builds a signed form (HMAC-SHA256 over `total_amount,transaction_uuid,product_code` with the secret) POSTed to eSewa's form URL → redirect → success URL returns a base64 payload → verify via the status-check API ⇒ authorize.

**Storefront side:** the checkout payment step reads the session's redirect data and sends the customer to the wallet; a return route (`/np/checkout/[callback]`) calls `authorizePayment` → `completeCart`. This is an additive change to the existing checkout, gated behind the region's payment-provider list, so COD keeps working untouched.

### 9.3 Why this is only a sketch now

Launch is COD-only (`pp_system_default`). The interface above exists so the checkout restyle (task #8) is built to be **provider-agnostic** — rendering whatever providers the region exposes rather than hard-coding COD or Stripe — so eSewa/Khalti drop in later with **no storefront rework**, only a new backend module + region config.

---

## 10. Summary of decisions (for downstream tasks)

1. **Two processes, one Postgres.** Storefront (`:8000`) ⇄ Medusa Store API (`:9000`) ⇄ Postgres 18 (`:5432/protein_pasal`). Admin is served by the backend at `/app`. No Docker for dev.
2. **Multi-brand = Collections (brands, 1:1) + Categories (product types, M:N) + Tags (facets) + metadata (nutrition/brand facts).** Flavor & Size are variant options. Canonical metadata schema defined in §3.2 — seeders and storefront read exactly those keys.
3. **Nepal region:** NPR (major units), 13% VAT tax-inclusive, country `np`, one Kathmandu warehouse, two flat-rate shipping options (Inside Valley / Outside Valley), COD via `pp_system_default`.
4. **Env order-of-operations:** seed the backend, then copy the generated **publishable key** into `storefront/.env.local` and restart the storefront (the current `pk_test` placeholder will 401 every call).
5. **Prod:** storefront on Vercel + Cloudflare; backend + Postgres + Redis on a Mumbai/Bangalore VPS (co-locate DB with backend); images on R2/B2/S3; Medusa worker mode at Phase 1.
6. **Search:** built-in `q=` at launch; Meilisearch (subscriber-indexed, InstantSearch storefront) once catalog/UX outgrows Postgres `ILIKE`.
7. **Caching:** Next Data Cache with **event-driven tag revalidation** from backend subscribers; Redis cache in prod; mobile-first performance budget.
8. **Payments are provider-agnostic by construction** so eSewa/Khalti (redirect + lookup-verify, `AbstractPaymentProvider`) add in later with zero storefront rework.

*End of 01-architecture.md*
