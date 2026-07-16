import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const formatStatus = (str?: string | null) => {
  if (!str) return "—"
  const formatted = str.split("_").join(" ")
  return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <div
      className="flex flex-col gap-5 border border-line bg-paper p-5 md:p-6"
      data-testid="order-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display text-2xl uppercase text-ink leading-none">
            #<span data-testid="order-display-id">{order.display_id}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-body-sm text-ash">
            <span data-testid="order-created-at">
              {new Date(order.created_at).toDateString()}
            </span>
            <span className="text-line">·</span>
            <span data-testid="order-amount" className="font-semibold text-ink">
              {formatNPR(order.total)}
            </span>
            <span className="text-line">·</span>
            <span>{`${numberOfLines} ${numberOfLines === 1 ? "item" : "items"}`}</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 border border-ink/20 px-3 py-1.5 font-mono text-label-sm uppercase tracking-label text-ash">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          {formatStatus(order.fulfillment_status)}
        </span>
      </div>

      <div className="grid grid-cols-3 small:grid-cols-4 gap-3">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div key={i.id} className="flex flex-col gap-y-2" data-testid="order-item">
              <Thumbnail
                thumbnail={i.thumbnail}
                images={[]}
                size="full"
                className="!rounded-base !bg-fog !shadow-none"
              />
              <div className="flex items-baseline gap-1 font-body text-body-sm text-ash">
                <span className="text-ink font-medium truncate" data-testid="item-title">
                  {i.title}
                </span>
                <span className="shrink-0">×{" "}
                  <span data-testid="item-quantity">{i.quantity}</span>
                </span>
              </div>
            </div>
          )
        })}
        {numberOfProducts > 3 && (
          <div className="flex flex-col items-center justify-center border border-dashed border-line font-body text-body-sm text-ash aspect-[9/16]">
            <span>+{numberOfProducts - 3}</span>
            <span>more</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <LocalizedClientLink
          href={`/account/orders/details/${order.id}`}
          className="font-mono text-label uppercase tracking-label text-ink hover:text-red"
          data-testid="order-details-link"
        >
          View order →
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
