"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { useEffect, useState } from "react"
import QRCode from "react-qr-code"
import { toast } from "sonner"
import {
  getAuthErrorMessage,
  parseTotpSecret,
} from "../_lib/two-factor"
import { TwoFactorCodeInput } from "./two-factor-code-input"
import {
  TwoFactorFullscreenShell,
  TwoFactorSetupHeader,
} from "./two-factor-fullscreen-shell"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onEnabled: () => void
}

export function TwoFactorAuthenticatorSetupDialog({
  open,
  onOpenChange,
  onCancel,
  onEnabled,
}: Props) {
  const [verificationCode, setVerificationCode] = useState("")
  const [showManualCode, setShowManualCode] = useState(false)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isEnabling, setIsEnabling] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const manualCode = totpUri ? parseTotpSecret(totpUri) : null
  const isVerificationCodeValid = verificationCode.length === 6

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const enable = async () => {
      setIsEnabling(true)
      setTotpUri(null)
      setBackupCodes([])

      const { data, error } = await authClient.twoFactor.enable({})
      if (cancelled) return

      if (error || !data) {
        toast.error("Failed to start authenticator setup", {
          description: getAuthErrorMessage(
            error,
            "Could not generate authenticator credentials"
          ),
        })
        setIsEnabling(false)
        onCancel()
        return
      }

      setTotpUri(data.totpURI)
      setBackupCodes(data.backupCodes)
      setIsEnabling(false)
    }

    void enable()

    return () => {
      cancelled = true
    }
  }, [open, onCancel])

  const resetState = () => {
    setVerificationCode("")
    setShowManualCode(false)
    setTotpUri(null)
    setBackupCodes([])
    setIsEnabling(false)
    setIsVerifying(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState()
    onOpenChange(nextOpen)
  }

  const handleCancel = () => {
    resetState()
    onCancel()
  }

  const handleVerify = async () => {
    if (!isVerificationCodeValid) return

    setIsVerifying(true)
    const { error } = await authClient.twoFactor.verifyTotp({
      code: verificationCode,
    })
    setIsVerifying(false)

    if (error) {
      toast.error("Invalid code", {
        description: getAuthErrorMessage(error, "Please try again"),
      })
      return
    }

    await authClient.getSession()
    toast.success("Two-factor authentication enabled", {
      description: "Authenticator app is now active for your account.",
    })
    resetState()
    onEnabled()
  }

  return (
    <TwoFactorFullscreenShell
      open={open}
      onOpenChange={handleOpenChange}
      footer={
        <>
          <Button variant="outline" onClick={handleCancel} disabled={isVerifying}>
            Cancel
          </Button>
          <Button
            disabled={!isVerificationCodeValid || isEnabling || isVerifying}
            onClick={() => void handleVerify()}
          >
            {isVerifying ? "Verifying…" : "Verify & Enable"}
          </Button>
        </>
      }
    >
      <TwoFactorSetupHeader
        title="Set up authenticator app"
        description="Scan the QR code with your authenticator app, then enter the 6-digit code."
      />
      <div className="flex flex-col items-center justify-center gap-3">
        <div
          className="flex size-44 items-center justify-center rounded-md border border-border bg-white p-3"
          aria-hidden
        >
          {isEnabling ? (
            <p className="text-sm text-muted-foreground">Loading QR code…</p>
          ) : totpUri ? (
            <QRCode value={totpUri} size={152} />
          ) : (
            <p className="text-sm text-muted-foreground">QR code unavailable</p>
          )}
        </div>
        <div className="w-full">
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => setShowManualCode((current) => !current)}
            disabled={!manualCode}
          >
            Manual code?
          </button>
          {showManualCode && manualCode && (
            <div className="mt-2 flex">
              <p className="rounded-md border border-border bg-secondary px-3 py-2 font-mono text-sm">
                {manualCode}
              </p>
            </div>
          )}
        </div>
      </div>
      {backupCodes.length > 0 && (
        <div className="rounded-md border border-dashed border-border p-4">
          <p className="text-sm font-semibold">Backup codes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Save these codes in a secure place. Each can be used once if you lose
            access to your authenticator.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code) => (
              <li key={code} className="rounded bg-secondary px-2 py-1">
                {code}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Field className="gap-2">
        <FieldLabel className="text-sm font-semibold text-foreground normal-case">
          Enter the code
        </FieldLabel>
        <TwoFactorCodeInput
          value={verificationCode}
          onChange={setVerificationCode}
        />
      </Field>
    </TwoFactorFullscreenShell>
  )
}
