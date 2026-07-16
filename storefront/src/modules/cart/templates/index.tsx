import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const hasItems = !!cart?.items?.length

  return (
    <div className="bg-paper min-h-[60vh]">
      <div className="content-container py-10 md:py-14" data-testid="cart-container">
        {hasItems ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_380px] gap-y-10 small:gap-x-12 medium:gap-x-16">
            <div className="flex flex-col gap-y-6">
              {!customer && <SignInPrompt />}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative">
              <div className="sticky top-6">
                {cart && cart.region && (
                  <Summary cart={cart as any} customer={customer} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
