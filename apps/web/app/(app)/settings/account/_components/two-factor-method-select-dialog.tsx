"use client"

import { ShieldMinimalistic, Smartphone } from "@solar-icons/react"
import { Button } from "@workspace/ui/components/button"
import {
  TwoFactorFullscreenShell,
  TwoFactorSetupHeader,
} from "./two-factor-fullscreen-shell"
import { TwoFactorMethodOption } from "./two-factor-method-option"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAuthenticator: () => void
  onSelectPhone: () => void
}

export function TwoFactorMethodSelectDialog({
  open,
  onOpenChange,
  onSelectAuthenticator,
  onSelectPhone,
}: Props) {
  return (
    <TwoFactorFullscreenShell
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      }
    >
      <TwoFactorSetupHeader
        title="Add two-factor method"
        description="Choose a method to add. You can add multiple methods."
      />
      <div className="space-y-2">
        <TwoFactorMethodOption
          icon={<ShieldMinimalistic className="size-5" />}
          title="Authenticator app"
          description="Use an app to generate one-time codes."
          badge="Recommended"
          highlighted
          onClick={onSelectAuthenticator}
        />
        <TwoFactorMethodOption
          icon={<Smartphone className="size-5" />}
          title="Phone"
          description="Receive codes via SMS."
          onClick={onSelectPhone}
        />
      </div>
    </TwoFactorFullscreenShell>
  )
}
