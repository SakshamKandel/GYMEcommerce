/**
 * Protein Pasal — Nepal storefront seed (Workstream G)
 * -----------------------------------------------------
 * Idempotent seed for the full Protein Pasal catalog + Nepal commerce config.
 * Re-runnable: every entity is looked up by handle/name and only created if missing.
 *
 * Source of truth: docs/04-catalog-seed-plan.md, with the master-plan conflict
 * resolutions applied (cited inline as R1, R6, R12, R13, ...).
 *
 * Canonical values (docs/00-master-plan.md §3):
 *   Region   "Nepal" · npr · ["np"] · payment ["pp_system_default"]
 *   Tax      13% VAT, tax-inclusive display (R1)
 *   Channel  "Protein Pasal Online" · publishable key "Protein Pasal Storefront" (R6)
 *   Warehouse "Kathmandu Warehouse", Balaju Industrial Area, Kathmandu, Bagmati, np, 44600
 *   Shipping set "Kathmandu Warehouse delivery" · zone "All of Nepal" [{country_code:"np"}] (R13)
 *            "Inside Kathmandu Valley" Rs. 100 (1–2 days) · "Outside Valley" Rs. 250 (3–5 days) (R7,R8)
 *   Catalog  8 collections · 7 categories · 24 products · 116 variants
 *   Money    NPR major units — amount 6200 = Rs. 6,200 (R5) — never multiply by 100.
 *
 * Run:  npx medusa exec ./src/scripts/seed.ts   (or: npm run seed)
 */
import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  addShippingMethodToCartWorkflow,
  createApiKeysWorkflow,
  createCartWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createPromotionsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  createPricePreferencesWorkflow,
  deleteProductsWorkflow,
  deleteRegionsWorkflow,
  deleteTaxRatesWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateSalesChannelsWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const SALES_CHANNEL_NAME = "Protein Pasal Online"; // R6
const PUBLISHABLE_KEY_TITLE = "Protein Pasal Storefront"; // R6
const REGION_NAME = "Nepal";
const STOCK_LOCATION_NAME = "Kathmandu Warehouse";
const FULFILLMENT_SET_NAME = "Kathmandu Warehouse delivery"; // R13
const SERVICE_ZONE_NAME = "All of Nepal"; // R13
const CURRENCY = "npr";

// ---------------------------------------------------------------------------
// Store-currency update workflow (kept from the starter — the module service
// has no single-call "set supported currencies" helper).
// ---------------------------------------------------------------------------
const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => ({
              currency_code: currency.currency_code,
              is_default: currency.is_default ?? false,
            })
          ),
        },
      };
    });
    const stores = updateStoresStep(normalizedInput);
    return new WorkflowResponse(stores);
  }
);

// ---------------------------------------------------------------------------
// Catalog data (transcribed verbatim from docs/04-catalog-seed-plan.md)
// ---------------------------------------------------------------------------
type SizeSpec = { value: string; code: string; weight: number; inventory: number };
type Flavor = { value: string; code: string };

// §4 — Category → size-level weight (g) + inventory-per-flavor.
const SIZES: Record<string, SizeSpec[]> = {
  "whey-protein": [
    { value: "1lb", code: "1LB", weight: 500, inventory: 60 },
    { value: "5lb", code: "5LB", weight: 2500, inventory: 30 },
  ],
  "mass-gainer": [
    { value: "3lb", code: "3LB", weight: 1500, inventory: 45 },
    { value: "6lb", code: "6LB", weight: 3000, inventory: 25 },
  ],
  creatine: [
    { value: "60 Servings", code: "60SV", weight: 350, inventory: 70 },
    { value: "120 Servings", code: "120SV", weight: 650, inventory: 35 },
  ],
  "pre-workout": [
    { value: "30 Servings", code: "30SV", weight: 300, inventory: 50 },
    { value: "60 Servings", code: "60SV", weight: 600, inventory: 25 },
  ],
  "bcaa-eaa": [
    { value: "30 Servings", code: "30SV", weight: 300, inventory: 55 },
    { value: "60 Servings", code: "60SV", weight: 600, inventory: 28 },
  ],
  "protein-bars-snacks": [
    { value: "Single Bar", code: "SGL", weight: 65, inventory: 150 },
    { value: "Box of 12", code: "BOX12", weight: 780, inventory: 20 },
  ],
  "vitamins-health": [
    { value: "30 Tablets", code: "30TB", weight: 60, inventory: 65 },
    { value: "60 Tablets", code: "60TB", weight: 120, inventory: 35 },
  ],
};

// §2 — Brand collections. metadata.description + metadata.banner_image (R12).
// TODO(real-photography): banner_image URLs are Unsplash placeholders.
const COLLECTIONS: {
  title: string;
  handle: string;
  description: string;
  banner_image: string;
}[] = [
  {
    title: "Optimum Nutrition",
    handle: "optimum-nutrition",
    description:
      "The world's most trusted whey protein brand, known globally for Gold Standard 100% Whey. Rigorously tested, informed-choice friendly, and manufactured in the USA — the default pick for lifters who don't want to think twice about quality.",
    banner_image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "MuscleBlaze",
    handle: "muscleblaze",
    description:
      "South Asia's fastest-growing sports nutrition brand, built for serious lifters who want lab-tested results without the premium markup. A gym-floor staple across the subcontinent.",
    banner_image:
      "https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Dymatize",
    handle: "dymatize",
    description:
      "American performance nutrition brand famous for ISO100 hydrolyzed whey isolate — fast-absorbing, gut-friendly protein for athletes who demand purity and precise macros.",
    banner_image:
      "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "MyProtein",
    handle: "myprotein",
    description:
      "Europe's #1 online sports nutrition brand. Direct-to-consumer pricing, an enormous flavor range, and a cult following among gym-goers who track every macro.",
    banner_image:
      "https://images.unsplash.com/photo-1704650311540-e3b58fa6dc74?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "GNC",
    handle: "gnc",
    description:
      "The century-old American health and nutrition retailer, trusted by pharmacists and trainers alike for protein, wellness, and everyday vitamins under one roof.",
    banner_image:
      "https://images.unsplash.com/photo-1624362772755-4d5843e67047?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Ultimate Nutrition",
    handle: "ultimate-nutrition",
    description:
      "One of the original American sports nutrition brands, running strong since 1979. Prostar Whey remains a gym-bag staple for lifters who grew up on it.",
    banner_image:
      "https://images.unsplash.com/photo-1559087316-6b27308e53f6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Rule 1",
    handle: "rule-1",
    description:
      "Formulated by veteran sports-nutrition scientists, Rule 1 strips out the fillers and proprietary blends, favoring clinically dosed, clearly labeled ingredients.",
    banner_image:
      "https://images.unsplash.com/photo-1633360821154-1935fb5671e6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Applied Nutrition",
    handle: "applied-nutrition",
    description:
      "UK-born, internet-famous sports nutrition brand known for bold flavors, striking packaging, and its cult-favorite ABE pre-workout.",
    banner_image:
      "https://images.unsplash.com/photo-1627467959547-8e44da7aa00a?q=80&w=1600&auto=format&fit=crop",
  },
];

