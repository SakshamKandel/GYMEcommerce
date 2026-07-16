import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const count =
    items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0

  return (
    <div>
      <div className="flex items-baseline justify-between pb-4 border-b border-line">
        <h1 className="font-display text-3xl uppercase text-ink leading-none">
          Shopping bag
        </h1>
        <span className="font-mono text-label uppercase tracking-label text-ash">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>
      <Table className="font-body">
        <Table.Header className="border-t-0 border-b border-line">
          <Table.Row className="text-ash">
            <Table.HeaderCell className="!pl-0 font-mono text-label-sm uppercase tracking-label">
              Item
            </Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell className="font-mono text-label-sm uppercase tracking-label">
              Quantity
            </Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell font-mono text-label-sm uppercase tracking-label">
              Price
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right font-mono text-label-sm uppercase tracking-label">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
