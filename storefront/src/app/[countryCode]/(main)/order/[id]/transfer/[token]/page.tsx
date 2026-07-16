import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  return (
    <div className="content-container flex flex-col gap-y-6 items-start max-w-lg mx-auto mt-16 mb-24">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        <div>
          <p className="font-mono text-label uppercase tracking-label text-red mb-2">
            Order transfer
          </p>
          <h1 className="font-display text-3xl uppercase text-ink leading-none">
            Transfer request for order {id}
          </h1>
        </div>
        <p className="font-body text-body-sm text-ash">
          You&apos;ve received a request to transfer ownership of order ({id}).
          If you agree to this request, approve the transfer below.
        </p>
        <div className="h-px w-full bg-line" />
        <p className="font-body text-body-sm text-ash">
          If you accept, the new owner takes over all responsibilities and
          permissions associated with this order.
        </p>
        <p className="font-body text-body-sm text-ash">
          If you do not recognize this request or wish to retain ownership,
          no further action is required.
        </p>
        <div className="h-px w-full bg-line" />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}
