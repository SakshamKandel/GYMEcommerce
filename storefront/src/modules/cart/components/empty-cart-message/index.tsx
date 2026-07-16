import PillButton from "@modules/common/components/pill-button"
import TrustBadgeRow from "@modules/common/components/trust-badges"

const EmptyCartMessage = () => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-24 md:py-32 px-4"
      data-testid="empty-cart-message"
    >
      <p className="font-mono text-label uppercase tracking-label text-red mb-5">
        Your bag
      </p>
      <h1 className="font-display text-display-2 uppercase text-ink leading-none">
        Your bag is <span className="text-red">empty.</span>
      </h1>
      <p className="mt-6 max-w-md font-body text-body-lg text-ash">
        Time to restock. Genuine whey, mass gainers, creatine and more —
        delivered across Nepal with Cash on Delivery.
      </p>
      <div className="mt-9">
        <PillButton href="/store" variant="red" data-testid="browse-products-button">
          Shop all
        </PillButton>
      </div>
      <div className="mt-14 w-full max-w-3xl">
        <TrustBadgeRow />
      </div>
    </div>
  )
}

export default EmptyCartMessage
