import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatNPR } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper">
      <div className="flex flex-col small:flex-row small:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-label uppercase tracking-label text-red mb-2">
            Overview
          </p>
          <h1
            className="font-display text-3xl md:text-4xl uppercase text-ink leading-none"
            data-testid="welcome-message"
            data-value={customer?.first_name}
          >
            Namaste, {customer?.first_name}
          </h1>
        </div>
        <p className="font-body text-body-sm text-ash">
          Signed in as{" "}
          <span
            className="font-semibold text-ink"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </p>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-ink/15 border-y border-ink/15 mb-10">
        <div className="px-2 py-6 text-center">
          <dt className="sr-only">Profile completion</dt>
          <dd
            className="font-display text-4xl uppercase text-ink leading-none"
            data-testid="customer-profile-completion"
            data-value={getProfileCompletion(customer)}
          >
            {getProfileCompletion(customer)}%
          </dd>
          <p className="mt-2 font-mono text-label-sm uppercase tracking-label text-ash">
            Profile complete
          </p>
        </div>
        <div className="px-2 py-6 text-center">
          <dt className="sr-only">Saved addresses</dt>
          <dd
            className="font-display text-4xl uppercase text-ink leading-none"
            data-testid="addresses-count"
            data-value={customer?.addresses?.length || 0}
          >
            {customer?.addresses?.length || 0}
          </dd>
          <p className="mt-2 font-mono text-label-sm uppercase tracking-label text-ash">
            Saved addresses
          </p>
        </div>
      </dl>

      <div className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-body text-h4 font-semibold text-ink">
            Recent orders
          </h3>
          {!!orders?.length && (
            <LocalizedClientLink
              href="/account/orders"
              className="font-mono text-label-sm uppercase tracking-label text-ash hover:text-red"
            >
              View all →
            </LocalizedClientLink>
          )}
        </div>
        <ul className="flex flex-col gap-y-3" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => {
              return (
                <li key={order.id} data-testid="order-wrapper" data-value={order.id}>
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="group flex items-center justify-between gap-4 border border-line bg-paper px-5 py-4 transition-colors hover:border-ink"
                  >
                    <div className="grid grid-cols-3 gap-x-4 flex-1 font-body text-body-sm">
                      <span className="flex flex-col gap-0.5">
                        <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                          Date placed
                        </span>
                        <span data-testid="order-created-date">
                          {new Date(order.created_at).toDateString()}
                        </span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                          Order
                        </span>
                        <span data-testid="order-id" data-value={order.display_id}>
                          #{order.display_id}
                        </span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-mono text-label-sm uppercase tracking-label text-ash">
                          Total
                        </span>
                        <span className="font-semibold" data-testid="order-amount">
                          {formatNPR(order.total)}
                        </span>
                      </span>
                    </div>
                    <button
                      className="shrink-0 font-mono text-label-sm uppercase tracking-label text-ink group-hover:text-red"
                      data-testid="open-order-button"
                    >
                      <span className="sr-only">Go to order #{order.display_id}</span>
                      View →
                    </button>
                  </LocalizedClientLink>
                </li>
              )
            })
          ) : (
            <div className="border border-line px-5 py-8 text-center">
              <span
                className="font-body text-body-sm text-ash"
                data-testid="no-orders-message"
              >
                No recent orders
              </span>
            </div>
          )}
        </ul>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
