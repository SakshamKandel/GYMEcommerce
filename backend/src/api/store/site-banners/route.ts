import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_BANNER_MODULE } from "../../../modules/site-banner"
import type SiteBannerModuleService from "../../../modules/site-banner/service"

const PLACEMENTS = ["announcement_top", "footer_ticker"]

/**
 * GET /store/site-banners?placement=announcement_top
 *
 * Public read of ACTIVE banners only — the storefront renders exactly this
 * list, so deactivating a banner in the admin removes it from the site (the
 * storefront caches for ~60s). Only display-safe fields are returned.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: SiteBannerModuleService = req.scope.resolve(SITE_BANNER_MODULE)

  const placement = typeof req.query.placement === "string" ? req.query.placement : undefined

  if (placement && !PLACEMENTS.includes(placement)) {
    return res.status(400).json({
      message: `\`placement\` must be one of: ${PLACEMENTS.join(", ")}`,
    })
  }

  const banners = await service.listSiteBanners(
    {
      is_active: true,
      ...(placement ? { placement } : {}),
    },
    { order: { sort_order: "ASC", created_at: "ASC" } }
  )

  res.json({
    banners: banners.map((banner) => ({
      id: banner.id,
      placement: banner.placement,
      messages: banner.messages,
      link_url: banner.link_url,
      background_color: banner.background_color,
      text_color: banner.text_color,
      alignment: banner.alignment,
      display_mode: banner.display_mode,
    })),
  })
}
