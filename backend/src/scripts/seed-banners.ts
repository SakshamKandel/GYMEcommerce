import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SITE_BANNER_MODULE } from "../modules/site-banner"
import type SiteBannerModuleService from "../modules/site-banner/service"

/**
 * Seeds the default top announcement banner (the previously hardcoded red
 * strip) so the storefront looks identical after the switch to
 * admin-managed banners. Idempotent: skips when any banner already exists.
 *
 * Run: npx medusa exec ./src/scripts/seed-banners.ts
 */
export default async function seedBanners({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: SiteBannerModuleService = container.resolve(SITE_BANNER_MODULE)

  const existing = await service.listSiteBanners({}, { take: 1 })
  if (existing.length) {
    logger.info("seed-banners: banners already exist — skipping")
    return
  }

  await service.createSiteBanners({
    name: "Top announcement",
    placement: "announcement_top",
    // Exactly the phrases the hardcoded bar shipped with. (Cast: model.json()
    // types as Record<string, unknown>, but banners store a string array.)
    messages: [
      "Cash on Delivery all over Nepal",
      "100% Authentic",
      "Free delivery over Rs. 10,000",
    ] as unknown as Record<string, unknown>,
    // bg-red / text-paper from the storefront design system.
    background_color: "#E10600",
    text_color: "#FFFFFF",
    alignment: "center",
    display_mode: "static",
    is_active: true,
    sort_order: 0,
  })

  logger.info("seed-banners: default top announcement created")
}
