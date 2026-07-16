import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import SmtpEmailProviderService from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [SmtpEmailProviderService],
})
