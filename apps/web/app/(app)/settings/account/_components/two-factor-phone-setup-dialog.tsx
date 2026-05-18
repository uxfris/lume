"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useState } from "react"
import { toast } from "sonner"
import {
  formatE164Phone,
  getAuthErrorMessage,
} from "../_lib/two-factor"
import { TwoFactorCodeInput } from "./two-factor-code-input"
import {
  TwoFactorFullscreenShell,
  TwoFactorSetupHeader,
} from "./two-factor-fullscreen-shell"

const COUNTRY_CODES = [
  { value: "US", label: "US", dialCode: "+1" },
  { value: "GB", label: "GB", dialCode: "+44" },
  { value: "CA", label: "CA", dialCode: "+1" },
] as const

type Step = "phone" | "verify-phone" | "verify-2fa"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onEnabled: () => void
}

export function TwoFactorPhoneSetupDialog({
  open,
  onOpenChange,
  onCancel,
  onEnabled,
}: Props) {
  const [step, setStep] = useState<Step>("phone")
  const [countryCode, setCountryCode] = useState("US")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [twoFactorOtp, setTwoFactorOtp] = useState("")
  const [e164Phone, setE164Phone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCountry =
    COUNTRY_CODES.find((country) => country.value === countryCode) ??
    COUNTRY_CODES[0]

  const isPhoneValid = phoneNumber.trim().length >= 6
  const isPhoneOtpValid = phoneOtp.length === 6
  const isTwoFactorOtpValid = twoFactorOtp.length === 6

  const resetState = () => {
    setStep("phone")
    setCountryCode("US")
    setPhoneNumber("")
    setPhoneOtp("")
    setTwoFactorOtp("")
    setE164Phone("")
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState()
    onOpenChange(nextOpen)
  }

  const handleCancel = () => {
    resetState()
    onCancel()
  }

  const handleSendPhoneCode = async () => {
    if (!isPhoneValid) return

    const formatted = formatE164Phone(selectedCountry.dialCode, phoneNumber)
    setIsSubmitting(true)

    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: formatted,
    })

    setIsSubmitting(false)

    if (error) {
      toast.error("Failed to send code", {
        description: getAuthErrorMessage(error, "Please try again"),
      })
      return
    }

    setE164Phone(formatted)
    setStep("verify-phone")
    toast.success("Code sent", {
      description: `We sent a verification code to ${formatted}.`,
    })
  }

  const handleVerifyPhone = async () => {
    if (!isPhoneOtpValid || !e164Phone) return

    setIsSubmitting(true)

    const { error: verifyError } = await authClient.phoneNumber.verify({
      phoneNumber: e164Phone,
      code: phoneOtp,
      updatePhoneNumber: true,
    })

    if (verifyError) {
      setIsSubmitting(false)
      toast.error("Invalid code", {
        description: getAuthErrorMessage(verifyError, "Please try again"),
      })
      return
    }

    const { error: enableError } = await authClient.twoFactor.enable({})
    if (enableError) {
      setIsSubmitting(false)
      toast.error("Failed to enable SMS 2FA", {
        description: getAuthErrorMessage(enableError, "Please try again"),
      })
      return
    }

    const { error: sendError } = await authClient.twoFactor.sendOtp({})
    setIsSubmitting(false)

    if (sendError) {
      toast.error("Failed to send 2FA code", {
        description: getAuthErrorMessage(sendError, "Please try again"),
      })
      return
    }

    setStep("verify-2fa")
    toast.success("Phone verified", {
      description: "Enter the code we sent to finish enabling SMS 2FA.",
    })
  }

  const handleVerifyTwoFactor = async () => {
    if (!isTwoFactorOtpValid) return

    setIsSubmitting(true)
    const { error } = await authClient.twoFactor.verifyOtp({
      code: twoFactorOtp,
    })
    setIsSubmitting(false)

    if (error) {
      toast.error("Invalid code", {
        description: getAuthErrorMessage(error, "Please try again"),
      })
      return
    }

    await authClient.getSession()
    toast.success("Two-factor authentication enabled", {
      description: "SMS codes will be sent to your phone when you sign in.",
    })
    resetState()
    onEnabled()
  }

  const headerByStep: Record<Step, { title: string; description: string }> = {
    phone: {
      title: "Set up phone",
      description: "Add your phone number to receive 6-digit codes via SMS.",
    },
    "verify-phone": {
      title: "Verify your phone",
      description: `Enter the code sent to ${e164Phone}.`,
    },
    "verify-2fa": {
      title: "Confirm SMS 2FA",
      description: `Enter the code sent to ${e164Phone} to finish setup.`,
    },
  }

  const header = headerByStep[step]

  return (
    <TwoFactorFullscreenShell
      open={open}
      onOpenChange={handleOpenChange}
      footer={
        <>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          {step === "phone" && (
            <Button
              disabled={!isPhoneValid || isSubmitting}
              onClick={() => void handleSendPhoneCode()}
            >
              {isSubmitting ? "Sending…" : "Send code"}
            </Button>
          )}
          {step === "verify-phone" && (
            <Button
              disabled={!isPhoneOtpValid || isSubmitting}
              onClick={() => void handleVerifyPhone()}
            >
              {isSubmitting ? "Verifying…" : "Continue"}
            </Button>
          )}
          {step === "verify-2fa" && (
            <Button
              disabled={!isTwoFactorOtpValid || isSubmitting}
              onClick={() => void handleVerifyTwoFactor()}
            >
              {isSubmitting ? "Verifying…" : "Verify & Enable"}
            </Button>
          )}
        </>
      }
    >
      <TwoFactorSetupHeader
        title={header.title}
        description={header.description}
      />

      {step === "phone" && (
        <>
          <Field className="gap-2">
            <FieldLabel className="text-sm font-semibold normal-case text-foreground">
              Phone number
            </FieldLabel>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[110px] shrink-0">
                  <SelectValue>
                    {selectedCountry.label} {selectedCountry.dialCode}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {COUNTRY_CODES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label} {country.dialCode}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="min-w-0 flex-1"
              />
            </div>
          </Field>
          <p className="text-xs text-muted-foreground">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </>
      )}

      {step === "verify-phone" && (
        <Field className="gap-2">
          <FieldLabel className="text-sm font-semibold text-foreground normal-case">
            Verification code
          </FieldLabel>
          <TwoFactorCodeInput value={phoneOtp} onChange={setPhoneOtp} />
        </Field>
      )}

      {step === "verify-2fa" && (
        <Field className="gap-2">
          <FieldLabel className="text-sm font-semibold text-foreground normal-case">
            Verification code
          </FieldLabel>
          <TwoFactorCodeInput value={twoFactorOtp} onChange={setTwoFactorOtp} />
        </Field>
      )}
    </TwoFactorFullscreenShell>
  )
}
