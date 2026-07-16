import { declineTransferRequest } from "@lib/data/orders"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  const { success, error } = await declineTransferRequest(id, token)

  return (
    <div className="content-container flex flex-col gap-y-6 items-start max-w-lg mx-auto mt-16 mb-24">
      <TransferImage />
      <div className="flex flex-col gap-y-4">
        {success && (
          <>
            <h1 className="font-display text-3xl uppercase text-ink leading-none">
              Order transfer declined
            </h1>
            <p className="font-body text-body-sm text-ash">
              Transfer of order {id} has been successfully declined.
            </p>
          </>
        )}
        {!success && (
          <>
            <p className="font-body text-body-sm text-ash">
              There was an error declining the transfer. Please try again.
            </p>
            {error && (
              <p className="font-body text-body-sm text-red">
                Error message: {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
