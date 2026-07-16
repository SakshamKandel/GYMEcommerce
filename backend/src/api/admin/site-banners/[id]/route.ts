import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_BANNER_MODULE } from "../../../../modules/site-banner"
import type SiteBannerModuleService from "../../../../modules/site-banner/service"
import { sanitizeBannerInput } from "../validators"

/** POST /admin/site-banners/:id — partial update (Medusa convention). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: SiteBannerModuleService = req.scope.resolve(SITE_BANNER_MODULE)

  const { data, error } = sanitizeBannerInput(req.body, { partial: true })
  if (error) {
    return res.status(400).json({ message: error })
  }

  const banner = await service.updateSiteBanners({
    id: req.params.id,
    ...data,
  } as any)

  res.json({ banner })
}

/** DELETE /admin/site-banners/:id */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service: SiteBannerModuleService = req.scope.resolve(SITE_BANNER_MODULE)

  await service.deleteSiteBanners(req.params.id)

  res.json({ id: req.params.id, object: "site_banner", deleted: true })
}
