"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"
import { TrackedOrder, TrackOrderState } from "@modules/order/lib/tracking"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

const TRACK_NOT_FOUND =
  "We couldn't find that order with those details. Double-check your order number and the exact email or phone you used at checkout."

/**
 * Guest order-tracking action (used with `useActionState` on /track-order).
 *
 * Calls the custom backend route POST /store/order-tracking with the store
 * publishable key (added automatically by the configured Medusa SDK client).
 * The backend never distinguishes "no such order" from "wrong contact", and we
 * mirror that here: any failure yields the same neutral not-found message, so
 * the form can't be used to probe which order numbers exist.
 */
export async function trackOrder(
  _prevState: TrackOrderState,
  formData: FormData
): Promise<TrackOrderState> {
  const rawDisplayId = String(formData.get("display_id") ?? "").trim()
  const contact = String(formData.get("contact") ?? "").trim()

  // Accept "#1234", "1234", or stray spacing — reduce to the numeric id.
  const displayId = parseInt(rawDisplayId.replace(/[^0-9]/g, ""), 10)

  if (!displayId || !contact) {
    return {
      status: "error",
      order: null,
      error:
        "Enter your order number and the email or phone you used at checkout.",
    }
  }

  try {
    const { order } = await sdk.client.fetch<{ order: TrackedOrder }>(
      "/store/order-tracking",
      {
        method: "POST",
        body: { display_id: displayId, contact },
        cache: "no-store",
      }
    )

    return { status: "success", order, error: null }
  } catch (_err) {
    // Neutral message on every failure path (404 / validation / network) so we
    // never leak whether the order number itself was valid.
    return { status: "error", order: null, error: TRACK_NOT_FOUND }
  }
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
