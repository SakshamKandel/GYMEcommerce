import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_BANNER_MODULE } from "../../../modules/site-banner"
import type SiteBannerModuleService from "../../../modules/site-banner/service"
import { sanitizeBannerInput } from "./validators"

/** GET /admin/site-banners — full list for the admin page (auth: admin). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: SiteBannerModuleService = req.scope.resolve(SITE_BANNER_MODULE)

  const banners = await service.listSiteBanners(
    {},
    { order: { placement: "ASC", sort_order: "ASC", created_at: "ASC" } }
  )

  res.json({ banners })
}

/** POST /admin/site-banners — create a banner. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: SiteBannerModuleService = req.scope.resolve(SITE_BANNER_MODULE)

  const { data, error } = sanitizeBannerInput(req.body, { partial: false })
  if (error) {
    return res.status(400).json({ message: error })
  }

  const banner = await service.createSiteBanners(data as any)
  res.status(201).json({ banner })
}