// §3 — Product categories (top-level, published).
const CATEGORIES: { name: string; handle: string; description: string }[] = [
  {
    name: "Whey Protein",
    handle: "whey-protein",
    description:
      "Fast-digesting milk protein for muscle repair and growth — the foundation of every supplement stack.",
  },
  {
    name: "Mass Gainer",
    handle: "mass-gainer",
    description:
      "High-calorie protein + carb blends for hardgainers who struggle to eat their way to size.",
  },
  {
    name: "Creatine",
    handle: "creatine",
    description:
      "The most researched supplement in sports science — proven to boost strength, power output, and lean muscle mass.",
  },
  {
    name: "Pre-Workout",
    handle: "pre-workout",
    description:
      "Caffeine, pump, and focus formulas to take a training session from ordinary to explosive.",
  },
  {
    name: "BCAA & EAA",
    handle: "bcaa-eaa",
    description:
      "Branched-chain and essential amino acids to reduce muscle breakdown and speed recovery between sessions.",
  },
  {
    name: "Protein Bars & Snacks",
    handle: "protein-bars-snacks",
    description:
      "Grab-and-go protein for busy days — dessert-level taste with a macro profile that fits the plan.",
  },
  {
    name: "Vitamins & Health",
    handle: "vitamins-health",
    description:
      "Daily multivitamins and health essentials to cover the nutritional gaps training alone can't fix.",
  },
];

// §6 — 24 products. `flavors: null` => Size-only (Vitamins & Health).
// TODO(real-photography): all `image` URLs are Unsplash placeholders.
type ProductSpec = {
  title: string;
  handle: string;
  categoryHandle: string;
  collectionHandle: string;
  description: string;
  image: string;
  skuPrefix: string;
  flavors: Flavor[] | null;
  priceBySize: Record<string, number>;
  metadata: Record<string, string>;
};

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;

