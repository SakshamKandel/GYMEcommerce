import { Module } from "@medusajs/framework/utils"
import SiteBannerModuleService from "./service"

export const SITE_BANNER_MODULE = "site_banner"

export default Module(SITE_BANNER_MODULE, {
  service: SiteBannerModuleService,
})
