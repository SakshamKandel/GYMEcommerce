"use client"

import { Table, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { convertToLocale, formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // NPR → formatNPR (R4/R5); non-NPR keeps the starter's Intl formatter (§5.3).
  const money = (amount: number) =>
    currencyCode?.toLowerCase() === "npr"
      ? formatNPR(amount)
      : convertToLocale({ amount, currency_code: currencyCode })

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const currentTotal = item.total ?? 0
  const originalTotal = item.original_total ?? currentTotal
  const hasReducedPrice = currentTotal < originalTotal
  const unitPrice = currentTotal / (item.quantity || 1)
  const originalUnitPrice = originalTotal / (item.quantity || 1)

  return (
    <Table.Row
      className="w-full border-line last:border-b-0"
      data-testid="product-row"
    >
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <p
          className="font-body text-sm font-semibold uppercase leading-tight text-ink"
          data-testid="product-title"
        >
          {item.product_title}
        </p>
        {item.variant?.title && (
          <p
            className="mt-1 font-mono text-label-sm uppercase tracking-label text-ash"
            data-testid="product-variant"
          >
            {item.variant.title}
          </p>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex flex-col gap-2 items-start">
            <div className="flex gap-2 items-center">
              <CartItemSelect
                value={item.quantity}
                onChange={(value) =>
                  changeQuantity(parseInt(value.target.value))
                }
                className="w-14 h-10 p-4"
                data-testid="product-select-button"
              >
                {/* TODO: Update this with the v2 way of managing inventory */}
                {Array.from(
                  {
                    length: Math.min(maxQuantity, 10),
                  },
                  (_, i) => (
                    <option value={i + 1} key={i}>
                      {i + 1}
                    </option>
                  )
                )}

                <option value={1} key={1}>
                  1
                </option>
              </CartItemSelect>
              {updating && <Spinner />}
            </div>
            <DeleteButton
              id={item.id}
              data-testid="product-delete-button"
              className="[&>button]:!text-red [&>button:hover]:!text-red-deep [&>button>span]:font-mono [&>button>span]:text-label-sm [&>button>span]:uppercase [&>button>span]:tracking-label"
            >
              Remove
            </DeleteButton>
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <div className="flex flex-col items-start text-ash">
            {hasReducedPrice && (
              <span
                className="line-through text-ash/70 font-body text-body-sm tabular-nums"
                data-testid="product-unit-original-price"
              >
                {money(originalUnitPrice)}
              </span>
            )}
            <span
              className={clx("font-body text-body-sm tabular-nums", {
                "text-red font-semibold": hasReducedPrice,
                "text-ink": !hasReducedPrice,
              })}
              data-testid="product-unit-price"
            >
              {money(unitPrice)}
            </span>
          </div>
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 text-ash">
              <span className="font-mono text-label-sm">{item.quantity}x</span>
              <span className="font-body text-body-sm tabular-nums">
                {money(unitPrice)}
              </span>
            </span>
          )}
          <div className="flex flex-col items-end">
            {hasReducedPrice && (
              <span
                className="line-through text-ash/70 font-body text-body-sm tabular-nums"
                data-testid="product-original-price"
              >
                {money(originalTotal)}
              </span>
            )}
            <span
              className={clx("font-body font-bold tabular-nums", {
                "text-red": hasReducedPrice,
                "text-ink": !hasReducedPrice,
              })}
              data-testid="product-price"
            >
              {money(currentTotal)}
            </span>
          </div>
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