const PRODUCTS: ProductSpec[] = [
  // 6.1 Optimum Nutrition
  {
    title: "ON Gold Standard 100% Whey",
    handle: "on-gold-standard-100-whey",
    categoryHandle: "whey-protein",
    collectionHandle: "optimum-nutrition",
    description:
      "The best-selling whey protein in the world, delivering 24g of high-quality whey protein isolate, concentrate, and peptides in every scoop. Mixes instantly with a spoon — no shaker needed — with a smooth, never-chalky taste that's kept lifters coming back for over two decades. Trusted in gyms from Kathmandu to California.",
    image: IMG("photo-1693996045899-7cf0ac0229c7"),
    skuPrefix: "ON-GSW",
    flavors: [
      { value: "Double Rich Chocolate", code: "CHOC" },
      { value: "Vanilla Ice Cream", code: "VAN" },
      { value: "Unflavored", code: "UNFL" },
    ],
    priceBySize: { "1lb": 6200, "5lb": 21500 },
    metadata: {
      protein_per_serving: "24g",
      servings: "15 (1lb) / 75 (5lb)",
      origin_country: "USA",
      flavor_notes:
        "Double Rich Chocolate — deep cocoa, smooth mixability, no chalky aftertaste",
    },
  },
  {
    title: "ON Serious Mass",
    handle: "on-serious-mass",
    categoryHandle: "mass-gainer",
    collectionHandle: "optimum-nutrition",
    description:
      "A calorie-dense weight gainer packing roughly 1,250 calories and 50g of protein per serving for lifters who need serious size. Fortified with 25 vitamins and minerals plus creatine monohydrate and glutamine to support recovery between heavy sessions. Built for hardgainers who eat clean but still can't out-train a fast metabolism.",
    image: IMG("photo-1693996045369-781799bbaea0"),
    skuPrefix: "ON-SM",
    flavors: [
      { value: "Chocolate", code: "CHOC" },
      { value: "Vanilla", code: "VAN" },
    ],
    priceBySize: { "3lb": 7500, "6lb": 12000 },
    metadata: {
      protein_per_serving: "50g",
      servings: "9 (3lb) / 18 (6lb)",
      origin_country: "USA",
      flavor_notes: "Chocolate — thick, milkshake-like consistency",
    },
  },
  {
    title: "ON Micronized Creatine Powder",
    handle: "on-micronized-creatine-powder",
    categoryHandle: "creatine",
    collectionHandle: "optimum-nutrition",
    description:
      "Pure, micronized creatine monohydrate with no additives, fillers, or flavoring — just the single most proven strength and power supplement in sports science. Finer micronized particles mix cleanly into any shake or juice without the grit of ordinary creatine. One daily 5g scoop is all it takes to see the difference in the gym.",
    image: IMG("photo-1517836357463-d25dfeac3438"),
    skuPrefix: "ON-CREA",
    flavors: [
      { value: "Unflavored", code: "UNFL" },
      { value: "Fruit Punch", code: "FPCH" },
    ],
    priceBySize: { "60 Servings": 3200, "120 Servings": 4500 },
    metadata: {
      protein_per_serving: "0g protein (5g Creatine Monohydrate per serving)",
      servings: "60 or 120 depending on pack size",
      origin_country: "USA",
      flavor_notes:
        "Unflavored — mixes into any shake or juice without altering taste",
    },
  },
  // 6.2 MuscleBlaze
  {
    title: "MuscleBlaze Biozyme Performance Whey",
    handle: "muscleblaze-biozyme-performance-whey",
    categoryHandle: "whey-protein",
    collectionHandle: "muscleblaze",
    description:
      "India's top-selling whey protein, enhanced with a digestive enzyme blend (Biozyme) for faster absorption and less bloating. Delivers 25g of protein and 5.5g of BCAAs per serving at a price built for daily use, not just special occasions. A gym-floor favorite across South Asia for a reason.",
    image: IMG("photo-1693996045300-521e9d08cabc"),
    skuPrefix: "MB-BPW",
    flavors: [
      { value: "Rich Milk Chocolate", code: "MILK" },
      { value: "Cafe Mocha", code: "MOCHA" },
      { value: "Unflavoured", code: "UNFL" },
    ],
    priceBySize: { "1lb": 4800, "5lb": 15500 },
    metadata: {
      protein_per_serving: "25g",
      servings: "15 (1lb) / 75 (5lb)",
      origin_country: "India",
      flavor_notes:
        "Rich Milk Chocolate — classic malty cocoa profile, dissolves clean with a shaker",
    },
  },
  {
    title: "MuscleBlaze Mass Gainer XXL",
    handle: "muscleblaze-mass-gainer-xxl",
    categoryHandle: "mass-gainer",
    collectionHandle: "muscleblaze",
    description:
      "A high-calorie mass gainer with a carb-heavy ratio designed specifically for ectomorphs and hardgainers chasing visible size. Each serving delivers 800+ calories with added digestive enzymes so the extra food actually gets absorbed, not wasted. Thick and filling when mixed — built for people who genuinely struggle to gain weight.",
    image: IMG("photo-1558017487-06bf9f82613a"),
    skuPrefix: "MB-MGXXL",
    flavors: [
      { value: "Rich Chocolate", code: "CHOC" },
      { value: "Vanilla", code: "VAN" },
    ],
    priceBySize: { "3lb": 6200, "6lb": 10500 },
    metadata: {
      protein_per_serving: "30g",
      servings: "9 (3lb) / 18 (6lb)",
      origin_country: "India",
      flavor_notes:
        "Rich Chocolate — sweet, filling, mixes into a thick shake",
    },
  },
  {
    title: "MuscleBlaze Creatine Monohydrate",
    handle: "muscleblaze-creatine-monohydrate",
    categoryHandle: "creatine",
    collectionHandle: "muscleblaze",
    description:
      "Micronized creatine monohydrate manufactured in an Informed-Choice certified facility, so competitive athletes can supplement with confidence. 3g of pure creatine per serving supports strength, power, and muscle volume with consistent daily use. No loading phase required — just mix and go.",
    image: IMG("photo-1605296867304-46d5465a13f1"),
    skuPrefix: "MB-CM",
    flavors: [
      { value: "Unflavoured", code: "UNFL" },
      { value: "Watermelon", code: "WMEL" },
    ],
    priceBySize: { "60 Servings": 2500, "120 Servings": 3800 },
    metadata: {
      protein_per_serving: "0g protein (3g Creatine Monohydrate per serving)",
      servings: "60 or 120 depending on pack size",
      origin_country: "India",
      flavor_notes:
        "Unflavoured — neutral taste, dissolves cleanly in water",
    },
  },
  // 6.3 Dymatize
  {
    title: "Dymatize ISO100 Hydrolyzed Whey",
    handle: "dymatize-iso100-hydrolyzed-whey",
    categoryHandle: "whey-protein",
    collectionHandle: "dymatize",
    description:
      "A gold-standard whey protein isolate that's hydrolyzed for faster digestion and virtually free of lactose, gluten, and fat. Delivers 25g of protein per scoop with under 1g of sugar, making it a favorite among athletes who are strict about their macros. Dissolves cleanly in water with almost no foam — a genuinely different mixing experience.",
    image: IMG("photo-1693996046865-19217d179161"),
    skuPrefix: "DYM-ISO100",
    flavors: [
      { value: "Gourmet Chocolate", code: "CHOC" },
      { value: "Gourmet Vanilla", code: "VAN" },
      { value: "Birthday Cake", code: "BDAY" },
    ],
    priceBySize: { "1lb": 6500, "5lb": 22000 },
    metadata: {
      protein_per_serving: "25g",
      servings: "15 (1lb) / 75 (5lb)",
      origin_country: "USA",
      flavor_notes:
        "Gourmet Chocolate — dessert-like sweetness, mixes almost foam-free",
    },
  },
  {
    title: "Dymatize Creatine Micronized",
    handle: "dymatize-creatine-micronized",
    categoryHandle: "creatine",
    collectionHandle: "dymatize",
    description:
      "100% pure micronized creatine monohydrate, refined for smoother mixing and better solubility than standard creatine powders. Backed by decades of peer-reviewed research for improving strength, power, and training volume. A no-frills staple for lifters who already know what works.",
    image: IMG("photo-1581009146145-b5ef050c2e1e"),
    skuPrefix: "DYM-CREAM",
    flavors: [
      { value: "Unflavored", code: "UNFL" },
      { value: "Fruit Blast", code: "FBLST" },
    ],
    priceBySize: { "60 Servings": 2900, "120 Servings": 4200 },
    metadata: {
      protein_per_serving: "0g protein (5g Creatine Monohydrate per serving)",
      servings: "60 or 120 depending on pack size",
      origin_country: "USA",
      flavor_notes:
        "Unflavored — micronized for smoother mixing than standard creatine",
    },
  },
  {
    title: "Dymatize BCAA Complex 5050",
    handle: "dymatize-bcaa-complex-5050",
    categoryHandle: "bcaa-eaa",
    collectionHandle: "dymatize",
    description:
      "A 2:1:1 branched-chain amino acid formula built to help preserve lean muscle during intense training and support faster recovery between sessions. Instantized for easy mixing, with zero sugar and a light, refreshing taste that's easy to sip throughout a workout. A smart addition to any fasted-training or cutting routine.",
    image: IMG("photo-1526506118085-60ce8714f8c5"),
    skuPrefix: "DYM-BCAA",
    flavors: [
      { value: "Fruit Punch", code: "FPCH" },
      { value: "Grape", code: "GRPE" },
    ],
    priceBySize: { "30 Servings": 3000, "60 Servings": 4800 },
    metadata: {
      protein_per_serving: "0g protein (7g BCAA per serving)",
      servings: "30 or 60 depending on pack size",
      origin_country: "USA",
      flavor_notes:
        "Fruit Punch — light, refreshing, easy to sip during training",
    },
  },
  // 6.4 MyProtein
  {
    title: "MyProtein Impact Whey Protein",
    handle: "myprotein-impact-whey-protein",
    categoryHandle: "whey-protein",
    collectionHandle: "myprotein",
    description:
      "The product that built MyProtein's reputation — a lean, effective whey blend with 21g of protein per serving and one of the largest flavor ranges in sports nutrition. Direct-to-consumer pricing means premium protein without the premium markup. A go-to for anyone tracking cost-per-gram of protein.",
    image: IMG("photo-1693996045463-6ea86d10a2e7"),
    skuPrefix: "MP-IMPACT",
    flavors: [
      { value: "Chocolate Smooth", code: "CHOC" },
      { value: "Vanilla", code: "VAN" },
      { value: "Unflavored", code: "UNFL" },
    ],
    priceBySize: { "1lb": 4500, "5lb": 14200 },
    metadata: {
      protein_per_serving: "21g",
      servings: "15 (1lb) / 75 (5lb)",
      origin_country: "United Kingdom",
      flavor_notes:
        "Chocolate Smooth — light, milky cocoa, not overly sweet",
    },
  },
  {
    title: "MyProtein THE Pre-Workout",
    handle: "myprotein-the-pre-workout",
    categoryHandle: "pre-workout",
    collectionHandle: "myprotein",
    description:
      "A comprehensive pre-training formula combining caffeine, beta-alanine, citrulline malate, and taurine for energy, pump, and focus in one scoop. Formulated to avoid the harsh crash of cheaper stimulant blends, so training intensity holds from warm-up to the last set. A favorite among MyProtein's famously flavor-obsessed community.",
    image: IMG("photo-1581269631444-9c6cc00df0b6"),
    skuPrefix: "MP-THEPRE",
    flavors: [
      { value: "Blue Raspberry", code: "BRAS" },
      { value: "Fruit Burst", code: "FBST" },
      { value: "Cola", code: "COLA" },
    ],
    priceBySize: { "30 Servings": 4200, "60 Servings": 6800 },
    metadata: {
      protein_per_serving: "0g protein",
      servings: "30 or 60 depending on pack size",
      origin_country: "United Kingdom",
      flavor_notes: "Blue Raspberry — sharp, sweet-tart candy flavor",
    },
  },
  {
    title: "MyProtein BCAA",
    handle: "myprotein-bcaa",
    categoryHandle: "bcaa-eaa",
    collectionHandle: "myprotein",
    description:
      "A 2:1:1 ratio BCAA formula in a light, thirst-quenching flavor designed to be sipped during long training sessions or fasted cardio. Helps reduce muscle protein breakdown so hard-earned gains aren't lost to a tough training block. Zero sugar, easy on the stomach, easy to drink all day.",
    image: IMG("photo-1689877020200-403d8542d95d"),
    skuPrefix: "MP-BCAA",
    flavors: [
      { value: "Orange Mango", code: "ORNG" },
      { value: "Berry", code: "BERY" },
    ],
    priceBySize: { "30 Servings": 2800, "60 Servings": 4500 },
    metadata: {
      protein_per_serving: "0g protein (6g BCAA per serving)",
      servings: "30 or 60 depending on pack size",
      origin_country: "United Kingdom",
      flavor_notes: "Orange Mango — tropical, light sweetness",
    },
  },
  // 6.5 GNC
  {
    title: "GNC Pro Performance 100% Whey Protein",
    handle: "gnc-pro-performance-100-whey-protein",
    categoryHandle: "whey-protein",
    collectionHandle: "gnc",
    description:
      "A trusted everyday whey protein from the retailer that pharmacists recommend, delivering 24g of protein with a smooth, easy-mixing texture. Formulated for both post-workout recovery and as a convenient way to hit daily protein targets. Backed by GNC's decades-long reputation for quality control.",
    image: IMG("photo-1593095948071-474c5cc2989d"),
    skuPrefix: "GNC-PPWHEY",
    flavors: [
      { value: "Chocolate Fudge", code: "FUDG" },
      { value: "Vanilla Bean", code: "VBN" },
      { value: "Unflavored", code: "UNFL" },
    ],
    priceBySize: { "1lb": 5200, "5lb": 17800 },
    metadata: {
      protein_per_serving: "24g",
      servings: "15 (1lb) / 75 (5lb)",
      origin_country: "USA",
      flavor_notes:
        "Chocolate Fudge — rich, dessert-forward, mixes smooth in water or milk",
    },
  },
  {
    title: "GNC Total Lean Protein Bar",
    handle: "gnc-total-lean-protein-bar",
    categoryHandle: "protein-bars-snacks",
    collectionHandle: "gnc",
    description:
      "A protein-forward snack bar with 20g of protein and controlled sugar, built for people who want dessert-level taste without derailing their nutrition plan. Soft-baked texture instead of the usual chalky, chewy protein bar experience. Fits neatly into a gym bag, desk drawer, or glovebox for whenever hunger strikes.",
    image: IMG("photo-1622484212850-eb596d769edc"),
    skuPrefix: "GNC-TLBAR",
    flavors: [
      { value: "Chocolate Fudge Brownie", code: "CFB" },
      { value: "Peanut Butter", code: "PB" },
      { value: "Cookies & Cream", code: "CNC" },
    ],
    priceBySize: { "Single Bar": 450, "Box of 12": 5000 },
    metadata: {
      protein_per_serving: "20g",
      servings: "1 bar per serving; box contains 12 bars",
      origin_country: "USA",
      flavor_notes:
        "Chocolate Fudge Brownie — soft-baked texture, rich cocoa flavor",
    },
  },
  {
    title: "GNC Mega Men Sport Multivitamin",
    handle: "gnc-mega-men-sport-multivitamin",
    categoryHandle: "vitamins-health",
    collectionHandle: "gnc",
    description:
      "A multivitamin formulated specifically for active men, combining core vitamins and minerals with joint- and muscle-recovery support nutrients. Designed to fill the nutritional gaps that training alone can't cover, especially for anyone training in a calorie deficit. One daily dose, no guesswork.",
    image: IMG("photo-1732900293895-233f769299b3"),
    skuPrefix: "GNC-MEGAMEN",
    flavors: null,
    priceBySize: { "30 Tablets": 1500, "60 Tablets": 2600 },
    metadata: {
      protein_per_serving: "0g protein (multivitamin — see Supplement Facts)",
      servings: "1 tablet per day; pack provides 30 or 60 day supply",
      origin_country: "USA",
      flavor_notes: "N/A — unflavored tablet",
    },
  },
  // 6.6 Ultimate Nutrition
  {
    title: "Ultimate Nutrition Prostar Whey Protein",
    handle: "ultimate-nutrition-prostar-whey-protein",
    categoryHandle: "whey-protein",
    collectionHandle: "ultimate-nutrition",
    description:
      "A gym-bag classic since the 1990s, Prostar Whey blends whey concentrate, isolate, and hydrolysate for a fast-and-sustained amino acid release. 25g of protein per scoop with a smooth, rich taste that's kept generations of lifters loyal to the brand. Proof that some formulas never needed a redesign.",
    image: IMG("photo-1704650312191-005ab02786f5"),
    skuPrefix: "UN-PROSTAR",
    flavors: [
      { value: "Chocolate Créme", code: "CHOC" },
      { value: "Vanilla Créme", code: "VAN" },
      { value: "Unflavored", code: "UNFL" },
    ],
    priceBySize: { "1lb": 5500, "5lb": 18500 },
    metadata: {
      protein_per_serving: "25g",
      servings: "15 (1lb) / 75 (5lb)",
      origin_country: "USA",
      flavor_notes:
        "Chocolate Créme — classic creamy cocoa, a gym-bag staple flavor since the 90s",
    },
  },
  {
    title: "Ultimate Nutrition BCAA 12000",
    handle: "ultimate-nutrition-bcaa-12000",
    categoryHandle: "bcaa-eaa",
    collectionHandle: "ultimate-nutrition",
    description:
      "A high-dose 12,000mg BCAA formula in the classic 2:1:1 ratio, built to support muscle recovery for lifters training at real volume. Straightforward, no-nonsense formulation from one of the original American sports nutrition brands. A reliable addition to any serious training split.",
    image: IMG("photo-1541534741688-6078c6bfb5c5"),
    skuPrefix: "UN-BCAA12K",
    flavors: [
      { value: "Fruit Punch", code: "FPCH" },
      { value: "Grape", code: "GRPE" },
    ],
    priceBySize: { "30 Servings": 3200, "60 Servings": 5000 },
    metadata: {
      protein_per_serving: "0g protein (7g BCAA per serving)",
      servings: "30 or 60 depending on pack size",
      origin_country: "USA",
      flavor_notes: "Fruit Punch — classic sports-drink flavor profile",
    },
  },
  {
    title: "Ultimate Nutrition Daily Formula Multivitamin",
    handle: "ultimate-nutrition-daily-formula-multivitamin",
    categoryHandle: "vitamins-health",
    collectionHandle: "ultimate-nutrition",
    description:
      "A comprehensive daily multivitamin covering the essential vitamins, minerals, and antioxidants that support recovery and general health for active adults. Formulated as an affordable insurance policy against the nutritional gaps of a busy training schedule. Simple, complete, and easy to stick with.",
    image: IMG("photo-1631549916768-4119b2e5f926"),
    skuPrefix: "UN-DAILYF",
    flavors: null,
    priceBySize: { "30 Tablets": 1300, "60 Tablets": 2300 },
    metadata: {
      protein_per_serving: "0g protein (multivitamin — see Supplement Facts)",
      servings: "1 tablet per day; pack provides 30 or 60 day supply",
      origin_country: "USA",
      flavor_notes: "N/A — unflavored tablet",
    },
  },
  // 6.7 Rule 1
  {
    title: "Rule 1 R1 Mass Gainer",
    handle: "rule-1-r1-mass-gainer",
    categoryHandle: "mass-gainer",
    collectionHandle: "rule-1",
    description:
      "A clean-formulated mass gainer that avoids the excessive sugar of older-generation gainers, using complex carbs for sustained-release calories. Delivers real, weighable size gains for hardgainers without the bloated, sugary aftertaste. Built by a formulation team behind some of the industry's most trusted brands.",
    image: IMG("photo-1595348020949-87cdfbb44174"),
    skuPrefix: "R1-MG",
    flavors: [
      { value: "Chocolate Fudge", code: "FUDG" },
      { value: "Vanilla Custard", code: "VCST" },
    ],
    priceBySize: { "3lb": 6800, "6lb": 11200 },
    metadata: {
      protein_per_serving: "45g",
      servings: "9 (3lb) / 18 (6lb)",
      origin_country: "USA",
      flavor_notes:
        "Chocolate Fudge — clean sweetness, less sugary than typical gainers",
    },
  },
  {
    title: "Rule 1 R1 Pre-Workout",
    handle: "rule-1-r1-pre-workout",
    categoryHandle: "pre-workout",
    collectionHandle: "rule-1",
    description:
      "A clinically dosed pre-workout with clearly labeled amounts of caffeine, citrulline, and beta-alanine — no proprietary blends hiding underdosed ingredients. Delivers a smooth, sustained energy curve for training sessions that need to go the distance. Built for lifters who read labels before they buy.",
    image: IMG("photo-1579722820308-d74e571900a9"),
    skuPrefix: "R1-PRE",
    flavors: [
      { value: "Blue Raspberry", code: "BRAS" },
      { value: "Fruit Punch", code: "FPCH" },
      { value: "Green Apple", code: "GAPL" },
    ],
    priceBySize: { "30 Servings": 4000, "60 Servings": 6500 },
    metadata: {
      protein_per_serving: "0g protein",
      servings: "30 or 60 depending on pack size",
      origin_country: "USA",
      flavor_notes:
        "Blue Raspberry — clean, sweet-tart profile, no aftertaste",
    },
  },
  {
    title: "Rule 1 R1 Protein Bar",
    handle: "rule-1-r1-protein-bar",
    categoryHandle: "protein-bars-snacks",
    collectionHandle: "rule-1",
    description:
      "A protein bar that actually tastes like a dessert, with 20g of protein and a soft, chewy texture that doesn't need to be warmed up to be edible. A convenient way to hit protein targets between meals without resorting to another shake. Fits easily into a bag, a locker, or a desk drawer.",
    image: IMG("photo-1742860866012-fc167d8366bf"),
    skuPrefix: "R1-BAR",
    flavors: [
      { value: "Chocolate Peanut Butter", code: "CPB" },
      { value: "Cookies & Cream", code: "CNC" },
      { value: "Birthday Cake", code: "BDAY" },
    ],
    priceBySize: { "Single Bar": 500, "Box of 12": 5600 },
    metadata: {
      protein_per_serving: "20g",
      servings: "1 bar per serving; box contains 12 bars",
      origin_country: "USA",
      flavor_notes:
        "Chocolate Peanut Butter — dessert-style taste, chewy texture",
    },
  },
  // 6.8 Applied Nutrition
  {
    title: "Applied Nutrition Critical Mass Professional",
    handle: "applied-nutrition-critical-mass-professional",
    categoryHandle: "mass-gainer",
    collectionHandle: "applied-nutrition",
    description:
      "A professional-grade mass gainer combining whey protein, complex carbohydrates, and creatine for lifters serious about packing on size. Formulated with digestive enzymes to help the body actually absorb the extra calories, not just carry them. Bold flavors and bold results, in true Applied Nutrition style.",
    image: IMG("photo-1579722822280-a3d601518cc9"),
    skuPrefix: "AN-CRITMASS",
    flavors: [
      { value: "Chocolate Peanut", code: "CPNT" },
      { value: "Strawberry Cream", code: "STRW" },
    ],
    priceBySize: { "3lb": 6500, "6lb": 10800 },
    metadata: {
      protein_per_serving: "40g",
      servings: "9 (3lb) / 18 (6lb)",
      origin_country: "United Kingdom",
      flavor_notes:
        "Chocolate Peanut — indulgent flavor profile with a nutty finish",
    },
  },
  {
    title: "Applied Nutrition ABE Pre-Workout",
    handle: "applied-nutrition-abe-pre-workout",
    categoryHandle: "pre-workout",
    collectionHandle: "applied-nutrition",
    description:
      'ABE — "All Black Everything" — is one of the UK\'s best-selling pre-workouts, combining citrulline, beta-alanine, and a smart caffeine blend for smooth, jitter-free energy. Formulated for both gym pumps and mental focus, without the crash of older-style stimulant blends. A cult favorite for a reason.',
    image: IMG("photo-1579722821273-0f6c7d44362f"),
    skuPrefix: "AN-ABE",
    flavors: [
      { value: "Blue Raspberry Candy", code: "BRAS" },
      { value: "Fruit Blast", code: "FBLST" },
      { value: "Wild Berry", code: "WBRY" },
    ],
    priceBySize: { "30 Servings": 4500, "60 Servings": 7000 },
    metadata: {
      protein_per_serving: "0g protein",
      servings: "30 or 60 depending on pack size",
      origin_country: "United Kingdom",
      flavor_notes:
        "Blue Raspberry Candy — bold, sweet, signature ABE flavor",
    },
  },
  {
    title: "Applied Nutrition Critical Whey",
    handle: "applied-nutrition-critical-whey",
    categoryHandle: "whey-protein",
    collectionHandle: "applied-nutrition",
    description:
      "A premium whey protein blend with bold, indulgent flavors and 21g of protein per serving, built for people who refuse to choose between taste and macros. Instant-mixing formula that works just as well in a bottle as it does in a blender. Applied Nutrition's flagship whey, now on Nepali shelves.",
    image: IMG("photo-1633509817627-5a29634475af"),
    skuPrefix: "AN-CRITWHEY",
    flavors: [
      { value: "Chocolate Peanut Caramel", code: "CPC" },
      { value: "Vanilla", code: "VAN" },
      { value: "Unflavored", code: "UNFL" },
    ],
    priceBySize: { "1lb": 4900, "5lb": 15800 },
    metadata: {
      protein_per_serving: "21g",
      servings: "15 (1lb) / 75 (5lb)",
      origin_country: "United Kingdom",
      flavor_notes:
        "Chocolate Peanut Caramel — indulgent, dessert-style flavor with a salty-sweet finish",
    },
  },
];

