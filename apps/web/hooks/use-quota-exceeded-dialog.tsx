"use client"

import { useCallback, useState } from "react"
import { QuotaExceededDialog } from "@/app/(app)/_components/billing/quota-exceeded-dialog"
import {
  getQuotaExceededMessage,
  isQuotaExceededError,
} from "@/lib/quota-errors"

export function useQuotaExceededDialog() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | undefined>()

  const showIfQuotaExceeded = useCallback((error: unknown): boolean => {
    if (!isQuotaExceededError(error)) return false
    setMessage(getQuotaExceededMessage(error))
    setOpen(true)
    return true
  }, [])

  const quotaExceededDialog = (
    <QuotaExceededDialog
      open={open}
      onOpenChange={setOpen}
      message={message}
    />
  )

  return { showIfQuotaExceeded, quotaExceededDialog }
}
