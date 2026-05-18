"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { useCheckout } from "../../billing/_hooks/use-checkout"
import Link from "next/link"
import { routes } from "@/lib/routes"

export function UpgradeProDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { checkoutBusy, upgradeStudioPro } = useCheckout(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Studio Pro</DialogTitle>
          <DialogDescription>
            Admin and Guest roles are available on Studio Pro. Upgrade your
            workspace to assign these roles and invite collaborators with
            advanced access.
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
            Upgrade now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