// ===========================================================================
// Seed
// ===========================================================================
export default async function seedProteinPasal({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const cartModuleService = container.resolve(Modules.CART);

  // Small helper: return the first matching row or null.
  const findOne = async (
    entity: string,
    filters: Record<string, unknown>,
    fields: string[]
  ): Promise<any | null> => {
    const { data } = await query.graph({ entity, fields, filters });
    return data?.[0] ?? null;
  };
  const findMany = async (
    entity: string,
    fields: string[],
    filters?: Record<string, unknown>
  ): Promise<any[]> => {
    const { data } = await query.graph({ entity, fields, filters });
    return data ?? [];
  };
  const safeLink = async (fn: () => Promise<unknown>, label: string) => {
    try {
      await fn();
    } catch (e: any) {
      logger.info(`  link (${label}) already present or skipped: ${e?.message ?? e}`);
    }
  };

  logger.info("=== Protein Pasal seed — start ===");

  // -------------------------------------------------------------------------
  // 0. Strip the starter's Europe demo data so no mixed catalog survives (§8).
  //    Guarded by existence checks; safe on a fresh DB and on re-runs.
  // -------------------------------------------------------------------------
  logger.info("Checking for starter demo data to strip...");
  const demoHandles = ["t-shirt", "sweatshirt", "sweatpants", "shorts"];
  const demoProducts = await findMany("product", ["id", "handle"], {
    handle: demoHandles,
  });
  if (demoProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: demoProducts.map((p) => p.id) },
    });
    logger.info(`  removed ${demoProducts.length} starter demo product(s).`);
  }
  const europeRegion = await findOne("region", { name: "Europe" }, ["id"]);
  if (europeRegion) {
    await safeLink(
      () =>
        deleteRegionsWorkflow(container).run({
          input: { ids: [europeRegion.id] },
        }),
      "delete Europe region"
    );
    logger.info("  removed starter Europe region.");
  }

  // -------------------------------------------------------------------------
  // 1 + 2. Store settings + supported currency npr (§1.1).
  // -------------------------------------------------------------------------
  const [store] = await storeModuleService.listStores();

  // -------------------------------------------------------------------------
  // 3. Sales channel — rename "Default Sales Channel" -> "Protein Pasal Online" (R6).
  // -------------------------------------------------------------------------
  logger.info("Seeding sales channel...");
  let salesChannel = (
    await salesChannelModuleService.listSalesChannels({
      name: SALES_CHANNEL_NAME,
    })
  )[0];
  if (!salesChannel) {
    const legacy = (
      await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
      })
    )[0];
    if (legacy) {
      await updateSalesChannelsWorkflow(container).run({
        input: {
          selector: { id: legacy.id },
          update: {
            name: SALES_CHANNEL_NAME,
            description:
              "Default storefront sales channel for protein-pasal.com",
          },
        },
      });
      logger.info('  renamed "Default Sales Channel" -> "Protein Pasal Online".');
    } else {
      await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [
            {
              name: SALES_CHANNEL_NAME,
              description:
                "Default storefront sales channel for protein-pasal.com",
            },
          ],
        },
      });
      logger.info('  created sales channel "Protein Pasal Online".');
    }
    // Re-fetch so `salesChannel` is the canonical object regardless of the
    // workflow's return shape.
    salesChannel = (
      await salesChannelModuleService.listSalesChannels({
        name: SALES_CHANNEL_NAME,
      })
    )[0];
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [{ currency_code: CURRENCY, is_default: true }],
    },
  });
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_sales_channel_id: salesChannel.id },
    },
  });
  logger.info("  store currency set to NPR; default sales channel linked.");

  // -------------------------------------------------------------------------
  // 4. Region "Nepal" (§1.2).
  // -------------------------------------------------------------------------
  logger.info("Seeding region...");
  let region = await findOne("region", { name: REGION_NAME }, [
    "id",
    "name",
    "currency_code",
  ]);
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: REGION_NAME,
            currency_code: CURRENCY,
            countries: ["np"],
            payment_providers: ["pp_system_default"], // COD (manual provider)
          },
        ],
      },
    });
    region = result[0];
    logger.info('  created region "Nepal" (npr / [np] / COD).');
  }

  // -------------------------------------------------------------------------
  // 5. Tax (R1): tax region np + 13% default "VAT" rate + tax-inclusive pricing.
  //    Prices in §6 are the final tax-INCLUSIVE amounts (do not change them).
  //    A tripwire below verifies cart math; on failure we drop the rate (fallback).
  // -------------------------------------------------------------------------
  logger.info("Seeding tax region (13% VAT, tax-inclusive)...");
  let taxRegion = await findOne("tax_region", { country_code: "np" }, ["id"]);
  if (!taxRegion) {
    const { result } = await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "np", provider_id: "tp_system" }],
    });
    taxRegion = result[0];
    logger.info("  created tax region np.");
  }
  let vatRate = await findOne(
    "tax_rate",
    { tax_region_id: taxRegion.id, is_default: true },
    ["id", "rate", "name"]
  );
  if (!vatRate) {
    const { result } = await createTaxRatesWorkflow(container).run({
      input: [
        {
          tax_region_id: taxRegion.id,
          name: "VAT",
          code: "VAT",
          rate: 13,
          is_default: true,
        },
      ],
    });
    vatRate = result[0];
    logger.info("  created default 13% VAT rate.");
  }
  // Tax-inclusive pricing for NPR: admin-entered = displayed = charged (R1).
  const existingPref = await findOne(
    "price_preference",
    { attribute: "currency_code", value: CURRENCY },
    ["id", "is_tax_inclusive"]
  );
  if (!existingPref) {
    await createPricePreferencesWorkflow(container).run({
      input: [
        { attribute: "currency_code", value: CURRENCY, is_tax_inclusive: true },
      ],
    });
    logger.info("  set NPR pricing tax-inclusive (price preference).");
  }

  // -------------------------------------------------------------------------
  // 6. Publishable API key "Protein Pasal Storefront", scoped to the channel (R6).
  // -------------------------------------------------------------------------
  logger.info("Seeding publishable API key...");
  let publishableApiKey = await findOne(
    "api_key",
    { title: PUBLISHABLE_KEY_TITLE, type: "publishable" },
    ["id", "token", "title"]
  );
  if (!publishableApiKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          { title: PUBLISHABLE_KEY_TITLE, type: "publishable", created_by: "" },
        ],
      },
    });
    publishableApiKey = result[0];
    logger.info('  created publishable key "Protein Pasal Storefront".');
  }
  await safeLink(
    () =>
      linkSalesChannelsToApiKeyWorkflow(container).run({
        input: { id: publishableApiKey.id, add: [salesChannel.id] },
      }),
    "api-key -> sales-channel"
  );

  // -------------------------------------------------------------------------
  // 7. Stock location "Kathmandu Warehouse" (§1.4), linked to channel + provider.
  // -------------------------------------------------------------------------
  logger.info("Seeding stock location...");
  let stockLocation = await findOne(
    "stock_location",
    { name: STOCK_LOCATION_NAME },
    ["id", "name"]
  );
  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: STOCK_LOCATION_NAME,
            address: {
              city: "Kathmandu",
              address_1: "Balaju Industrial Area",
              province: "Bagmati",
              country_code: "np",
              postal_code: "44600",
            },
          },
        ],
      },
    });
    stockLocation = result[0];
    logger.info("  created Kathmandu Warehouse.");
  }
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });
  await safeLink(
    () =>
      link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      }),
    "stock-location -> fulfillment-provider"
  );
  await safeLink(
    () =>
      linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: stockLocation.id, add: [salesChannel.id] },
      }),
    "stock-location -> sales-channel"
  );

  // -------------------------------------------------------------------------
  // 8. Fulfillment set + service zone + two flat shipping options (§1.5, R13).
  // -------------------------------------------------------------------------
  logger.info("Seeding shipping profile + fulfillment...");
  let shippingProfile = (
    await fulfillmentModuleService.listShippingProfiles({ type: "default" })
  )[0];
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    });
    shippingProfile = result[0];
  }

  let fulfillmentSet = (
    await fulfillmentModuleService.listFulfillmentSets(
      { name: FULFILLMENT_SET_NAME },
      { relations: ["service_zones"] }
    )
  )[0];
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: [
        {
          name: SERVICE_ZONE_NAME,
          geo_zones: [{ country_code: "np", type: "country" }],
        },
      ],
    });
    await safeLink(
      () =>
        link.create({
          [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
          [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
        }),
      "stock-location -> fulfillment-set"
    );
    logger.info("  created fulfillment set + 'All of Nepal' zone.");
  }
  const serviceZoneId = fulfillmentSet.service_zones[0].id;

  // Two flat-rate options; storefront reads amounts from data, never hardcodes.
  const shippingOptionDefs = [
    {
      name: "Inside Kathmandu Valley",
      amount: 100, // Rs. 100 (R7)
      code: "valley",
      label: "Inside Valley",
      description: "Delivered in 1-2 days • Pay on delivery", // R8
    },
    {
      name: "Outside Valley",
      amount: 250, // Rs. 250 (R7)
      code: "outside",
      label: "Outside Valley",
      description: "Delivered in 3-5 days • Pay on delivery", // R8
    },
  ];
  const existingOptions = await findMany("shipping_option", ["id", "name"]);
  const existingOptionNames = new Set(existingOptions.map((o) => o.name));
  const optionsToCreate = shippingOptionDefs.filter(
    (o) => !existingOptionNames.has(o.name)
  );
  if (optionsToCreate.length) {
    await createShippingOptionsWorkflow(container).run({
      input: optionsToCreate.map((o) => ({
        name: o.name,
        price_type: "flat" as const,
        provider_id: "manual_manual",
        service_zone_id: serviceZoneId,
        shipping_profile_id: shippingProfile.id,
        type: { label: o.label, description: o.description, code: o.code },
        prices: [{ currency_code: CURRENCY, amount: o.amount }],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      })),
    });
    logger.info(
      `  created shipping options: ${optionsToCreate
        .map((o) => o.name)
        .join(", ")}.`
    );
  }

  // -------------------------------------------------------------------------
  // 9. Optional free-shipping promotion, item_total >= Rs. 10,000 (R9).
  //    Gates all free-delivery storefront copy — reported via promoSeeded.
  // -------------------------------------------------------------------------
  let promoSeeded = false;
  const FREESHIP_CODE = "FREESHIP10K";
  const existingPromo = await findOne("promotion", { code: FREESHIP_CODE }, [
    "id",
  ]);
  if (existingPromo) {
    promoSeeded = true;
    logger.info("  free-shipping promo already present.");
  } else {
    try {
      await createPromotionsWorkflow(container).run({
        input: {
          promotionsData: [
            {
              code: FREESHIP_CODE,
              type: "standard",
              status: "active",
              is_automatic: true,
              application_method: {
                // 100% off shipping methods. allocation "across" avoids the
                // max_quantity requirement that "each"/"once" impose.
                type: "percentage",
                target_type: "shipping_methods",
                allocation: "across",
                value: 100,
              },
              rules: [
                { attribute: "item_total", operator: "gte", values: "10000" },
              ],
            },
          ],
        },
      });
      promoSeeded = true;
      logger.info("  seeded automatic free-shipping promo (>= Rs. 10,000).");
    } catch (e: any) {
      // TODO(free-shipping-threshold): Promotions API rejected the rule shape.
      promoSeeded = false;
      logger.warn(
        `  free-shipping promo NOT seeded (skipping per plan): ${e?.message ?? e}`
      );
    }
  }

  // -------------------------------------------------------------------------
  // 10. Brand collections (8) with metadata.description + metadata.banner_image (R12).
  // -------------------------------------------------------------------------
  logger.info("Seeding brand collections...");
  const existingCollections = await findMany("product_collection", [
    "id",
    "handle",
  ]);
  const collectionByHandle: Record<string, string> = {};
  for (const c of existingCollections) collectionByHandle[c.handle] = c.id;
  const collectionsToCreate = COLLECTIONS.filter(
    (c) => !collectionByHandle[c.handle]
  );
  if (collectionsToCreate.length) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: collectionsToCreate.map((c) => ({
          title: c.title,
          handle: c.handle,
          metadata: {
            description: c.description,
            // TODO(real-photography): replace with licensed brand shot
            banner_image: c.banner_image,
          },
        })),
      },
    });
    for (const c of result) collectionByHandle[c.handle] = c.id;
    logger.info(`  created ${result.length} collection(s).`);
  }

  // -------------------------------------------------------------------------
  // 11. Categories (7), top-level, published.
  // -------------------------------------------------------------------------
  logger.info("Seeding categories...");
  const existingCategories = await findMany("product_category", [
    "id",
    "handle",
  ]);
  const categoryByHandle: Record<string, string> = {};
  for (const c of existingCategories) categoryByHandle[c.handle] = c.id;
  const categoriesToCreate = CATEGORIES.filter(
    (c) => !categoryByHandle[c.handle]
  );
  if (categoriesToCreate.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: categoriesToCreate.map((c) => ({
          name: c.name,
          handle: c.handle,
          description: c.description,
          is_active: true,
        })),
      },
    });
    for (const c of result) categoryByHandle[c.handle] = c.id;
    logger.info(`  created ${result.length} category(ies).`);
  }

  // -------------------------------------------------------------------------
  // 12. Products (24) + Flavor×Size variants (116) with NPR prices + metadata.
  // -------------------------------------------------------------------------
  logger.info("Seeding products...");
  const skuToInventory: Record<string, number> = {};

  const buildVariants = (spec: ProductSpec) => {
    const sizes = SIZES[spec.categoryHandle];
    const flavorList = spec.flavors ?? [{ value: "", code: "" }];
    const variants: any[] = [];
    for (const flavor of flavorList) {
      for (const size of sizes) {
        const sku = spec.flavors
          ? `${spec.skuPrefix}-${flavor.code}-${size.code}`
          : `${spec.skuPrefix}-${size.code}`;
        skuToInventory[sku] = size.inventory;
        variants.push({
          title: spec.flavors ? `${flavor.value} / ${size.value}` : size.value,
          sku,
          manage_inventory: true,
          weight: size.weight, // grams — shipped package weight (§0)
          options: spec.flavors
            ? { Flavor: flavor.value, Size: size.value }
            : { Size: size.value },
          // NPR major units, tax-inclusive final amounts (R5, R1).
          prices: [{ currency_code: CURRENCY, amount: spec.priceBySize[size.value] }],
        });
      }
    }
    return variants;
  };

  const buildProduct = (spec: ProductSpec) => {
    const sizes = SIZES[spec.categoryHandle];
    const options: { title: string; values: string[] }[] = [];
    if (spec.flavors)
      options.push({ title: "Flavor", values: spec.flavors.map((f) => f.value) });
    options.push({ title: "Size", values: sizes.map((s) => s.value) });
    return {
      title: spec.title,
      handle: spec.handle,
      description: spec.description,
      status: ProductStatus.PUBLISHED,
      collection_id: collectionByHandle[spec.collectionHandle],
      category_ids: [categoryByHandle[spec.categoryHandle]],
      shipping_profile_id: shippingProfile.id,
      // TODO(real-photography): replace with licensed product shot
      images: [{ url: spec.image }],
      options,
      variants: buildVariants(spec),
      metadata: spec.metadata,
      sales_channels: [{ id: salesChannel.id }],
    };
  };

  const existingProducts = await findMany("product", ["id", "handle"]);
  const existingProductHandles = new Set(existingProducts.map((p) => p.handle));
  const productsToCreate = PRODUCTS.filter(
    (p) => !existingProductHandles.has(p.handle)
  ).map(buildProduct);

  if (productsToCreate.length) {
    await createProductsWorkflow(container).run({
      input: { products: productsToCreate as any },
    });
    logger.info(`  created ${productsToCreate.length} product(s).`);
  } else {
    // Products already exist; still populate skuToInventory for the level pass.
    for (const spec of PRODUCTS) buildVariants(spec);
    logger.info("  products already present — skipping creation.");
  }

  // -------------------------------------------------------------------------
  // 13. Inventory levels at Kathmandu Warehouse, per-size quantities (§4).
  // -------------------------------------------------------------------------
  logger.info("Seeding inventory levels...");
  const inventoryItems = await findMany("inventory_item", ["id", "sku"]);
  const itemBySku: Record<string, string> = {};
  for (const it of inventoryItems) if (it.sku) itemBySku[it.sku] = it.id;

  const existingLevels = await findMany("inventory_level", [
    "inventory_item_id",
    "location_id",
  ]);
  const leveled = new Set(
    existingLevels
      .filter((l) => l.location_id === stockLocation.id)
      .map((l) => l.inventory_item_id)
  );

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const [sku, qty] of Object.entries(skuToInventory)) {
    const itemId = itemBySku[sku];
    if (!itemId || leveled.has(itemId)) continue;
    inventoryLevels.push({
      location_id: stockLocation.id,
      inventory_item_id: itemId,
      stocked_quantity: qty,
    });
  }
  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
    logger.info(`  created ${inventoryLevels.length} inventory level(s).`);
  }

  // -------------------------------------------------------------------------
  // R1 tripwire: cart(1 variant + Inside Valley) total must equal price + 100.
  //    On inflation, drop the VAT rate (fallback) and report tax as non-inclusive.
  //    Defensive: never fails the seed — the acceptance asserts below are the gate.
  // -------------------------------------------------------------------------
  let taxTripwire: "pass" | "fallback" | "skipped" = "skipped";
  try {
    const valleyOption = await findOne(
      "shipping_option",
      { name: "Inside Kathmandu Valley" },
      ["id"]
    );
    const testVariant = await findOne(
      "product_variant",
      { sku: "ON-GSW-CHOC-1LB" },
      ["id", "sku"]
    );
    if (valleyOption && testVariant) {
      const expected = 6200 + 100; // Rs. 6,300
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: region.id,
          sales_channel_id: salesChannel.id,
          currency_code: CURRENCY,
          email: "tripwire@proteinpasal.com",
          shipping_address: {
            first_name: "Tripwire",
            last_name: "Check",
            address_1: "Balaju",
            city: "Kathmandu",
            province: "Bagmati",
            postal_code: "44600",
            country_code: "np",
          },
          items: [{ variant_id: testVariant.id, quantity: 1 }],
        },
      });
      await addShippingMethodToCartWorkflow(container).run({
        input: { cart_id: cart.id, options: [{ id: valleyOption.id }] },
      });
      const totals = await findOne("cart", { id: cart.id }, [
        "id",
        "total",
        "item_total",
        "shipping_total",
        "tax_total",
      ]);
      const total = Number(totals?.total ?? 0);
      logger.info(
        `  R1 tripwire — cart total ${total} (expected ${expected}; item ${totals?.item_total}, shipping ${totals?.shipping_total}, tax ${totals?.tax_total}).`
      );
      if (Math.abs(total - expected) <= 1) {
        taxTripwire = "pass";
        logger.info("  R1 tripwire PASSED — tax-inclusive math is correct.");
      } else {
        // Fallback (R1): remove the VAT rate so no tax inflates totals.
        await deleteTaxRatesWorkflow(container).run({
          input: { ids: [vatRate.id] },
        });
        taxTripwire = "fallback";
        logger.warn(
          "  R1 tripwire FAILED — total inflated by tax. Dropped VAT rate (fallback). " +
            'Storefront should show "Prices include VAT" with no breakdown line.'
        );
      }
      // Best-effort cleanup of the throwaway cart.
      try {
        await cartModuleService.deleteCarts([cart.id]);
      } catch {
        /* harmless — leaving one test cart does not affect the catalog */
      }
    }
  } catch (e: any) {
    logger.warn(
      `  R1 tripwire could not run (non-fatal): ${e?.message ?? e}`
    );
    taxTripwire = "skipped";
  }

  // -------------------------------------------------------------------------
  // 14. In-script acceptance asserts + summary table (§13).
  // -------------------------------------------------------------------------
  logger.info("Verifying acceptance criteria...");
  const seededCollections = (
    await findMany("product_collection", ["id", "handle"])
  ).filter((c) => COLLECTIONS.some((s) => s.handle === c.handle));
  const seededCategories = (
    await findMany("product_category", ["id", "handle"])
  ).filter((c) => CATEGORIES.some((s) => s.handle === c.handle));
  const seededProducts = await findMany("product", ["id", "handle"], {
    handle: PRODUCTS.map((p) => p.handle),
  });
  const seededVariants = await findMany(
    "product_variant",
    ["id", "sku", "price_set.prices.amount", "price_set.prices.currency_code"],
    { product: { handle: PRODUCTS.map((p) => p.handle) } }
  );
  const variantsWithNprPrice = seededVariants.filter((v) =>
    (v.price_set?.prices ?? []).some(
      (pr: any) => pr.currency_code === CURRENCY && Number(pr.amount) > 0
    )
  ).length;

  const seededItems = await findMany(
    "inventory_item",
    ["id", "sku", "location_levels.location_id"],
    { sku: Object.keys(skuToInventory) }
  );
  const variantsWithLevel = seededItems.filter((it) =>
    (it.location_levels ?? []).some(
      (l: any) => l.location_id === stockLocation.id
    )
  ).length;

  const totalExpectedVariants = Object.keys(skuToInventory).length; // 116
  const pkOk = !!publishableApiKey?.token;

  const checks: { label: string; got: number | string; want: number | string; ok: boolean }[] = [
    { label: "Collections", got: seededCollections.length, want: 8, ok: seededCollections.length === 8 },
    { label: "Categories", got: seededCategories.length, want: 7, ok: seededCategories.length === 7 },
    { label: "Products", got: seededProducts.length, want: 24, ok: seededProducts.length === 24 },
    { label: "Variants", got: seededVariants.length, want: 116, ok: seededVariants.length === 116 },
    { label: "Variants priced (NPR)", got: variantsWithNprPrice, want: totalExpectedVariants, ok: variantsWithNprPrice === totalExpectedVariants && totalExpectedVariants === 116 },
    { label: "Variants with inventory level", got: variantsWithLevel, want: totalExpectedVariants, ok: variantsWithLevel === totalExpectedVariants && totalExpectedVariants === 116 },
    { label: "Publishable key exists", got: pkOk ? "yes" : "no", want: "yes", ok: pkOk },
  ];

  logger.info("┌───────────────────────────────────────────────┐");
  logger.info("│  Protein Pasal seed — acceptance summary        │");
  logger.info("├────────────────────────────────┬────────┬──────┤");
  for (const c of checks) {
    const row = `│ ${c.label.padEnd(30)} │ ${String(c.got).padStart(4)}/${String(
      c.want
    ).padEnd(3)} │ ${(c.ok ? "PASS" : "FAIL").padEnd(4)} │`;
    logger.info(row);
  }
  logger.info("└────────────────────────────────┴────────┴──────┘");
  logger.info(
    `  Tax mode: ${
      taxTripwire === "fallback"
        ? "NON-inclusive fallback (VAT rate dropped)"
        : "13% VAT tax-inclusive"
    } (tripwire: ${taxTripwire}).`
  );
  logger.info(`  Free-shipping promo seeded: ${promoSeeded ? "YES" : "NO"}.`);

  logger.info("");
  logger.info("========================================================");
  logger.info(" PUBLISHABLE KEY — copy into storefront/.env.local as");
  logger.info(" NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY (then restart storefront):");
  logger.info(` ${publishableApiKey?.token}`);
  logger.info("========================================================");

  const failed = checks.filter((c) => !c.ok);
  if (failed.length) {
    throw new Error(
      `Seed acceptance FAILED: ${failed
        .map((f) => `${f.label} ${f.got}/${f.want}`)
        .join("; ")}`
    );
  }
  logger.info("=== Protein Pasal seed — complete (all acceptance checks passed) ===");
}
