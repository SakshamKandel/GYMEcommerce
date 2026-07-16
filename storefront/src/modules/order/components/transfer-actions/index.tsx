"use client"

import { acceptTransferRequest, declineTransferRequest } from "@lib/data/orders"
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })
    setErrorMessage(null)

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })
    setErrorMessage(null)

    const { success, error } = await declineTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <p className="font-body text-body-sm text-ink">
          Order transferred successfully!
        </p>
      )}
      {status?.decline === "success" && (
        <p className="font-body text-body-sm text-ink">
          Order transfer declined successfully!
        </p>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={acceptTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
            className="rounded-full bg-red px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-paper hover:bg-red-deep disabled:opacity-60"
          >
            {status?.accept === "pending" ? "Accepting…" : "Accept transfer"}
          </button>
          <button
            type="button"
            onClick={declineTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
            className="rounded-full border border-ink px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-ink hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {status?.decline === "pending" ? "Declining…" : "Decline transfer"}
          </button>
        </div>
      )}
      {errorMessage && (
        <p className="font-body text-body-sm text-red">{errorMessage}</p>
      )}
    </div>
  )
}

export default TransferActions
