# Protein Pasal — GYM Ecommerce

Multi-brand protein & sports-nutrition e-commerce for Nepal. Every major
supplement brand — Optimum Nutrition, MuscleBlaze, Dymatize, MyProtein, GNC,
Ultimate Nutrition, Rule 1, Applied Nutrition — in one shop, 100% authentic,
Cash on Delivery nationwide.

## Stack

- **Backend**: [Medusa v2](https://medusajs.com) (Node), PostgreSQL
- **Storefront**: Next.js 15 (App Router) + React + Tailwind CSS
- **Design**: black/white editorial system with a single red accent, Anton +
  Inter + Space Mono

## Features

- NPR pricing with lakh-style grouping (`Rs. 1,50,000`), 13% VAT-inclusive
- Cash-on-Delivery checkout with Nepal-first address form (province/district/
  ward/landmark, phone-validated), login-required ordering with session
  continuity (guest add-to-cart → login → resumes exactly where you were)
- Guest order tracking (`/track-order`) by order # + email/phone, with a live
  delivery timeline (placed → confirmed → shipped → delivered, plus canceled/
  refunded states) — PII-safe lookups
- Faceted store (brand / category / price), search, brand pages with logos
- Promotions: code-based (validated with real feedback) + automatic free
  shipping over Rs. 10,000
- Product pages: sticky buy box, per-size price tiles, per-serving price,
  supplement-facts panel, quantity stepper with live stock ceilings

## Run (Docker)

```bash
docker compose up -d          # postgres + backend + storefront
# storefront: http://localhost:8000  ·  admin: http://localhost:9000/app
```

## Run (local dev)

```bash
# backend  (needs local PostgreSQL; configure backend/.env)
cd backend && npm install && npx medusa db:migrate && npm run dev

# storefront (configure storefront/.env.local with the publishable key)
cd storefront && npm install && npm run dev
```

Seed the catalog with `npx medusa exec ./src/scripts/seed.ts` from `backend/`.

## Notes

- `docs/` holds the architecture, design-system, UX, catalog, and Nepal
  commerce-operations plans the build follows.
- Product pack-shot images in `storefront/public/products/` are placeholders
  sourced from public retailer listings — replace with licensed photography
  before production launch.
- eSewa / Khalti payment integration is designed (see `docs/01-architecture.md`
  and `docs/05-nepal-operations.md`) but not yet implemented; launch payment
  method is Cash on Delivery.
