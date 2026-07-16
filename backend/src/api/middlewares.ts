import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

/**
 * Orders require a logged-in customer (business rule): cart completion is
 * rejected with 401 unless the request carries a valid customer session/JWT.
 * The storefront mirrors this by routing guests to login before checkout —
 * this middleware is the hard guarantee behind that UX.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/carts/:id/complete",
      method: ["POST"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
