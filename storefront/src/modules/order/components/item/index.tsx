import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Thumbnail from "@modules/products/components/thumbnail"
import { formatNPR } from "@lib/util/money"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item }: ItemProps) => {
  return (
    <Table.Row className="w-full border-b border-line" data-testid="product-row">
      <Table.Cell className="!pl-0 py-4 w-20">
        <Thumbnail
          thumbnail={item.thumbnail}
          size="square"
          className="!rounded-base !bg-fog !shadow-none w-16"
        />
      </Table.Cell>

      <Table.Cell className="text-left align-top py-4">
        <p
          className="font-body text-sm font-semibold uppercase text-ink"
          data-testid="product-name"
        >
          {item.product_title}
        </p>
        <p
          className="mt-1 font-body text-body-sm text-ash"
          data-testid="product-variant"
        >
          {item.variant_title}
        </p>
      </Table.Cell>

      <Table.Cell className="!pr-0 align-top py-4">
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-body text-body-sm text-ash">
            <span data-testid="product-quantity">{item.quantity}</span> ×{" "}
            {formatNPR(item.unit_price)}
          </span>
          <span
            className="font-body text-sm font-bold text-ink"
            data-testid="product-price"
          >
            {formatNPR(item.total ?? item.unit_price * item.quantity)}
          </span>
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
