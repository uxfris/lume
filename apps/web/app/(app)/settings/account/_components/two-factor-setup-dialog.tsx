"use client"

import { useEffect, useState } from "react"
import { TwoFactorAuthenticatorSetupDialog } from "./two-factor-authenticator-setup-dialog"
import { TwoFactorMethodSelectDialog } from "./two-factor-method-select-dialog"
import { TwoFactorPhoneSetupDialog } from "./two-factor-phone-setup-dialog"

type ActiveDialog = "method" | "phone" | "authenticator"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  onComplete,
}: Props) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null)

  useEffect(() => {
    if (open) setActiveDialog("method")
    else setActiveDialog(null)
  }, [open])

  const closeFlow = () => {
    setActiveDialog(null)
    onOpenChange(false)
  }

  const handleEnabled = () => {
    setActiveDialog(null)
    onOpenChange(false)
    onComplete()
  }

  return (
    <>
      <TwoFactorMethodSelectDialog
        open={activeDialog === "method"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeFlow()
        }}
        onSelectAuthenticator={() => setActiveDialog("authenticator")}
      />
      <TwoFactorPhoneSetupDialog
        open={activeDialog === "phone"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setActiveDialog("method")
        }}
        onCancel={() => setActiveDialog("method")}
        onEnabled={handleEnabled}
      />
      <TwoFactorAuthenticatorSetupDialog
        open={activeDialog === "authenticator"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setActiveDialog("method")
        }}
        onCancel={() => setActiveDialog("method")}
        onEnabled={handleEnabled}
      />
    </>
  )
}
