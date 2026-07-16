import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BreadcrumbProps = {
  product: HttpTypes.StoreProduct
}

const Separator = () => (
  <span aria-hidden="true" className="mx-2 text-line select-none">
    /
  </span>
)

/**
 * PDP breadcrumb — Home / {Brand} / {Category} / {Title}
 * Brand = Medusa Collection, Category = product type category (04 handles).
 * Every crumb is optional-tolerant: renders only the links that exist so a
 * product with no collection/category never yields a broken trail.
 */
const Breadcrumb = ({ product }: BreadcrumbProps) => {
  const collection = product.collection
  const category = product.categories?.[0]

  return (
    <nav
      aria-label="Breadcrumb"
      data-testid="product-breadcrumb"
      className="font-mono text-label-sm uppercase tracking-label text-ash"
    >
      <ol className="flex flex-wrap items-center leading-none">
        <li>
          <LocalizedClientLink
            href="/"
            className="transition-colors hover:text-red"
          >
            Home
          </LocalizedClientLink>
        </li>

        {collection && (
          <li className="flex items-center">
            <Separator />
            <LocalizedClientLink
              href={`/collections/${collection.handle}`}
              className="transition-colors hover:text-red"
            >
              {collection.title}
            </LocalizedClientLink>
          </li>
        )}

        {category && (
          <li className="flex items-center">
            <Separator />
            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              className="transition-colors hover:text-red"
            >
              {category.name}
            </LocalizedClientLink>
          </li>
        )}

        <li className="flex items-center">
          <Separator />
          <span
            aria-current="page"
            className="max-w-[52vw] truncate text-ink normal-case tracking-normal small:max-w-[24rem]"
          >
            {product.title}
          </span>
        </li>
      </ol>
    </nav>
  )
}

export default Breadcrumb
