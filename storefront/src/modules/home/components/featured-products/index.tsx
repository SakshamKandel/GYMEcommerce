/**
 * Barrel for the home product rails (REBUILD of the starter's FeaturedProducts/ProductRail).
 * FreshStock  → newest-8 grid (03 §2.6)
 * BestSellers → "best-seller" tag, newest fallback rail (03 §2.9)
 * TrendingSection → "trending" tag only; renders nothing when untagged
 */
export { default as FreshStock } from "./fresh-stock"
export { default as BestSellers } from "./product-rail"
export { default as TrendingSection } from "./trending-rail"
