import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { getOrderDetailWorkflow } from "@medusajs/core-flows"
import { orderPlacedEmail } from "../lib/email-templates"

/**
 * Order confirmation email — the guest's receipt AND their tracking
 * credential in one: it carries the #display_id tracking code plus a
 * prefilled link to /track-order (code + contact), which the guest tracking
 * endpoint verifies against the order email/phone.
 *
 * Uses getOrderDetailWorkflow (not a bare query.graph) for the same reason
 * as /store/order-tracking: orders are versioned, and only the workflow
 * resolves items/shipping methods/totals correctly.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const { result: order } = (await getOrderDetailWorkflow(container).run({
      input: {
        order_id: data.id,
        fields: [
          "id",
          "display_id",
          "email",
          "currency_code",
          "total",
          "item_total",
          "shipping_total",
          "items.*",
          "items.detail.*",
          "items.tax_lines.*",
          "items.adjustments.*",
          "shipping_address.*",
          "shipping_methods.*",
          "shipping_methods.tax_lines.*",
          "shipping_methods.adjustments.*",
        ],
      },
    })) as { result: any }

    if (!order?.email) {
      logger.warn(
        `[order-placed] order ${data.id} has no email — skipping confirmation`
      )
      return
    }

    const { subject, html } = orderPlacedEmail({
      display_id: order.display_id,
      email: order.email,
      currency_code: order.currency_code,
      total: order.total,
      item_total: order.item_total,
      shipping_total: order.shipping_total,
      items: (order.items ?? []).map((item: any) => ({
        title: item.product_title ?? item.title ?? "Item",
        variant_title: item.variant_title,
        quantity: item.quantity ?? 1,
        total: item.total,
      })),
      shipping_address: order.shipping_address,
      shipping_methods: order.shipping_methods,
    })

    const notificationModuleService = container.resolve(Modules.NOTIFICATION)
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-placed",
      content: { subject, html },
      data: { order_id: order.id, display_id: order.display_id },
    })

    logger.info(
      `[order-placed] confirmation queued for order #${order.display_id} → ${order.email}`
    )
  } catch (error) {
    // Never let a notification failure disturb order placement.
    logger.error(
      `[order-placed] failed for order ${data.id}: ${error?.message ?? error}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
