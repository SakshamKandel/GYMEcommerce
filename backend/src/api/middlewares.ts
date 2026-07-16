import { defineMiddlewares } from "@medusajs/framework/http"

/**
 * Guest checkout is supported: cart completion is open to unauthenticated
 * shoppers (COD-first market — most buyers won't create accounts). The
 * order's identity contract for guests is the email/phone captured on the
 * cart at the address step, which is exactly what the guest tracking
 * endpoint (POST /store/order-tracking) verifies against.
 *
 * Core completion validation (email, shipping address, shipping method,
 * payment collection) still applies inside the completeCartWorkflow, so an
 * anonymous cart can't skip straight to an order without checkout data.
 */
export default defineMiddlewares({
  routes: [],
})
