import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  FulfillmentWorkflowEvents,
  Modules,
} from "@medusajs/framework/utils"
import { shipmentCreatedEmail } from "../lib/email-templates"

/**
 * "Your order has shipped" email, fired when the admin marks a fulfillment
 * shipped. Includes any courier tracking numbers recorded on the fulfillment
 * labels plus the same prefilled guest tracking link as the confirmation.
 */
export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const logger = container.resolve("logger")

  if (data.no_notification) {
    return
  }

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Traverse the order↔fulfillment link; scalars resolve fine here (no
    // versioned relations needed for this light-weight notice).
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      filters: { id: data.id },
      fields: [
        "id",
        "labels.*",
        "order.id",
        "order.display_id",
        "order.email",
        "order.shipping_address.first_name",
      ],
    })

    const fulfillment: any = fulfillments?.[0]
    const order = fulfillment?.order

    if (!order?.email) {
      logger.warn(
        `[shipment-created] no order email for fulfillment ${data.id} — skipping`
      )
      return
    }

    const { subject, html } = shipmentCreatedEmail({
      display_id: order.display_id,
      email: order.email,
      shipping_address: order.shipping_address,
      tracking_numbers: (fulfillment.labels ?? [])
        .map((label: any) => label?.tracking_number)
        .filter(Boolean),
    })

    const notificationModuleService = container.resolve(Modules.NOTIFICATION)
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "shipment-created",
      content: { subject, html },
      data: { order_id: order.id, fulfillment_id: fulfillment.id },
    })

    logger.info(
      `[shipment-created] shipped notice queued for order #${order.display_id} → ${order.email}`
    )
  } catch (error) {
    logger.error(
      `[shipment-created] failed for fulfillment ${data.id}: ${
        error?.message ?? error
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: FulfillmentWorkflowEvents.SHIPMENT_CREATED,
}
