"use client"

import { authClient } from "@/lib/auth-client"
import { Card, CardContent } from "@workspace/ui/components/card"
import { SettingSection } from "../../_components/setting-section"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ShieldMinimalistic } from "@solar-icons/react"
import { useState } from "react"
import { toast } from "sonner"
import { useDisableTwoFactorMutation } from "../_hooks/use-disable-two-factor-mutation"
import { isTwoFactorEnabled } from "../_lib/two-factor"
import { TwoFactorSetupDialog } from "./two-factor-setup-dialog"

export function TwoFactorAuthSetting() {
  const { data: session, refetch } = authClient.useSession()
  const disableTwoFactor = useDisableTwoFactorMutation()
  const [setupOpen, setSetupOpen] = useState(false)

  const twoFactorEnabled = isTwoFactorEnabled(session?.user)

  const handleDisable = async () => {
    try {
      await disableTwoFactor.mutateAsync()
      await refetch()
      toast.success("Two-factor authentication disabled")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to disable 2FA"
      toast.error("Failed to disable 2FA", { description: message })
    }
  }

  return (
    <Card className="py-2">
      <CardContent className="px-5">
        <SettingSection
          title="Two-factor authentication"
          description="Secure your account with one-time code via authenticator app or SMS."
          borderBottom={false}
        >
          {twoFactorEnabled ? (
            <div className="flex flex-col justify-between gap-4 rounded-md border border-dashed p-5 md:items-center lg:flex-row lg:gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-full bg-secondary p-2">
                  <ShieldMinimalistic />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">
                      Two-factor authentication is on
                    </h2>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your account requires a second factor when signing in with
                    email and password.
                  </p>
                </div>
              </div>
              <div className="w-full shrink-0 lg:w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={disableTwoFactor.isPending}
                  onClick={() => void handleDisable()}
                >
                  {disableTwoFactor.isPending ? "Disabling…" : "Disable"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSetupOpen(true)}>
                Enable
              </Button>
            </div>
          )}
        </SettingSection>
      </CardContent>

      <TwoFactorSetupDialog
        open={setupOpen}
        onOpenChange={setSetupOpen}
        onComplete={() => void refetch()}
      />
    </Card>
  )
}
