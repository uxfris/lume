"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { routes } from "@/lib/routes"
import { useCheckout } from "@/app/(app)/settings/billing/_hooks/use-checkout"

export function QuotaExceededDialog({
  open,
  onOpenChange,
  message,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: string
}) {
  const { checkoutBusy, upgradeStudioPro } = useCheckout(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan limit reached</DialogTitle>
          <DialogDescription>
            {message ??
              "You've used your included Starter plan quota for this billing period. Upgrade to Studio Pro to keep transcribing meetings."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" asChild>
            <Link href={routes.settings.billing}>View plans</Link>
          </Button>
          <Button
            disabled={checkoutBusy}
            onClick={() => void upgradeStudioPro()}
          >
            Upgrade to Studio Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
